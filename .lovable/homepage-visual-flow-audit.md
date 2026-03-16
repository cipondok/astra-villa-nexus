# ASTRAVILLA Homepage Visual Flow Audit
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

The homepage (`Index.tsx`, 1262 lines) renders **20+ content sections** in a single scroll, including **3 redundant AI recommendation components**, **2 duplicate CTA pairs**, and **7 ScrollReveal animations alternating left/right**. The hero section uses an `<h2>` instead of `<h1>` (critical SEO violation), contains 3 `console.log` statements in the search hot path, and an unused `backgroundStyle` variable consuming memory. Despite strong infrastructure (lazy loading, LazyRender, SearchErrorBoundary), the sheer volume of sections creates scroll fatigue and dilutes conversion intent.

---

## Current Section Sequence (Non-Search Mode)

```
ABOVE THE FOLD
├─ 1. Hero Banner Slider (7 images, parallax, ken-burns) ←─ 60vw height
├─ 2. Search Panel Overlay (AstraSearchPanel)
├─ 3. Gold Gradient Divider (decorative)
└─ 4. SocialProofStrip (listings/cities/new today)

FIRST SCROLL
├─ 5. FeaturedPropertiesCarousel
├─ 6. SmartCollectionsShowcase (5 AI collections)
└─ 7. AIPriceEstimatorCTA ←─ CTA #1

SECOND SCROLL
├─ 8.  AstraVillaFeatures (icon grid)
├─ 9.  InvestorPathSelector (3 paths)
├─ 10. BehaviorPatternBanner (AI banner)
├─ 11. SmartAIFeed ←─ AI RECO #1
└─ 12. DealHunterHero

THIRD SCROLL
├─ 13. SectionDividerCTA (AI Pricing) ←─ CTA #2 (DUPLICATE of #7)
├─ 14. SmartRecommendations ←─ AI RECO #2
├─ 15. TrendingROIDeals
└─ 16. SectionDividerCTA (Deal Finder) ←─ CTA #3

DEEP SCROLL (most users won't reach)
├─ 17. AIRecommendedProperties ←─ AI RECO #3 (LEGACY)
├─ 18. TrendingSearchesWidget
├─ 19. PropertiesForSaleSection
├─ 20. PropertiesForRentSection
├─ 21. SectionDividerCTA (Market Intelligence) ←─ CTA #4
├─ 22. EarlyInvestmentCTA ←─ CTA #5
├─ 23. MarketIntelligenceCTA ←─ CTA #6 (DUPLICATE of #21)
├─ 24. MarketplaceServices
└─ 25. PartnerLogosMarquee
```

**Total sections: 25** | **Recommended: 10-12**

---

## Audit Findings

### P0 — Critical Issues (Applied)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | **Hero headline is `<h2>` not `<h1>`** — Primary page heading uses h2, violating SEO heading hierarchy | `Index.tsx:679` | Google cannot identify the page's primary topic; damages ranking | **Fixed** → `<h1>` |
| 2 | **3 `console.log` in search hot path** — "Search initiated", "Search completed", "Fetching featured" fire on every interaction | `Index.tsx:161,289,427` | Clutters console, minor perf impact on rapid searches | **Fixed** — removed |
| 3 | **Unused `backgroundStyle` variable** — 6-line object with Unsplash URL, never referenced in JSX | `Index.tsx:401-407` | Dead code, unnecessary external image request risk | **Fixed** — removed |
| 4 | **`animate-pulse` on hero Sparkles icons** — Two sparkle icons with infinite pulse in hero overlay | `Index.tsx:672,676` | Distracting in hero zone; conflicts with interaction audit standards | **Fixed** → `signal-glow` |

### P1 — Section Bloat & Redundancy

