# GenLayer Studio deployment runbook

1. Open GenLayer Studio and connect the same MetaMask wallet used for the project.
2. Load `contracts/license_bounty.py` as the Intelligent Contract source.
3. Compile/lint it in Studio and fix no code by hand after the canonical GitHub commit is recorded.
4. Deploy to Studionet. Confirm MetaMask shows **GenLayer Studio**, chain ID `61999`, symbol `GEN`, and RPC `https://studio.genlayer.com/api`.
5. Record the contract address and deployment transaction hash.
6. Run the direct smoke path below using **Simulation Mode unchecked** and **Normal / Full Consensus**:
   - `create_bounty` with a small GEN value;
   - `accept_bounty` using the returned `terms_hash`;
   - `submit_repository` using the demo repository and a full commit SHA;
   - `evaluate_compliance`;
   - wait for `FINALIZED` and record the transaction hash;
   - read `get_bounty`, `get_submission`, `get_latest_evaluation`, and `get_totals`.
7. For challenge evidence, use a stable public raw GitHub or official license source URL. Run `challenge_verdict`, wait for finality, then call `settle_bounty` only after the displayed challenge window has closed.
8. Put the final address, deployment hash, consensus hash, network, and GitHub commit SHA in `docs/DEPLOYMENT_RECORD.md`.

The user must approve and sign wallet transactions. Never paste a private key into Studio, the website builder, or GitHub.
