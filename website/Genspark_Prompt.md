# Genspark build prompt — LicenseBounty dApp

Build a production-quality React/Vite website called **LicenseBounty** from the attached project files. This is the frontend for a real GenLayer Intelligent Contract, not a static mockup and not a design-only prototype.

## Source of truth

Use these files exactly:

- `website/PROJECT_OVERVIEW.md`
- `website/CONTRACT_INTERFACE.md`
- `website/WEBSITE_DATA.json`
- `website/SECURITY_MODEL.md`
- `website/VERIFIED_DEMO.md`
- `contracts/license_bounty.py`

Use the deployed contract address supplied in `WEBSITE_DATA.json` after deployment. Use `genlayer-js` for contract reads, writes, transaction lifecycle polling, and finalization. Do not invent an ABI or replace the chain with a normal EVM mock.

## Mandatory wallet behavior

MetaMask connection is required. On initial load, show a prominent **Connect MetaMask** button and a disconnected state. Do not render an enabled write form before connection. Read `eth_chainId` and `eth_accounts`; detect `accountsChanged` and `chainChanged`. If the user is not on GenLayer Studio, offer a real switch to:

```json
{
  "chainId": "0xf21f",
  "chainName": "GenLayer Studio",
  "nativeCurrency": {"name":"GEN","symbol":"GEN","decimals":18},
  "rpcUrls": ["https://studio.genlayer.com/api"]
}
```

Never request, display, store, or transmit private keys. Never use fake wallet addresses or simulated success.

## Contract methods

Implement the exact methods, types, payable GEN value, and argument order in `website/CONTRACT_INTERFACE.md`. Use the contract's real read methods for dashboard data. For writes, show a transaction drawer with: awaiting signature, transaction hash, PENDING, PROPOSING, FINALIZED, ERROR, retry, and explorer link. Never call a transaction “paid” until `settle_bounty` is finalized and the read state has zero remaining escrow.

## Required UX

Create these working screens:

1. Dashboard: connected wallet, Studio network badge, total bounties/submissions/evaluations/challenges, locked GEN, recent bounties.
2. Create bounty: title, developer wallet, natural-language requirements, allowed/prohibited license lists, attribution/copyleft toggles, deadline, grace, challenge window, partial payout percentage, GEN deposit. Validate locally but treat the contract as authoritative.
3. Bounty explorer/detail: real on-chain records from `get_recent_bounty_ids` and `get_bounty`.
4. Developer panel: accept terms using the exact on-chain `terms_hash`, submit GitHub URL plus full commit SHA and optional dependency evidence URLs, retry unavailable evidence.
5. Compliance panel: request evaluation, render the real verdict (`COMPLIANT`, `PARTIALLY_COMPLIANT`, or `REJECTED`), confidence, score, detected license, checks, problematic dependencies, citations, repository file paths, evidence SHA-256/byte manifest, and consensus transaction.
6. Challenge panel: reason and one-to-five counter-evidence URLs, challenge history, revised decision, and reopened window.
7. Settlement panel: explain why settle is or is not available, then call the real `settle_bounty` or `cancel_bounty` method.

## Visual direction

Use a focused compliance-console aesthetic: graphite/ink background, warm amber evidence accents, mint for compliant, orange for partial, red for rejected, crisp cards, table rows, monospace hashes, timeline status, generous spacing, and excellent mobile responsiveness. Avoid generic DeFi gradients, fake charts, fake activity, or meaningless placeholder cards.

## Error and safety states

Handle MetaMask absent, user rejection, wrong network, insufficient GEN, malformed address, invalid commit SHA, missing evidence, empty chain, unavailable GitHub evidence, consensus pending, reverted transaction, and finality timeout. Explain that LicenseBounty is a public-evidence prototype and not legal advice.

## Build acceptance

The final site must build successfully, use no fake data, include the GitHub repository link `https://github.com/haris4587/LicenseBounty`, and keep every write disabled until MetaMask is connected to GenLayer Studio. Include a compact “How it works” section explaining immutable terms, exact-commit evidence, validator consensus, bounded challenges, and timeout refunds.
