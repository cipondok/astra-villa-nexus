# ASTRAVILLA UI Conversion Scoring Framework
**Date:** 2026-03-16 | **Status:** Active
**Purpose:** Measurable UI quality indicators for continuous conversion improvement

---

## Scoring Methodology

Each dimension is scored **0–100** using weighted sub-criteria. Scores are assessed via code inspection, visual audit, and heuristic evaluation against marketplace best practices.

**Scoring tiers:**
- 🟢 **80–100** — Launch-ready, minor polish only
- 🟡 **60–79** — Functional but conversion friction present
- 🔴 **0–59** — Blocking conversion; immediate action required

---

## 1. Homepage Engagement Score

**Current Score: 58/100** 🔴

| Sub-Criteria | Weight | Score | Evidence |
|-------------|--------|-------|----------|
| **Search prominence** — Search bar visible above fold with clear affordance | 25% | 70 | Search is present but icon cluster (6 unlabeled icons) reduces clarity; AI-powered badge adds novelty but competes with tab row |
| **Hero trust signals** — Professional imagery, value proposition clarity, social proof | 25% | 45 | Hero uses promotional banner imagery; no user count, transaction volume, or trust badges visible above fold |
| **Featured listing click-through encouragement** — Visual pull toward property cards | 25% | 50 | Cards all show "No Image Available" placeholder (data issue); no hover preview or quick-view affordance |
| **Section navigation clarity** — Can users find what they need in ≤2 scrolls? | 25% | 65 | 22+ sections create scroll fatigue; "Rekomendasi AI" requires login (dead-end for visitors); section heading styles inconsistent |

### Improvement Triggers (Score < 70)
- [ ] Add trust bar below hero: "X properties listed · Y inquiries this month · Z verified agents"
- [ ] Reduce homepage to 10–12 sections max (consolidate redundant sections)
- [ ] Add text labels to search bar icon cluster
- [ ] Ensure featured listings have real property images before launch

---

## 2. Listing Card Conversion Score

**Current Score: 62/100** 🟡

| Sub-Criteria | Weight | Score | Evidence |
|-------------|--------|-------|----------|
| **Price visibility** — Price is the first scanned element, prominent and formatted correctly | 30% | 75 | Price uses `font-black` with `drop-shadow-sm` at `text-lg` minimum ✅; but `formatPrice(0)` shows "Rp 0B" (edge case bug) |
| **Deal score signal clarity** — AI intelligence indicators are readable and meaningful | 25% | 55 | `.signal-glow` applied to SocialProofWidget badges; but deal score badges only appear on 1 component; "Gold = Intelligence" color rule not fully migrated |
| **CTA discoverability** — Clear path from card to inquiry/detail action | 20% | 60 | Card is clickable (entire surface) ✅; but no visible "View Details" button; heart/share icons lack text labels |
| **Hover interaction feedback** — Card responds to interaction with elevation/shadow | 25% | 58 | `.card-hover-lift` applied to PropertyCard ✅; but only 1 of ~200 card components uses it; `.img-hover-zoom` defined but unadopted |

### Improvement Triggers (Score < 70)
- [ ] Fix `formatPrice(0)` → show "Harga Hubungi Kami" (Price on Request) instead of "Rp 0B"
- [ ] Apply `.card-hover-lift` to all interactive card variants (currently 1/200)
- [ ] Add `.img-hover-zoom` to property card image containers
- [ ] Display AI deal score on all cards where data exists (not just SocialProofWidget)

---

## 3. Property Detail Conversion Score

**Current Score: 72/100** 🟡

| Sub-Criteria | Weight | Score | Evidence |
|-------------|--------|-------|----------|
| **Inquiry CTA dominance** — WhatsApp/Call/Inquiry buttons are impossible to miss | 35% | 82 | Mobile sticky conversion bar (72px) with WhatsApp + Call buttons at 44px height ✅; high-contrast design |
| **Information clarity** — Property specs, location, pricing are scannable | 25% | 70 | Specs use icon + value pattern; but some icons lack text labels on mobile (Bed/Bath/Sqft); mixed language labels |
| **Decision confidence reinforcement** — AI insights, market comparison, social proof visible | 25% | 60 | AI Deal Insights exist (Why/Risks/Exit/Persona) but gated behind premium; free users get no confidence signals |
| **Gallery/visual quality** — Property images support emotional engagement | 15% | 75 | 360° VR tour integration exists; but fallback for missing images is raw watermark placeholder |

### Improvement Triggers (Score < 70)
- [ ] Show at least 1 free AI insight (e.g., "Fair Market Value: Rp X") on every listing to build trust
- [ ] Add text labels to property spec icons on mobile: "3 Beds · 2 Baths · 120m²"
- [ ] Replace raw "No Image Available" watermark with styled illustration + "Photos coming soon"
- [ ] Add "X people viewed this week" social proof indicator on detail pages

