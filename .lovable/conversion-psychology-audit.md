# ASTRAVILLA Homepage Conversion Psychology Audit
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

Audited the homepage across 7 conversion psychology dimensions. The page has strong content depth but suffers from **missing social proof**, **weak urgency cues**, **CTA fatigue gaps** in mid-scroll, and **hero messaging that lacks specificity**. Implemented P0 fixes for trust, urgency, and CTA hierarchy.

---

## Audit Findings

### 1. Above-the-Fold Emotional Impact

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1.1 | **Hero headline is generic** — "Find Your Dream Property" lacks specificity or emotional hook | P1 | Fixed — added dynamic stat counter for specificity |
| 1.2 | **No social proof above fold** — no listings count, users, or trust indicators visible | P0 | Fixed — added SocialProofStrip |
| 1.3 | **Scroll indicator text `text-[9px]`** — below readability threshold | P1 | Fixed — bumped to `text-[10px]` |
| 1.4 | **No urgency/scarcity cue** — nothing motivates immediate action | P0 | Fixed — added "new today" counter |

### 2. Trust-Building UI Elements

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 2.1 | **No platform authority stats visible** — listings count, cities, users buried or absent | P0 | Fixed — SocialProofStrip with live DB stats |
| 2.2 | **Partner logos at page bottom** — trust signal too late in scroll journey | P1 | Noted — consider duplicating above fold |
| 2.3 | **No testimonials or review snippets** — no social validation from real users | P2 | Remaining |
| 2.4 | **No "Verified Listings" badge in hero** — premium trust perception missing | P1 | Fixed — added verified shield icon |

### 3. Decision Momentum Flow

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 3.1 | **12+ sections with no mid-page CTAs** — users scroll without conversion prompts | P0 | Fixed — added SectionDividerCTA |
| 3.2 | **Section sequence: SmartAIFeed → DealHunter → SmartRec → TrendingROI → AIRec** — 5 consecutive property feeds with no breathing room | P1 | Fixed — inserted divider CTAs |
| 3.3 | **No progressive disclosure** — all sections equal visual weight | P2 | Remaining |

### 4. Urgency & Opportunity Perception

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 4.1 | **No "X properties added today" indicator** — no freshness signal | P0 | Fixed — in SocialProofStrip |
| 4.2 | **DealHunterHero has urgency scores** but buried below fold | P1 | Remaining — consider hero teaser |
| 4.3 | **No "X people viewing" social proof on listings** | P2 | Remaining |

### 5. CTA Hierarchy

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 5.1 | **Single CTA type (search)** — no secondary exploration CTA | P0 | Fixed — divider CTAs offer varied paths |
| 5.2 | **"Explore" scroll indicator competes with search panel** | P2 | Remaining |
| 5.3 | **No "Browse by City" quick-entry** | P1 | Remaining |

### 6. Cognitive Friction

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 6.1 | **Section spacing inconsistent** — `mb-6` on all sections, no visual rhythm variation | P2 | Remaining |
| 6.2 | **Gold gradient divider after hero is too subtle** — doesn't create clear section break | P2 | Remaining |
| 6.3 | **ScrollReveal on every section** — animation fatigue on long scroll | P1 | Remaining — consider disabling after 5th section |

### 7. Mobile Conversion Psychology

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 7.1 | **Search panel overlaps slide indicators on small screens** | P1 | Remaining |
| 7.2 | **No floating "Search" FAB on mobile after scrolling past hero** | P1 | Addressed by StickyHeaderSearch |
| 7.3 | **Partner logos marquee autoscrolls** — good for passive trust | ✅ | No change needed |

---

## Conversion Funnel Optimization

### Before
```
Hero (Search) → Featured → Collections → AI Price CTA → Tools → Investor Path
→ SmartAIFeed → DealHunter → SmartRec → TrendingROI → AIRec → TrendingSearches
→ For Sale → For Rent → Early Investment CTA → Market Intel CTA → Services → Partners
```
**Problem:** 18 sections, CTAs only at positions 4, 15, 16. Massive conversion gap in middle.

### After (with SectionDividerCTA)
```
Hero (Search) → [TRUST STRIP] → Featured → Collections → AI Price CTA → Tools → Investor Path
→ SmartAIFeed → DealHunter → [DIVIDER CTA: AI Pricing] → SmartRec → TrendingROI
→ [DIVIDER CTA: Deal Finder] → AIRec → TrendingSearches → For Sale → For Rent
→ [DIVIDER CTA: Market Intel] → Early Investment CTA → Market Intel CTA → Services → Partners
```

---

## Implementation Priorities (Next Sprint)

1. **Browse by City quick-entry** below hero (P1)
2. **Testimonial/review snippet carousel** after partner logos (P2)
3. **Reduce ScrollReveal** — disable after 6th section for performance (P1)
4. **Hero scarcity teaser** from DealHunter data (P1)
