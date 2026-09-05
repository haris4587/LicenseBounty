# Deployment record

Fill this file only after the user has performed the wallet-signature steps in GenLayer Studio.

| Field | Value |
| --- | --- |
| Network | GenLayer Studio / Studionet |
| RPC | `https://studio.genlayer.com/api` |
| Chain ID | `61999` |
| Contract address | `0x8D9398D3D205C62dB1601454770d199EE1078be1` |
| Deployment transaction | `0xe3f2a1f628ababeed2737489ae64d5bf15ee7041247016bfea4757bcd775ce47` |
| First finalized Full Consensus transaction | `TODO_AFTER_TEST` |
| Website URL | `TODO_AFTER_FRONTEND_DEPLOYMENT` |
| Canonical GitHub commit | `bc694f1049dcb02fa06b8eb8c3c29d2f20c916a4` |
| Recorded at | `2026-09-05` |

## Superseded deployments

These deployments must not be used because they omitted the persistent escrow map required by settlement and cancellation:

- Contract: `0xD7143BD93D93Fd9044A31618A712A157aef50283`
- Deployment transaction: `0xd4cba50467414e815180923ca8f7f8a0c1557e8e374c57885455c14c13f277e2`
- Failed settlement transaction: `0x64639d9744b598fe3b6f1ed1a56b72ff6c6245b55f6f19b22bce8b92b60ce2e3`

- Contract: `0x74DE9D76F98a4919A91aD6f3E82cf90317d539bb`
- Deployment transaction: `0xba55981bab85ff7b848a6b14753d78f9e6142b423411f51addf02b9ade1df111`
- Failed cancellation transaction: `0x8d771444025f6b2894c6babc856bf65582d5db5eaeff426fb9625797f6e64c23`

Both failed transactions reached finalized consensus but reverted during execution; no payout was made.
