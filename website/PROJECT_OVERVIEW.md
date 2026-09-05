# LicenseBounty website brief

LicenseBounty is a serious, evidence-first dApp for software bounties. It locks a sponsor's GEN, requires the developer to accept immutable rules, reviews a public GitHub repository pinned to one commit, and settles only after a challengeable GenLayer consensus result.

The website should feel like a compact compliance console: dark graphite background, warm amber evidence accents, mint compliance accents, red rejection accents, readable tables, prominent status chips, and no crypto casino styling.

Required views:

1. Landing/dashboard with wallet state, network state, totals, and a clear “Create bounty” CTA.
2. Create bounty form with a live terms hash preview after local canonical serialization (label it preview; the contract is authoritative).
3. Bounty explorer with real IDs loaded from `get_recent_bounty_ids`.
4. Detail view showing locked rules, acceptance, exact repository commit, evidence hashes, evaluation JSON, challenge history, escrow, and lifecycle timeline.
5. Developer actions: accept, submit repository, retry evidence review.
6. Sponsor/party actions: evaluate, challenge, cancel, settle when allowed.
7. Transaction drawer with real hash, lifecycle stage, and explorer link.

The product is a prototype for public evidence adjudication, not legal advice. Display that limitation.
