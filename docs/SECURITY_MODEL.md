# Security model

## Protected properties

- **Rule immutability:** bounty rules are serialized into `terms_hash`; acceptance requires the same hash.
- **Commit immutability:** repository reviews use a full Git commit SHA, never `main`, `master`, a tag, or a mutable GitHub page.
- **Evidence integrity:** each fetched file is stored with URL, path, SHA-256 digest, and byte length.
- **Prompt-injection resistance:** repository and challenge content is labeled untrusted evidence; validators are instructed to ignore embedded instructions.
- **Consensus before writes:** evaluation and appeal results are written only after `run_nondet_unsafe` returns.
- **Least privilege:** only sponsor/developer can request reviews or challenge; only the designated developer can accept or submit.
- **Bounded challenges:** at most two challenge records per bounty; every challenge reopens only a finite challenge window.
- **No stranded escrow:** sponsor cancellation, deadline-plus-grace refund, and evidence retry paths keep a recoverable exit available.
- **Exact payout accounting:** the authoritative `escrow_remaining_wei` record is zeroed after transfer and aggregate locked totals decrease by the full amount.

## Known limitations

Public GitHub evidence can disappear or be rate limited. License identification and dependency interpretation remain judgment tasks. A repository may contain generated or binary files that are not fully represented in the prompt. The contract conservatively holds funds for temporary evidence failures and never treats an unavailable fetch as compliant.

## Operational rules

Use stable public GitHub commits and small text license/manifest files for the demo. Avoid Cloudflare-protected evidence pages and dynamic dashboards. In the UI, disable all write buttons until MetaMask is connected to GenLayer Studio and show the actual transaction lifecycle (`PENDING`, `PROPOSING`, `FINALIZED`, `ERROR`).
