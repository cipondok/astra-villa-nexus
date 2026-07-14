# 06 — Pre-Merge Review Checklist

Every feature must pass this checklist before merging. Copy the block into the PR / delivery notes and tick each item.

```markdown
## Review Checklist — AVP-XXXX <feature name>

- [ ] **Business Alignment** — maps to `01_MASTER_BLUEPRINT.md` vision and pillars.
- [ ] **UI Consistency** — uses `astra-*` tokens, Obsidian Signal design, no ad-hoc colors, mobile + desktop verified.
- [ ] **Performance** — no regressions in bundle size, LCP, INP; chunked DB ops; no N+1 queries.
- [ ] **Security** — RLS on all new public tables, roles via `user_roles`, secrets in vault, no PII leaks, edge auth enforced.
- [ ] **SEO** — title <60c, meta description <160c, single H1, semantic HTML, JSON-LD where applicable, canonical set.
- [ ] **Accessibility** — WCAG 2.1 AA: contrast, focus states, ARIA, keyboard nav, ≥44px touch targets, min `text-[10px]`.
- [ ] **Database** — migration includes `GRANT`s for public-schema tables; RLS + policies; views use `security_invoker = true`.
- [ ] **API / Edge Functions** — `npm:` specifiers only, defensive limits, auth checks, structured error handling.
- [ ] **Testing** — unit, integration, and (if user-facing) E2E updated; critical paths covered.
- [ ] **Documentation Updated** — PRD status set to `Complete`; user-facing docs revised.
- [ ] **Blueprint Updated** — Business and/or Technical Blueprint reflect the change.
- [ ] **Changelog Updated** — `03_CHANGELOG.md` row marked `Complete` with date.

**Reviewer:** _______   **Date:** _______
```
