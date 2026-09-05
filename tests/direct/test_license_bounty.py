import hashlib
import json


REPO = "https://github.com/acme/license-demo"
COMMIT = "a" * 40
LICENSE_URL = f"https://raw.githubusercontent.com/acme/license-demo/{COMMIT}/LICENSE"
PACKAGE_URL = f"https://raw.githubusercontent.com/acme/license-demo/{COMMIT}/package.json"
TREE_URL = f"https://api.github.com/repos/acme/license-demo/git/trees/{COMMIT}?recursive=1"
LICENSE_BODY = b"MIT License\nPermission is hereby granted, free of charge.\n"
PACKAGE_BODY = b'{"name":"license-demo","dependencies":{"safe-lib":"1.0.0"}}'


def wallet(address_bytes):
    return "0x" + address_bytes.hex()


def configure_repo(direct_vm, license_body=LICENSE_BODY, package_body=PACKAGE_BODY, tree_status=200):
    direct_vm.mock_web(
        r"https://api\.github\.com/repos/acme/license-demo/git/trees/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\?recursive=1",
        {"status": tree_status, "body": json.dumps({"tree": [{"path": "LICENSE", "type": "blob"}, {"path": "package.json", "type": "blob"}]}).encode()},
    )
    direct_vm.mock_web(
        r"https://raw\.githubusercontent\.com/acme/license-demo/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/LICENSE",
        {"status": 200, "body": license_body},
    )
    direct_vm.mock_web(
        r"https://raw\.githubusercontent\.com/acme/license-demo/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/package\.json",
        {"status": 200, "body": package_body},
    )


def configure_evaluation_llm(direct_vm, verdict="COMPLIANT", score=96):
    direct_vm.mock_llm(
        r".*lead license-compliance adjudicator.*",
        json.dumps(
            {
                "verdict": verdict,
                "confidence": "HIGH",
                "score": score,
                "summary": "The pinned repository declares an allowed license and contains no observed prohibited license.",
                "license_detected": "MIT",
                "license_confidence": "HIGH",
                "dependency_count": 1,
                "problematic_dependencies": [],
                "attribution_present": True,
                "prohibited_findings": [],
                "checks": {"license_policy": "PASS", "dependency_policy": "PASS", "attribution": "PASS", "prohibited_license_scan": "PASS"},
                "required_actions": "",
                "citations": [LICENSE_URL, PACKAGE_URL],
            }
        ),
    )
    direct_vm.mock_llm(
        r".*independent validator of a license-compliance result.*",
        json.dumps({"acceptable": True, "reason": "The proposed result is grounded in the verified commit evidence."}),
    )


def create_and_accept(contract, direct_vm, sponsor, developer):
    direct_vm.sender = sponsor
    direct_vm.value = 10**18
    contract.create_bounty(
        "license-demo-001",
        "Open-source API bounty",
        wallet(developer),
        "The repository must use an allowed permissive license, disclose attribution, and contain no prohibited dependency license.",
        "MIT\nApache-2.0\nBSD-3-Clause",
        "GPL-3.0\nAGPL-3.0",
        True,
        False,
        1893450000,
        3600,
        300,
        7000,
    )
    bounty = json.loads(contract.get_bounty("license-demo-001"))
    direct_vm.sender = developer
    direct_vm.value = 0
    contract.accept_bounty("license-demo-001", bounty["terms_hash"])


def submit(contract, direct_vm, developer):
    direct_vm.sender = developer
    direct_vm.value = 0
    contract.submit_repository(
        "license-demo-001",
        REPO,
        COMMIT,
        "",
        "I confirm that this exact commit is the work submitted for the bounty and that the license information is complete.",
    )


