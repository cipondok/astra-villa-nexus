# ASTRAVILLA Search Experience Psychology Audit
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

Audited the property search experience across 8 behavioral psychology dimensions. The platform has **strong search infrastructure** (text, image, voice, NLP modes) and a **well-designed PropertyGridView** card layout. Critical issues: PropertyCard **fires 6+ console.logs per render** (perf regression), listing badges use **hardcoded non-semantic colors** (emerald-500, sky-500, violet-500), sort options use **generic labels** that don't leverage AI intelligence, and the **4-column grid at xl breakpoint** creates visual density overload.

---

## Architecture Overview

```
Index.tsx (1262 lines — main search orchestrator)
  ├─ Hero Section: AstraSearchPanel (lazy) — primary search
  ├─ StickyHeaderSearch — scroll-triggered search bar
  ├─ Search Results Section:
  │   ├─ ActiveFilterPills — applied filter display
  │   ├─ PropertyViewModeToggle — grid/list/map switch
  │   ├─ PropertyGridView — 4-col grid with InvestmentScoreBadge
  │   ├─ PropertyListView — horizontal card layout
  │   ├─ PropertyMapView — map-based browsing
  │   └─ SearchPagination — page-based (15 per page)
  └─ Pre-search: FeaturedCarousel, SmartCollections, PropertiesForSale/Rent
```

---

## Audit Findings

### P0 — Critical Performance & Trust Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | **PropertyCard logs 6+ console.logs per render** — `console.log('Rendering with showDetailModal:', ...)` fires on EVERY card in grid, creating massive console spam and micro-perf drag | `PropertyCard.tsx:138-174` | **Fix applied** — removed all debug logs |
| 2 | **Hardcoded badge colors bypass design system** — `from-emerald-500 to-green-600`, `from-sky-500 to-blue-600`, `from-violet-500 to-purple-600` used for listing type and VR badges | `PropertyCard.tsx:215-238` | **Fix applied** — migrated to semantic tokens |
| 3 | **Sort labels lack behavioral anchoring** — "Newest First", "Most Popular" are generic; platform's AI intelligence is buried under "AI Deal Score" at bottom | `SearchResultsHeader.tsx:35-42` | **Fix applied** — reordered with psychology-driven labels |

### P1 — High Priority Friction Points

| # | Issue | Recommendation |
|---|-------|----------------|
| 4 | **4-column grid at xl creates density overload** — `xl:grid-cols-4` with small text creates comparison fatigue | Reduce to `xl:grid-cols-3` or add content breathing room |
| 5 | **No "zero results" psychology** — empty state says "No properties found" with no emotional recovery | Add suggestion chips, broadened search hints, and "popular in your area" fallback |
| 6 | **Pagination scroll-jumps to section top** — `scrollIntoView({ block: 'start' })` creates disorienting jump | Use `block: 'nearest'` or smooth scroll with offset |
| 7 | **Search results count uses `text-[10px]`** — "X properties found" is barely readable on mobile | Upgrade to `text-xs` minimum |
| 8 | **No result count in search bar feedback** — user doesn't know result count until scrolling to results section | Add live count badge near search input |

### P2 — Medium Priority Optimization

| # | Issue | Recommendation |
|---|-------|----------------|
| 9 | **PropertyGridView `text-[10px]` and `text-[11px]` used 14 times** — specs, labels, and badges below readability threshold on some displays | Audit and upgrade to `text-xs` minimum where possible |
| 10 | **No skeleton-to-content crossfade** — search loading uses plain `animate-pulse` rectangles without smooth transition to real cards | Add `animate-in fade-in` on result appearance |
| 11 | **VR badge `animate-pulse` is distracting** — continuous pulsing on multiple cards creates visual noise | Remove pulse or limit to first occurrence |
| 12 | **Monthly payment estimate `≈ Rp X/PB` is unclear** — "PB" abbreviation may confuse users | Clarify to "/bulan" or remove if not accurate |
| 13 | **Heart button has no save state persistence** — `savedProperties` is local useState, lost on refresh | Connect to Supabase saved_properties table |

### P3 — Enhancement Opportunities

| # | Recommendation |
|---|----------------|
| 14 | Add **"Similar properties"** micro-recommendation at end of results page |
| 15 | Implement **"Back to results"** sticky button when navigating from detail modal |
| 16 | Add **demand signal microcopy** on high-view properties (e.g., "12 people viewed today") |
| 17 | Implement **price drop alert badge** on recently reduced listings |
| 18 | Add **comparison mode** quick-select (already exists as `PropertyComparisonButton` but low visibility) |

---

## Sort Label Psychology (Before vs After)

### Before (Generic)
```
Newest First | Oldest First | Price: Low to High | Price: High to Low | Most Popular | AI Deal Score
```

### After (Behavioral Anchoring)
```
✨ Best Opportunity | 🕐 Newest Listings | 💰 Best Value First | 💎 Premium First | 🔥 Most Popular | 📊 AI Deal Score
```

- "Best Opportunity" as default → frames AI scoring as primary discovery mode
- "Best Value First" → reframes price_asc as opportunity perception
- "Premium First" → reframes price_desc for aspirational browsing

---

## PropertyCard Badge Color Migration

### Before (Hardcoded)
```tsx
// Listing type badges
'bg-gradient-to-r from-emerald-500 to-green-600'  // Sale
'bg-gradient-to-r from-sky-500 to-blue-600'        // Rent
'bg-gradient-to-r from-violet-500 to-purple-600'   // VR Tour
```

### After (Semantic Tokens)
```tsx
// Uses design system chart colors + semantic tokens
'bg-chart-1 text-chart-1-foreground'               // Sale (green semantic)
'bg-primary text-primary-foreground'                // Rent (brand color)
'bg-accent text-accent-foreground'                  // VR Tour
```

---

## Mobile Search Psychology

### Current Issues
- Search panel loads via lazy `AstraSearchPanel` with 500ms simulated delay
- QuickFiltersChipBar has good touch targets (`min-h-[44px]`)
- PropertyGridView correctly uses `sm:grid-cols-2` for mobile
- Pagination scroll behavior can be disorienting on mobile

### Recommendations
1. **Sticky quick-action bar** at bottom of results with "Filter" + "Sort" + "Map" buttons
2. **Reduce card content density** on mobile — hide monthly payment estimate
3. **Infinite scroll option** for mobile instead of pagination
4. **Search input should auto-focus** when StickyHeaderSearch appears

---

## Performance Concerns

1. **PropertyCard console.log spam** — 6 logs × N cards × every render = significant perf drag ✅ Fixed
2. **OptimizedPropertySearch is 4,379 lines** — needs decomposition into smaller hooks
3. **50+ state variables** in OptimizedPropertySearch — candidate for useReducer
4. **Search results limited to 50** via `.limit(50)` — fine for now but pagination should reflect this cap
5. **LazyRender + Suspense double-wrapping** in several places — redundant

---

## Implementation Priorities

### Sprint 1 (Applied)
- ✅ Remove PropertyCard debug console.logs
- ✅ Migrate badge colors to semantic tokens
- ✅ Upgrade sort labels with behavioral anchoring

### Sprint 2 (Recommended)
- Reduce grid to 3 columns at xl breakpoint
- Add skeleton crossfade transitions
- Remove VR badge animate-pulse
- Fix search result count text size

### Sprint 3 (Recommended)
- Implement demand signal microcopy
- Add persistent save state
- Zero-results psychological recovery UX
- Mobile sticky action bar
