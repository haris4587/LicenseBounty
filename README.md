# LicenseBounty

LicenseBounty is a GenLayer Intelligent Contract for escrowed software bounties whose acceptance depends on interpreting a pinned code repository, license files, dependency manifests, attribution, and human-written licensing rules.

It combines deterministic commitment checks with validator consensus:

1. A sponsor creates a GEN-funded bounty and locks immutable license rules.
2. The designated developer accepts the exact `terms_hash`.
3. The developer submits a public GitHub repository at a full 40-character commit SHA.
4. GenLayer independently fetches the commit tree, license files, manifests, and optional dependency evidence.
5. Validators agree on `COMPLIANT`, `PARTIALLY_COMPLIANT`, or `REJECTED`.
6. Either party can submit counter-evidence during a bounded challenge window.
7. Anyone can settle after finality; timeout paths refund the sponsor if evidence or submission never becomes usable.

## Contract

The canonical contract is [`contracts/license_bounty.py`](contracts/license_bounty.py). It is intentionally a single contract with a strict boundary:

- deterministic code validates IDs, addresses, HTTPS URLs, GitHub slugs, commit SHAs, rule lists, deadlines, and evidence manifests;
- only `_evaluate_consensus` and `_challenge_consensus` perform web/LLM operations;
- repository files are treated as untrusted data and never as prompt instructions;
- evidence is stored with SHA-256 digests and byte lengths;
- native GEN is released only after a finalized consensus result and challenge window;
- partial decisions split funds according to the locked `partial_payout_bps` rule;
- cancellation, deadline expiry, and evidence-retry paths prevent permanent locks.

## Public methods

| Method | Purpose |
| --- | --- |
| `create_bounty(...)` payable | Creates the immutable rule set and locks GEN. |
| `accept_bounty(bounty_id, terms_hash)` | Developer acknowledges the exact rules. |
| `submit_repository(...)` | Commits a developer submission to a GitHub commit. |
| `evaluate_compliance(bounty_id)` | Runs the first Full Consensus compliance review. |
| `retry_evaluation(bounty_id)` | Retries temporarily unavailable evidence without releasing funds. |
| `challenge_verdict(...)` | Runs a bounded counter-evidence review. |
| `settle_bounty(bounty_id)` | Releases, splits, or refunds escrow after finality/timeout. |
| `cancel_bounty(bounty_id)` | Lets the sponsor recover an unaccepted bounty. |

Read methods return JSON strings for simple dApp integration: `get_bounty`, `get_submission`, `get_evaluation`, `get_latest_evaluation`, `get_challenge`, `get_recent_bounty_ids`, `get_recent_challenge_ids`, and `get_totals`.

## Demo scenario

The included demo uses a repository pinned to a GitHub commit. The bounty allows MIT, Apache-2.0, BSD-2-Clause, and BSD-3-Clause; rejects GPL-3.0 and AGPL-3.0; requires an attribution notice; and allows a 70% developer payout for a material but remediable issue. A compliant result releases 100%, a partial result splits escrow 70/30, and a rejected result refunds the sponsor.

## Run locally

The direct tests are designed for the GenLayer test runner. They cover terms acceptance, exact-commit validation, evidence hash binding, compliant/partial/rejected outcomes, challenges, retry protection, and timeout settlement.

```bash
pip install -r requirements-dev.txt
genlayer test tests/direct
```

The frontend handoff is in [`website/Genspark_Prompt.md`](website/Genspark_Prompt.md). It requires MetaMask connection before any dApp action, switches to GenLayer Studio (`chainId 61999`, RPC `https://studio.genlayer.com/api`), uses `genlayer-js`, and surfaces real transaction/finality states. No fake wallet, verdict, or transaction data is allowed.

## Deployment

Follow [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) in GenLayer Studio. Wallet signatures are performed by the user in MetaMask; private keys never enter this repository. Record the deployed contract address, deployment transaction hash, first finalized Full Consensus transaction hash, website URL, and final GitHub commit SHA in [`docs/DEPLOYMENT_RECORD.md`](docs/DEPLOYMENT_RECORD.md).

## Limitations

This is a public-evidence prototype, not legal advice and not a replacement for a professional license audit. GitHub rate limits, removed commits, oversized trees, binary-only license evidence, and unresolvable dependency licenses are treated conservatively and keep funds held or route them to the timeout refund. A successful GenLayer transaction means the validators reached consensus on execution; the dApp must still display finality before claiming settlement.

## License

MIT. See [`LICENSE`](LICENSE).
