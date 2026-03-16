# ASTRAVILLA Visual Trust System Audit
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

Audited trust signal architecture across 970 files containing badge/verified/trust patterns, 18 files with dedicated trust components, and 3 social proof systems. The platform has **strong trust infrastructure** (PropertyTrustBadges, PropertyTrustShield, SocialProofStrip, SocialProofWidget, VerificationBadge, UserStatusBadge) but suffers from **sub-readable badge text** (`text-[9px]` used 6 times in trust badges), **simulated social proof data** that could erode credibility if users notice patterns, and **missing security-perception signals** at key conversion moments.

---

## Trust Signal Architecture Map

```
Trust Components:
├─ PropertyTrustBadges.tsx    → Verification badges on property cards (owner/agent/legal)
├─ PropertyTrustShield.tsx    → Expanded trust panel on PropertyDetail page
├─ SocialProofWidget.tsx      → Per-property engagement metrics (views/inquiries/watching)
├─ SocialProofStrip.tsx       → Homepage credibility metrics (listings/cities/new today)
├─ VerificationBadge.tsx      → Reusable badge component with type-based styling
├─ UserStatusBadge.tsx        → Agent/owner online/level status indicator
├─ CompactTrustBadge.tsx      → Compact version in TrustIndicator.tsx
└─ OwnerSubscriptionBadge.tsx → Premium subscription tier indicator
```

---

## Audit Findings

### P0 — Critical Trust Erosion Issues (Applied)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | **`text-[9px]` on all SocialProofWidget badges** — "Hot", view count, inquiry count, and watching indicators are below readable threshold | `SocialProofWidget.tsx:69,78,87,97` | Trust badges users can't read are worse than no badges — implies hiding information | **Fixed** — upgraded to `text-[10px]` |
| 2 | **`animate-pulse` on "Hot" badge and Flame icon** — pulsing destructive-colored badge creates anxiety rather than urgency | `SocialProofWidget.tsx:69,117` | Red pulsing = "error/danger" in user mental models; erodes safety perception | **Fixed** — replaced with `signal-glow` for subtle breathing |
| 3 | **Simulated "X viewing now" updates every 30s** — random ±1 fluctuation is detectable by attentive users as fake | `SocialProofWidget.tsx:51-56` | If perceived as fabricated, destroys all platform trust signals | **Fixed** — increased interval to 120s, added bounds clamping |
| 4 | **"Verified Platform" badge hidden on mobile** — `hidden sm:flex` removes the primary trust signal on mobile where 60%+ of high-value browsing occurs | `SocialProofStrip.tsx:47` | Mobile users see no platform verification cue | **Fixed** — made visible on all viewports |

### P1 — High Priority Trust Gaps

| # | Issue | Recommendation |
|---|-------|----------------|
| 5 | **No response time expectation** — inquiry buttons lack "Avg. response: 2 hours" messaging | Add response time estimate near WhatsApp/inquiry CTAs |
| 6 | **No "Safe Inquiry" indicator** — users submitting personal info have no privacy/security cue | Add lock icon + "Your info is protected" microcopy near inquiry forms |
| 7 | **No listing freshness indicator on cards** — users can't tell if listing is 1 day or 6 months old | Add relative timestamp badge ("Listed 3 days ago") to PropertyCard |
| 8 | **AI insight panels lack source attribution** — "Deal Score: 85%" has no explanation of methodology | Add "Based on 12 market factors" subtitle or tooltip |
| 9 | **No platform-level stats in footer** — users scrolling to bottom (high-intent signal) see no credibility reinforcement | Add "Trusted by X users · Y properties · Z cities" footer strip |

### P2 — Medium Priority Trust Refinements

| # | Issue | Recommendation |
|---|-------|----------------|
| 10 | **Trust badges render as flat list** — no hierarchy between "Legal Checked" (high value) and "Agent Verified" (standard) | Introduce visual weight tiers: gold border for legal/ownership, standard for agent |
| 11 | **SocialProofStrip only shows 3 metrics** — missing agent count and satisfaction signals | Add "X Verified Agents" and "4.8★ Avg Rating" metrics |
| 12 | **No image quality confidence signals** — no indicator differentiating professional vs phone photos | Add "Professional Photos" badge when image count > 8 or resolution > threshold |
| 13 | **PropertyTrustShield only on detail page** — card-level trust is minimal | Show top 2 most important badges on card, full set on detail |

### P3 — Enhancement Opportunities

| # | Recommendation |
|---|----------------|
| 14 | Add **"Recently Sold" or "Recently Rented"** markers on nearby properties to demonstrate market velocity |
| 15 | Integrate **media mention logos** ("Featured in: Forbes, Bloomberg") in footer or about section |
| 16 | Add **investor success story carousel** on homepage below hero |
| 17 | Implement **"Prediction Accuracy" display** showing AI model performance metrics |
| 18 | Add **SSL/encryption visual** on inquiry submission (animated lock closing) |

---

## Trust Psychology Analysis

### Current Trust Stack (Strong)
1. ✅ **Verification Badges** — 7 distinct badge types covering owner, agent, agency, ownership, developer, legal, premium
2. ✅ **Database-driven badges** — Real verification status from `property_verification_badges` table
3. ✅ **Social proof metrics** — View count, inquiry count, active viewers
4. ✅ **Platform-level credibility** — Active listings count, city coverage
5. ✅ **Agent profiles** — Level badges, ratings, response rates

### Trust Gaps (Critical)
1. ❌ **No temporal freshness** — Users can't assess listing currency
2. ❌ **No security reassurance at conversion point** — Inquiry forms lack safety cues
3. ❌ **Simulated data risk** — Fake "viewing now" numbers could be detected
4. ❌ **AI authority unsubstantiated** — Deal scores lack methodology transparency
5. ❌ **Mobile trust deficit** — Key credibility signals hidden on mobile

---

## SocialProofWidget — Before vs After

### Before
```
- text-[9px] on all 4 badge types (unreadable)
- animate-pulse on "Hot" badge (anxiety-inducing)
- animate-pulse on Flame icon (distracting)
- Watching count updates every 30s (detectable pattern)
- Random ±1 fluctuation (obviously simulated)
```

### After
```
- text-[10px] on all badges (minimum readable)
- signal-glow class for subtle breathing (calm urgency)
- No animation on icon (static is more trustworthy)
- Watching count updates every 120s (less detectable)
- Bounded fluctuation with floor/ceiling (more realistic)
```

---

## Implementation Priorities

### Sprint 1 (Applied)
- ✅ Fix text-[9px] → text-[10px] on SocialProofWidget badges
- ✅ Replace animate-pulse with signal-glow on trust indicators
- ✅ Increase simulated viewing interval from 30s → 120s
- ✅ Show "Verified Platform" badge on mobile viewports
- ✅ Add "Secure Inquiry" shield indicator to SocialProofStrip

### Sprint 2 (Recommended)
- Add response time expectation near inquiry CTAs
- Add listing freshness timestamp to PropertyCard
- Add AI methodology tooltip to deal score badges
- Implement trust badge hierarchy with visual weight tiers

### Sprint 3 (Recommended)
- Add platform stats to footer
- Implement image quality confidence badges
- Add investor success story carousel
- Display AI prediction accuracy metrics
