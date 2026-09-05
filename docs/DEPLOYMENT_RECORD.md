# Deployment record

The active deployment below is the marked LicenseBounty v3 source. Previous
addresses remain listed as superseded because they reference the stale source.

| Field | Value |
| --- | --- |
| Network | GenLayer Studio / Studionet |
| RPC | `https://studio.genlayer.com/api` |
| Chain ID | `61999` |
| Contract address | `0xe1490cE6FC7Cb0E5946546d4a189273187f58c37` |
| Deployment transaction | `0x50d46d89d26cd927348cde61cc2d1ac172b8f0481443667882ffe00a3057797b` |
| First finalized Full Consensus transaction | `TODO_AFTER_TEST` |
| Website URL | `TODO_AFTER_FRONTEND_DEPLOYMENT` |
| Canonical GitHub commit | `912793a172eba727bc9c0208511680d6db715ea9` (contract source commit) |
| Recorded at | `2026-09-05` |

## Superseded deployments

Do not use `0x8D9398D3D205C62dB1601454770d199EE1078be1` or any earlier address.
The deployed source still referenced `self.escrows`, so settlement and
cancellation reverted before any payout. A fresh v3 deployment is required.

- `0x8D9398D3D205C62dB1601454770d199EE1078be1`
  - deployment transaction: `0xe3f2a1f628ababeed2737489ae64d5bf15ee7041247016bfea4757bcd775ce47`
  - failed settlement: `0x4537125191fff57f255408dae851380927b5410af1c6d74465071fd7d3401d3a`
- `0x74DE9D76F98a4919A91aD6f3E82cf90317d539bb`
  - deployment transaction: `0xba55981bab85ff7b848a6b14753d78f9e6142b423411f51addf02b9ade1df111`
  - failed cancellation: `0x8d771444025f6b2894c6babc856bf65582d5db5eaeff426fb9625797f6e64c23`
- `0xD7143BD93D93Fd9044A31618A712A157aef50283`
  - deployment transaction: `0xd4cba50467414e815180923ca8f7f8a0c1557e8e374c57885455c14c13f277e2`
  - failed settlement: `0x64639d9744b598fe3b6f1ed1a56b72ff6c6245b55f6f19b22bce8b92b60ce2e3`