def test_acceptance_binds_immutable_terms_and_submission_requires_full_commit(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/license_bounty.py")
    create_and_accept(contract, direct_vm, direct_alice, direct_bob)
    bounty = json.loads(contract.get_bounty("license-demo-001"))
    assert bounty["developer_accepted"] is True
    assert bounty["escrow_remaining_wei"] == str(10**18)

    with direct_vm.expect_revert("Repository reference must contain a full lowercase 40-character commit SHA"):
        contract.submit_repository(
            "license-demo-001",
            REPO,
            "main",
            "",
            "This attestation is long enough for the input validation branch.",
        )


def test_full_consensus_compliant_review_records_hashes_and_verdict(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/license_bounty.py")
    create_and_accept(contract, direct_vm, direct_alice, direct_bob)
    submit(contract, direct_vm, direct_bob)
    configure_repo(direct_vm)
    configure_evaluation_llm(direct_vm)

    direct_vm.sender = direct_alice
    contract.evaluate_compliance("license-demo-001")

    bounty = json.loads(contract.get_bounty("license-demo-001"))
    evaluation = json.loads(contract.get_latest_evaluation("license-demo-001"))
    assert bounty["status"] == "EVALUATED"
    assert bounty["current_verdict"] == "COMPLIANT"
    assert evaluation["commit_sha"] == COMMIT
    assert evaluation["evidence_status"] == "VERIFIED"
    assert evaluation["license_paths"] == ["LICENSE"]
    assert evaluation["manifest_paths"] == ["package.json"]
    assert evaluation["evidence_hashes"][0]["sha256"] == hashlib.sha256(LICENSE_BODY).hexdigest()
    assert direct_vm.run_validator() is True


def test_unavailable_github_evidence_holds_funds_and_cannot_settle_early(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/license_bounty.py")
    create_and_accept(contract, direct_vm, direct_alice, direct_bob)
    submit(contract, direct_vm, direct_bob)
    configure_repo(direct_vm, tree_status=503)
    direct_vm.sender = direct_alice
    contract.evaluate_compliance("license-demo-001")

    bounty = json.loads(contract.get_bounty("license-demo-001"))
    evaluation = json.loads(contract.get_latest_evaluation("license-demo-001"))
    assert bounty["status"] == "EVIDENCE_REVIEW"
    assert bounty["settlement_action"] == "HOLD_FOR_EVIDENCE_RETRY"
    assert evaluation["evidence_status"] == "UNAVAILABLE"

    with direct_vm.expect_revert("Bounty is still within its protected review period"):
        contract.settle_bounty("license-demo-001")


def test_challenge_reopens_window_without_losing_original_audit_record(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/license_bounty.py")
    create_and_accept(contract, direct_vm, direct_alice, direct_bob)
    submit(contract, direct_vm, direct_bob)
    configure_repo(direct_vm)
    configure_evaluation_llm(direct_vm)
    direct_vm.sender = direct_alice
    contract.evaluate_compliance("license-demo-001")

    challenge_url = "https://raw.githubusercontent.com/acme/license-demo/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/NOTICE"
    direct_vm.mock_web(
        r"https://raw\.githubusercontent\.com/acme/license-demo/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/NOTICE",
        {"status": 200, "body": b"Attribution notice for safe-lib\n"},
    )
    direct_vm.mock_llm(
        r".*independent appeals adjudicator.*",
        json.dumps({"challenge_result": "UPHELD", "uphold_original": True, "revised_verdict": "COMPLIANT", "revised_score": 96, "summary": "The challenge does not establish a material error."}),
    )
    direct_vm.sender = direct_bob
    contract.challenge_verdict(
        "license-demo-001",
        "challenge-license-001",
        "The sponsor's concern is addressed by the pinned attribution notice; please re-check the committed evidence.",
        challenge_url,
    )

    bounty = json.loads(contract.get_bounty("license-demo-001"))
    challenge = json.loads(contract.get_challenge("challenge-license-001"))
    assert bounty["status"] == "CHALLENGE_REVIEWED"
    assert bounty["current_verdict"] == "COMPLIANT"
    assert challenge["challenge_result"] == "UPHELD"
    assert json.loads(contract.get_evaluation("license-demo-001", 1))["commit_sha"] == COMMIT


def test_unavailable_challenge_evidence_records_safe_result_without_unpack_error(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/license_bounty.py")
    create_and_accept(contract, direct_vm, direct_alice, direct_bob)
    submit(contract, direct_vm, direct_bob)
    configure_repo(direct_vm)
    configure_evaluation_llm(direct_vm)
    direct_vm.sender = direct_alice
    contract.evaluate_compliance("license-demo-001")

    challenge_url = "https://registry.npmjs.org/example-package/1.0.0"
    direct_vm.mock_web(
        r"https://registry\.npmjs\.org/example-package/1\.0\.0",
        {"status": 503, "body": b""},
    )
    direct_vm.sender = direct_bob
    contract.challenge_verdict(
        "license-demo-001",
        "challenge-license-unavailable",
        "The original review left a dependency license unverified; please re-check the official package evidence.",
        challenge_url,
    )

    bounty = json.loads(contract.get_bounty("license-demo-001"))
    challenge = json.loads(contract.get_challenge("challenge-license-unavailable"))
    assert bounty["status"] == "CHALLENGE_REVIEWED"
    assert bounty["challenge_count"] == 1
    assert challenge["challenge_result"] == "EVIDENCE_UNAVAILABLE"
    assert challenge["uphold_original"] is True
