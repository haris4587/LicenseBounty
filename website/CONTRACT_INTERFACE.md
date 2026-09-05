# Website contract interface

Network constants:

```text
RPC: https://studio.genlayer.com/api
chainId: 61999 (0xf21f)
chainName: GenLayer Studio
nativeCurrency: GEN, 18 decimals
contractAddress: replace after deployment
```

Write calls must use `genlayer-js` and wait for the real GenLayer lifecycle. Do not fabricate an ABI, receipt, verdict, wallet address, or finality state.

## Writes

```text
create_bounty(
  bounty_id: string,
  title: string,
  developer: string,
  requirements: string,
  allowed_licenses: string,          // one identifier per line
  prohibited_licenses: string,       // one identifier per line; may be empty
  require_attribution: boolean,
  allow_copyleft: boolean,
  submission_deadline_unix: number,
  review_grace_seconds: number,
  challenge_window_seconds: number,
  partial_payout_bps: number
) payable: native GEN value > 0

accept_bounty(bounty_id: string, terms_hash: string)

submit_repository(
  bounty_id: string,
  repository_url: string,
  commit_sha: string,
  dependency_evidence_urls: string,  // one HTTPS URL per line; may be empty
  developer_attestation: string
)

evaluate_compliance(bounty_id: string)
retry_evaluation(bounty_id: string)

challenge_verdict(
  bounty_id: string,
  challenge_id: string,
  challenge_reason: string,
  counter_evidence_urls: string
)

settle_bounty(bounty_id: string)
cancel_bounty(bounty_id: string)
```

## Reads

```text
get_bounty(bounty_id) -> JSON string
get_submission(bounty_id) -> JSON string
get_evaluation(bounty_id, evaluation_version) -> JSON string
get_latest_evaluation(bounty_id) -> JSON string
get_challenge(challenge_id) -> JSON string
get_recent_bounty_ids() -> string[]
get_recent_challenge_ids() -> string[]
get_totals() -> JSON string
```

## UI rules

- MetaMask connection is mandatory before showing any write form or enabling any transaction button.
- If MetaMask is absent, show “Install MetaMask to continue.”
- If the wallet is on another network, offer a real `wallet_switchEthereumChain` to chain ID `0xf21f`, then `wallet_addEthereumChain` only if needed.
- For writes, show `Awaiting wallet signature`, `PENDING`, `PROPOSING`, `FINALIZED`, or `ERROR` from the real transaction state.
- Never claim that a bounty is paid until `settle_bounty` is finalized and the read state shows `escrow_remaining_wei: "0"`.