| # | Issue | Recommendation |
|---|-------|----------------|
| 5 | **3 AI recommendation sections** — SmartAIFeed (#11), SmartRecommendations (#14), AIRecommendedProperties (#17) all serve similar purpose | **Remove AIRecommendedProperties** (marked "legacy"); keep SmartAIFeed + SmartRecommendations |
| 6 | **AIPriceEstimatorCTA (#7) duplicates SectionDividerCTA pricing (#13)** — Both link to /ai-pricing with similar messaging | **Remove SectionDividerCTA pricing**; keep the dedicated CTA component |
| 7 | **MarketIntelligenceCTA (#23) duplicates SectionDividerCTA analytics (#21)** — Both link to /analytics | **Remove MarketIntelligenceCTA**; keep SectionDividerCTA which is lighter |
| 8 | **7 ScrollReveal animations alternating left/right** — Creates "tennis match" visual effect on scroll | Reduce to 3-4 reveals; use "up" direction only for consistency |
| 9 | **25 total sections → 12** — Consolidation roadmap below |

### P2 — Visual Hierarchy Issues

| # | Issue | Recommendation |
|---|-------|----------------|
| 10 | **No clear section visual grouping** — All sections float in same background; no alternating contrast | Add `bg-muted/30` to every-other section for depth rhythm |
| 11 | **mb-6 used uniformly** — All sections use same 24px bottom margin regardless of importance | Use `mb-8` between major zones, `mb-4` within zones |
| 12 | **Hero search panel competes with scroll indicator** — Both at bottom of hero, overlapping on short viewports | Move scroll indicator below search panel or remove it |
| 13 | **InvestorPathSelector below features** — Investor paths are high-intent but buried at position #9 | Move to position #5 (right after SocialProofStrip) |

### P3 — Mobile Flow Issues

| # | Issue | Recommendation |
|---|-------|----------------|
| 14 | **Hero height `clamp(400px, 60vw, 650px)`** — On mobile (375px width), 60vw = 225px which hits 400px min; good but search panel overflows | Verify search panel fits within hero on 375px viewport |
| 15 | **No sticky search bar on scroll** — StickyHeaderSearch imported but not used in JSX | Activate StickyHeaderSearch for mobile viewport |
| 16 | **pb-20 on mobile content** — 80px bottom padding for FAB, but no FAB visible on homepage | Reduce to pb-4 or match actual bottom nav height |

---

## Proposed Consolidated Section Flow (12 sections)

```
ABOVE THE FOLD
├─ 1. Hero Banner + Search (h1 headline)
├─ 2. SocialProofStrip (trust metrics)

FIRST SCROLL — DISCOVERY
├─ 3. InvestorPathSelector (intent routing) ←─ moved up
├─ 4. FeaturedPropertiesCarousel
├─ 5. SmartCollectionsShowcase (5 AI collections)

SECOND SCROLL — AI INTELLIGENCE
├─ 6. SmartAIFeed (personalized/trending)
├─ 7. DealHunterHero + TrendingROIDeals (merged)
├─ 8. AIPriceEstimatorCTA (single pricing CTA)

THIRD SCROLL — LISTINGS
├─ 9.  PropertiesForSaleSection
├─ 10. PropertiesForRentSection

FOOTER ZONE
├─ 11. MarketplaceServices
└─ 12. PartnerLogosMarquee
```

**Removed:** AIRecommendedProperties (legacy), BehaviorPatternBanner, AstraVillaFeatures, 3 duplicate CTAs, TrendingSearchesWidget, EarlyInvestmentCTA

---

## ScrollReveal Motion Discipline

### Current (Motion Sickness Risk)
```
Section 5:  ScrollReveal direction="left"
Section 6:  ScrollReveal direction="right"
Section 7:  ScrollReveal direction="up"
Section 8:  ScrollReveal direction="right"
Section 9:  ScrollReveal direction="left"
Section 10: ScrollReveal direction="right"
Section 11: ScrollReveal direction="left"
...7 more alternating directions
```

### Recommended
```
All sections: ScrollReveal direction="up" delay={0}
Exception: Hero content → no reveal (already has entry animation)
```

---

## Implementation Priorities

### Sprint 1 (Applied)
- ✅ Fix h2 → h1 for hero headline (SEO critical)
- ✅ Remove 3 console.log from search path
- ✅ Remove unused backgroundStyle variable
- ✅ Replace animate-pulse on hero sparkles with signal-glow
- ✅ Remove legacy AIRecommendedProperties section
- ✅ Remove duplicate SectionDividerCTA (AI Pricing)
- ✅ Remove duplicate MarketIntelligenceCTA

### Sprint 2 (Recommended)
- Move InvestorPathSelector to position #3
- Unify ScrollReveal to "up" direction
- Add alternating background contrast to section groups
- Activate StickyHeaderSearch on mobile
- Implement tiered spacing (mb-8 major / mb-4 minor)

### Sprint 3 (Recommended)
- Merge DealHunterHero + TrendingROIDeals into single section
- Remove BehaviorPatternBanner (low engagement)
- Relocate AstraVillaFeatures to footer or separate page
- Implement scroll-progress indicator for long page
