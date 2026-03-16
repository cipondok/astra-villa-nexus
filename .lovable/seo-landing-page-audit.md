# ASTRAVILLA SEO Landing Page UI Audit
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

Audited 3 location-based landing pages (`Properties.tsx`, `Dijual.tsx`, `ProvinceProperties.tsx`) across 7 SEO UX dimensions. The platform has **strong infrastructure** (SEOHead component, JSON-LD schemas, province mapping) but the location landing pages suffer from critical **accessibility violations** (`text-[8px]` used 3 times, `text-[9px]` once), **missing breadcrumb navigation**, **thin content perception** (no location intelligence blocks), and a **5-column grid** that creates extremely dense card layouts reducing dwell time.

---

## Architecture Overview

```
Location Landing Pages:
├─ /properties?location=X     → Properties.tsx (main location landing)
├─ /dijual                    → Dijual.tsx (for-sale listings)
├─ /disewa                    → Disewa.tsx (for-rent listings)
├─ /province-properties       → ProvinceProperties.tsx (province directory)
├─ /location                  → LocationMap.tsx (geospatial heatmap)
└─ /area-guides               → AreaGuides.tsx (neighborhood guides)

Flow: LocationMap → ProvinceProperties → Properties?location=X
```

---

## Audit Findings

### P0 — Critical SEO & Accessibility Issues

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | **`text-[8px]` used 3 times** — listing badge, property type badge, and clear filter button are below any readable threshold | `Properties.tsx:263,273,357,395` | Google may flag as inaccessible content | **Fixed** — upgraded to `text-[10px]` minimum |
| 2 | **`text-[9px]` on nav buttons** — back/home buttons unreadable | `Properties.tsx:263` | Accessibility violation | **Fixed** — upgraded to `text-[10px]` |
| 3 | **No breadcrumb navigation** — location pages lack structured breadcrumb trail (Home → Province → City → Listings) | `Properties.tsx` | Missing BreadcrumbList schema; hurts navigation and SEO | **Fixed** — added breadcrumb with JSON-LD |
| 4 | **H1 is `text-[10px]`** — "Properti di {location}" heading is styled as micro text, destroying heading hierarchy | `Properties.tsx:268` | Google sees minimal H1 value | **Fixed** — upgraded to proper heading size |
| 5 | **5-column grid at xl** — `xl:grid-cols-5` creates extreme density with tiny cards, reducing engagement | `Properties.tsx:315,343` | Higher bounce rate from visual overload | **Fixed** — reduced to `xl:grid-cols-4` |

### P1 — High Priority SEO Content Issues

| # | Issue | Recommendation |
|---|-------|----------------|
| 6 | **No location intelligence content block** — pages are pure listing grids with zero contextual text for search engines | Add a `LocationInsightBlock` component with market stats, avg price, property count by type |
| 7 | **No "Nearby Areas" exploration links** — users dead-end on location pages with no related location navigation | Add linked chips to adjacent cities/districts |
| 8 | **Generic SEO meta on Properties.tsx** — uses `t('seo.properties.title')` regardless of location filter | Dynamically generate title: "Properti di {Location} - {Count} Listing | ASTRAVILLA" |
| 9 | **Missing canonical tag** — Properties page with `?location=X` query params needs canonical to prevent duplicate indexing | Add canonical tag with location path |
| 10 | **No property count in page title** — search engines reward quantified content signals | Add count to meta title: "1,234 Properti di Bali" |

### P2 — Medium Priority UX Friction

| # | Issue | Recommendation |
|---|-------|----------------|
| 11 | **ProvinceProperties has no SEOHead** — province directory page has zero meta tags | Add SEOHead with province listing schema |
| 12 | **Dijual uses hardcoded demo properties** — 6 fake listings show when no data, polluting search index | Replace with skeleton/loading state or "coming soon" messaging |
| 13 | **Properties.tsx card specs use `text-[10px]`** — bedrooms/bathrooms/area at minimum threshold | Acceptable but monitor |
| 14 | **No structured data for individual listings** — cards don't emit ItemList schema | Add `seoSchemas.itemList()` for listing grids |
| 15 | **Location sub-header uses fixed positioning** — `fixed top-[40px]` can cause layout shift on different nav heights | Use sticky positioning instead |

### P3 — Enhancement Opportunities

| # | Recommendation |
|---|----------------|
| 16 | Add **"Investment Score" badge** to location landing header showing area attractiveness |
| 17 | Implement **"Price Trend" mini-chart** in location header for market signal |
| 18 | Add **FAQ section** with location-specific questions for rich snippet eligibility |
| 19 | Implement **pagination with URL params** (`?page=2`) for crawlability |
| 20 | Add **"Recently Sold" section** to demonstrate market activity |

---

## Properties.tsx Location Landing — Before vs After

### Before
```
- H1: text-[10px] "Properti di Bali • 42"
- Nav buttons: text-[9px], text-[10px]  
- Badge: text-[8px]
- Grid: xl:grid-cols-5 (5 columns)
- No breadcrumbs
- No location intelligence
- Generic meta title
```

### After  
```
- H1: text-sm/text-base "Properti di Bali"
- Nav buttons: text-[10px] minimum
- Badge: text-[10px] minimum  
- Grid: xl:grid-cols-4 (4 columns)
- Breadcrumb: Home → Peta Lokasi → {Location}
- Dynamic meta title with location name
- JSON-LD BreadcrumbList schema
```

---

## SEO Content Strategy Gaps

### Current State
Pages are **pure listing grids** — zero textual content for search engines to index. This creates "thin content" perception which can reduce ranking potential for location keywords.

### Recommended Content Blocks (Priority Order)

1. **Location Summary Card** (above grid)
   - Property count by type, average price, price range
   - Investment score from `investment_hotspots` table
   - "Market is {Hot/Growing/Stable}" signal

2. **Popular Property Types** (horizontal scroll)
   - Quick chips: "🏠 42 Rumah", "🏢 18 Apartemen", "🏖️ 7 Villa"
   - Each clickable to filter

3. **Nearby Areas** (below grid)
   - Linked location chips for adjacent districts/cities
   - Supports internal linking for SEO crawl depth

4. **Location FAQ** (bottom)
   - "Berapa harga rata-rata properti di {Location}?"
   - "Apa area investasi terbaik di {Location}?"
   - Schema markup for rich snippets

---

## Mobile SEO Landing Issues

1. **2-column grid on mobile** — adequate but cards are very compressed
2. **No sticky search/filter** — user must scroll back to top to refine
3. **Location header disappears on scroll** — loses context
4. **No "scroll to top" or "refine search" FAB** — reduces re-engagement

---

## Implementation Priorities

### Sprint 1 (Applied)
- ✅ Fix all text-[8px] and text-[9px] violations
- ✅ Upgrade H1 to proper heading size
- ✅ Reduce grid to 4 columns at xl
- ✅ Add breadcrumb navigation with JSON-LD
- ✅ Dynamic SEO meta title with location name

### Sprint 2 (Recommended)
- Add LocationInsightBlock component above grid
- Add Nearby Areas exploration links below grid  
- Fix Dijual demo property pollution
- Add SEOHead to ProvinceProperties

### Sprint 3 (Recommended)  
- Implement location FAQ with schema markup
- Add ItemList structured data for listing grids
- URL-based pagination for crawlability
- Investment score in location header
