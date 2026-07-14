# ASTRA Villa Property — Governance

This folder is the **governance layer** for ASTRA Villa Property. It defines *why* we build, *what* we build, and *how* decisions are made. It does not contain code.

## Two Blueprints, One Project

| Document | Type | Source of truth for |
|---|---|---|
| `.lovable/project-master-blueprint.md` | **Technical Blueprint** | Implementation — architecture, database, edge functions, pages, components, infrastructure. |
| `.lovable/governance/01_MASTER_BLUEPRINT.md` | **Business Blueprint** | Business decisions — vision, mission, model, revenue, brand, strategy. |

- The **Business Blueprint** is the source of truth for **business decisions**.
- The **Technical Blueprint** is the source of truth for **implementation**.
- Future development **must keep both documents synchronized**. When a business decision changes the product, both files must be updated in the same change.

## Files in this folder

1. `01_MASTER_BLUEPRINT.md` — Business Blueprint (vision, mission, model, strategy).
2. `02_PRODUCT_REQUIREMENTS.md` — Feature PRD template. Every feature must have one before development.
3. `03_CHANGELOG.md` — Log of every approved project decision (`AVP-XXXX`).
4. `04_ROADMAP.md` — Phased roadmap (Foundation → Global Expansion).
5. `05_DECISION_RULES.md` — Governance rules for approving and shipping work.
6. `06_REVIEW_CHECKLIST.md` — Pre-merge checklist for any feature.

## Workflow

1. Idea → write a PRD entry in `02_PRODUCT_REQUIREMENTS.md`.
2. Approve → add a row to `03_CHANGELOG.md` with an `AVP-XXXX` ID.
3. Implement → follow `05_DECISION_RULES.md`, verify with `06_REVIEW_CHECKLIST.md`.
4. Ship → update both Business and Technical Blueprints if the release changes scope.

> Documentation only. This folder never modifies code, database, UI, Edge Functions, settings, or infrastructure.
