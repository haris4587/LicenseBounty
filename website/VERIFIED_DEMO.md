# Verified demo script

After deployment, replace placeholders with real values and capture screenshots of the following finalized transactions:

1. Sponsor connects MetaMask to GenLayer Studio and creates a bounty with 0.01 GEN.
2. Developer account accepts the displayed `terms_hash`.
3. Developer submits a public GitHub repository at a full commit SHA.
4. Sponsor or developer runs `evaluate_compliance` with Simulation Mode disabled and Normal / Full Consensus selected.
5. The detail page shows the finalized transaction, `EVALUATED` state, verdict, score, license paths, manifest paths, citations, and evidence SHA-256 records.
6. Optional challenge demonstrates counter-evidence and a reopened challenge window.
7. After the window closes, any party settles; the page confirms the real finalized settlement and zero remaining escrow.

Do not write that this script is complete until the transaction hashes are recorded in `docs/DEPLOYMENT_RECORD.md`.
