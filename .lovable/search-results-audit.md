# ASTRAVILLA Search Results UI Audit Report
> Date: 2026-03-16 | Focus: Search Results Page & Browsing Experience

## ✅ FIXES IMPLEMENTED (This Session)

### 1. Grid Density Optimization (P0)
**Problem:** Grid used `grid-cols-2` on smallest screens (320px) = cards at ~150px wide, unreadable text and cramped CTAs.
**Fix:** Changed to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` with `gap-4 sm:gap-5` for breathing room.

### 2. Sub-10px Text Accessibility (P0)
**Problem:** 6 instances of `text-[9px]` in PropertyGridView (KT/KM/LB labels, monthly payment, image count, CTA button).
**Fix:** All raised to `text-[10px]`+. CTA button text raised to `text-[11px]`.

### 3. Price Prominence Enhancement (P1)
**Problem:** Price at `text-base` was too close in size to title text, weak visual hierarchy.
**Fix:** Price raised to `text-lg sm:text-xl font-black` with `drop-shadow-sm`. Padding increased to `px-3 py-2`.

### 4. Title Readability (P1)
**Problem:** Title at `text-[11px] font-medium` was too light and small.
**Fix:** Upgraded to `text-xs sm:text-sm font-semibold` for scanability.

### 5. Card Hover & Performance (P1)
**Problem:** Cards lacked `will-change-transform`, used hardcoded `rgba()` shadows.
**Fix:** Added `will-change-transform`, replaced with `hsl(var(--primary)/0.15)` semantic shadow, added `-translate-y-0.5` hover lift.

### 6. Sort Controls Enhancement (P1)
**Problem:** Sort lacked AI Deal Score option, no visual differentiation for AI sort.
**Fix:** Added "AI Deal Score" sort option with Sparkles icon, highlighted in primary color.

### 7. Results Count Emphasis (P2)
**Problem:** Count text at `font-semibold` blended with surrounding text.
**Fix:** Split into bold count number (`text-lg font-bold`) + descriptive label, added loading spinner.

### 8. Skeleton Loading Improvement (P2)
**Problem:** Skeleton grid used 3-column max (`xl:grid-cols-3`) mismatched with actual 4-column results grid.
**Fix:** Matched skeleton to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, added spec chip placeholders.

### 9. Active Filter Pills Styling (P2)
**Problem:** Filter badges used default `secondary` variant, low contrast.
**Fix:** Added `bg-primary/10 border-primary/20` for better visibility, destructive-colored clear button.

### 10. CTA Button Sizing (P2)
**Problem:** WhatsApp CTA at `h-7` was below 44px touch target.
**Fix:** Raised to `h-8` with `text-[11px] font-semibold`.

---

## 🔍 REMAINING FINDINGS

### P0 — Critical

| # | Issue | Location |
|---|-------|----------|
| A1 | `deal_score` sort option added to UI but no backend sort implementation | AdvancedSearchPage L103-118 |
| A2 | No AI Deal Score badge visible on search result cards | PropertyGridView — missing InvestmentScoreBadge |
| A3 | FacetedFilterPanel fetches ALL properties for facet counts (no pagination) — expensive on large datasets | FacetedFilterPanel L80-195 |

### P1 — High

| # | Issue | Impact |
|---|-------|--------|
| B1 | **Bedrooms/Bathrooms sections default closed** in FacetedFilterPanel — users may miss key filters | FacetedFilterPanel L74-76 |
| B2 | Mobile filter sheet width fixed at `w-80` (320px) — too narrow on tablets | AdvancedSearchPage L311 |
| B3 | No scroll-position memory on back-navigation from property detail | AdvancedSearchPage — uses modal but full page nav loses position |
| B4 | Pagination `smooth` scroll conflicts with layout stability standards | AdvancedSearchPage L463 — should use `behavior: 'instant'` per platform standards |

### P2 — Medium

| # | Issue | Impact |
|---|-------|--------|
| C1 | No quick filter chip bar on search results page | Missing QuickFiltersChipBar integration |
| C2 | View mode toggle hidden on mobile (`hidden sm:flex`) | Mobile users can't switch to list/map |
| C3 | No "Back to top" floating button for long result lists | Browsing fatigue |
| C4 | Empty state uses Sparkles icon — should suggest nearby properties or trending listings | Missed conversion opportunity |

---

## 🎯 Recommended Next Steps

1. **Implement `deal_score` backend sort** — order by `investment_score` descending
2. **Add InvestmentScoreBadge to PropertyGridView** — floating on card image top-right
3. **Fix pagination scroll** — change to `behavior: 'instant'` per platform standards
4. **Open Bedrooms/Price filters by default** in FacetedFilterPanel
5. **Add QuickFiltersChipBar** below search header on results page
6. **Show view mode toggle on mobile** with compact icon-only buttons
