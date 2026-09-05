# Website security requirements

- Require MetaMask before every write flow.
- Read the connected account from `eth_accounts`; never request or store private keys.
- Detect `chainChanged` and `accountsChanged`, clear stale write state, and reload on network changes.
- Validate addresses, commit SHA format, HTTPS URL lists, deadlines, GEN amount, and text lengths before opening MetaMask.
- Treat contract-returned JSON as untrusted data: parse defensively and render escaped text.
- Use the contract's exact method names and argument order from `CONTRACT_INTERFACE.md`.
- Do not include mock “success” data in production builds. Empty chain state should say “No bounties found.”
