# 05 — Decision Rules

These rules govern how work is approved and shipped in ASTRA Villa Property. They are **binding** for humans and AI agents.

1. **No feature is implemented without documentation.** A PRD entry in `02_PRODUCT_REQUIREMENTS.md` must exist and be marked at least `Approved`.
2. **Every feature must support the company vision.** If it does not map to `01_MASTER_BLUEPRINT.md`, it does not ship.
3. **Every feature must provide measurable business value.** Define the metric before building.
4. **No duplicate functionality.** Extend existing modules before creating parallel ones. Duplicates must be justified in the changelog.
5. **Documentation must be updated before implementation.** PRD, roadmap, and blueprints first — code second.
6. **Changelog updated after approval.** A new `AVP-XXXX` row is added the moment a decision is approved.
7. **Blueprint version updated after major releases.** Bump `01_MASTER_BLUEPRINT.md` version and update `.lovable/project-master-blueprint.md` when scope, strategy, or architecture changes materially.
8. **Both blueprints stay in sync.** A business change that affects implementation must update the Technical Blueprint in the same delivery.
9. **Security, RLS, and role rules from project memory are non-negotiable.**
10. **Reversals are logged, not deleted.** Rejected or reverted decisions remain in the changelog for history.