---

## 4. Mobile Conversion Score

**Current Score: 65/100** 🟡

| Sub-Criteria | Weight | Score | Evidence |
|-------------|--------|-------|----------|
| **Floating action presence** — Key CTA always accessible without scrolling | 30% | 80 | Sticky conversion bar on detail pages ✅; bottom nav with 72px clearance ✅ |
| **Scrolling fatigue risk** — Content density doesn't exhaust users before conversion | 30% | 50 | Homepage has 22+ sections; property cards truncate at unhelpful points ("Land di Maninjau, KABUP..."); excessive vertical whitespace between sections |
| **Tap interaction comfort** — All interactive elements ≥ 44px | 25% | 75 | Button defaults upgraded to `h-11` (44px) ✅; but `sm` variant at `h-9` (36px) still used in some mobile contexts |
| **Visual clarity at small sizes** — Text readable, icons distinguishable | 15% | 48 | 12,731 instances of sub-10px text (`text-[6-9px]`) across 436 files; badges with `text-[7px]` are illegible on mobile |

### Improvement Triggers (Score < 70)
- [ ] Reduce homepage to ≤12 sections for mobile (lazy-load rest behind "Show More")
- [ ] Fix all `text-[6-9px]` violations → minimum `text-[10px]` (accessibility requirement)
- [ ] Add "Load more" pagination instead of infinite scroll to reduce DOM size
- [ ] Ensure card title uses `line-clamp-2` for meaningful truncation

---

## 5. Visual Trust Score

**Current Score: 60/100** 🟡

| Sub-Criteria | Weight | Score | Evidence |
|-------------|--------|-------|----------|
| **Credibility signal visibility** — Verified badges, agent credentials, platform stats | 30% | 45 | No homepage trust bar (user count, listing volume); agent verification exists but not prominently displayed on cards |
| **Intelligence indicator consistency** — AI signals feel cohesive and trustworthy | 30% | 55 | 7 motion tokens defined but only 3 adopted; "Gold = Intelligence" rule proposed but mixed colors still used; `.signal-shimmer` class exists but 0 adoptions |
| **Perceived professionalism** — No broken states, consistent styling, polished interactions | 25% | 70 | Design system tokens well-defined; glassmorphic aesthetic cohesive; but 4 different CTA styles on homepage; notification dots on all 8 marketplace categories |
| **Data presentation trustworthiness** — Numbers, charts, metrics look credible | 15% | 72 | Theme-aware Recharts with semantic tokens ✅; investment ROI indicators present; but small text sizes reduce readability |

### Improvement Triggers (Score < 70)
- [ ] Add homepage trust bar: "5,000+ Listings · 500+ Verified Agents · AI-Powered Analytics"
- [ ] Standardize to max 2 CTA styles per page (primary gold + secondary outline)
- [ ] Apply `.signal-shimmer` to premium deal score badges (0 current adoptions)
- [ ] Remove decorative notification dots from marketplace grid (or make data-driven)

---

## Composite Score Summary

| Dimension | Score | Status | Priority |
|-----------|-------|--------|----------|
| Homepage Engagement | 58 | 🔴 | Sprint 1 |
| Listing Card Conversion | 62 | 🟡 | Sprint 1 |
| Property Detail Conversion | 72 | 🟡 | Sprint 2 |
| Mobile Conversion | 65 | 🟡 | Sprint 1 |
| Visual Trust | 60 | 🟡 | Sprint 1 |
| **Weighted Average** | **63** | **🟡** | — |

---

## Scoring Update Cadence

| Frequency | Action |
|-----------|--------|
| After each sprint | Re-score affected dimensions using same criteria |
| Monthly | Full re-audit with live screenshots at desktop + mobile |
| After major feature launch | Score new feature's conversion funnel before/after |

---

## Improvement Priority Matrix

### High Impact × Low Effort (Do First)
1. Fix `formatPrice(0)` edge case → "Harga Hubungi Kami"
2. Add homepage trust bar (static text, no backend needed)
3. Apply `.card-hover-lift` to remaining card components
4. Standardize CTA button variants to 2 per page

### High Impact × Medium Effort
5. Fix sub-10px text violations (top 20 components first)
6. Reduce homepage sections from 22+ to 12
7. Improve property image fallback design
8. Show 1 free AI insight per listing

### Medium Impact × Low Effort
9. Add text labels to search bar icons
10. Apply `.img-hover-zoom` to card images
11. Remove notification dots from marketplace grid
12. Fix card title truncation with `line-clamp-2`

### Medium Impact × Higher Effort
13. Implement scroll-triggered trust counters (animated numbers)
14. Add "X people viewing" real-time social proof
15. Create progressive disclosure for homepage sections on mobile
16. Migrate all motion tokens to remaining ~200 card components
