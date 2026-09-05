# Test strategy

`tests/direct/test_license_bounty.py` is intended for the GenLayer direct test runner. The mock tree and raw files model a public GitHub repository pinned to a commit. The test suite is deliberately adversarial: it checks immutability, missing evidence, evidence hashes, challenge state, and escrow protection.

Before submission, run the direct suite, then a GLSim/local Studio integration run, then one real Studionet Full Consensus review with Simulation Mode disabled. Record the finalized transaction hash only from the real Studio receipt.
