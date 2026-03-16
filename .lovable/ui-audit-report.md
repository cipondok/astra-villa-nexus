# ASTRAVILLA UI/UX Audit Report
> Date: 2026-03-16 | Auditor: Lovable AI

## ✅ FIXES IMPLEMENTED (This Session)

### 1. Global `transition-colors` Paint Storm (CRITICAL — P0)
**File:** `src/index.css` line 321
**Problem:** `* { @apply border-border transition-colors duration-200; }` applied transition to EVERY element, causing full-page repaint on theme toggle.
**Fix:** Scoped transitions to interactive elements only (`a, button, input, select, textarea, [role]`).

### 2. Mobile Heading `!important` Overrides (P0)
**File:** `src/index.css` lines 170-210
**Problem:** `h1-h4, p` had `!important` font-size overrides on mobile, flattening all component-level typography hierarchy. No card title could be larger than 1.25rem on mobile.
**Fix:** Removed `!important` and `p` override entirely. Components now control their own mobile typography via Tailwind responsive classes.

### 3. Homepage Section Spacing Rhythm (P1)
**File:** `src/pages/Index.tsx`
**Problem:** All content sections used `mb-4` (16px) creating cramped, undifferentiated spacing. Premium layouts need breathing room.
**Fix:** Upgraded to `mb-6` (24px) with `space-y-6` container rhythm. Marketplace services section uses `mt-8`.

### 4. Property Card Padding Inconsistency (P1)
**File:** `src/components/home/FeaturedPropertiesCarousel.tsx`
**Problem:** Card content used `p-3 sm:p-3.5` — the 3.5 is an unusual spacing value breaking the 4px grid rhythm.
**Fix:** Standardized to `p-3 sm:p-4` for clean 12px→16px responsive stepping.

### 5. Card Feature Divider Spacing (P1)
**Problem:** Feature row border-top used `pt-1` (4px) — too cramped for visual separation.
**Fix:** Upgraded to `pt-2` with `border-border/40` for subtler divider.

### 6. Rental Card Padding (P1)
**File:** `src/components/rental/RentalPropertyCard.tsx`
**Problem:** Used `p-2.5` (10px) — non-standard padding outside the 4px grid.
**Fix:** Standardized to `p-3` (12px). Added `transition-all` for smoother hover.

### 7. Card Hover Color Tokens (P1)
**Problem:** `FeaturedPropertiesCarousel` used `gold-primary` for hover effects — inconsistent with semantic token system.
**Fix:** Replaced with `primary` token (`hover:shadow-primary/10`, `hover:border-primary/30`, `group-hover:text-primary`).

---

## 🔍 REMAINING FINDINGS (Prioritized Action Plan)

### P0 — Critical (Fix This Week)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| A1 | **Montserrat font loaded but rarely used** (~300KB). Only `btn-cta` references it. | `index.css` line 6 | Performance: LCP |
| A2 | **`text-[9px]` / `text-[7px]` / `text-[8px]`** used extensively in RentalPropertyCard, DealHunterHero, SyncedPropertyCard. Below WCAG minimum (12px). | Multiple components | Accessibility |
| A3 | **Missing `will-change-transform`** on cards with hover translate/scale effects | FeaturedPropertiesCarousel, SyncedPropertyCard | Janky hover on mid-range devices |

### P1 — High (Fix This Sprint)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| B1 | **HUD styles use hardcoded colors** (`#00ffff`, `#ffd700`, `rgba(...)`) instead of CSS tokens | `index.css` lines 1214-1270 | Theme inconsistency |
| B2 | **Duplicate shimmer keyframe** definitions (lines 684 and 1288) | `index.css` | CSS bloat |
| B3 | **No AI Deal Score badge** on FeaturedPropertiesCarousel cards | `FeaturedPropertiesCarousel.tsx` | Missing key feature |
| B4 | **Badge z-index risk** — `.z-10` CompareToggle vs `.z-[19]` overlay gradients on hero | `SyncedPropertyCard`, `Index.tsx` | Potential overlap |
| B5 | **No sticky mobile inquiry CTA** — users must scroll back to find contact options | `Index.tsx` | Mobile conversion loss |
| B6 | **Hero search panel** can overflow on small screens (`max-h-[85vh]` with `overflow-y-auto`) | `Index.tsx` line 659 | Mobile UX risk |

### P2 — Medium (Next 2 Sprints)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| C1 | **Card hover inconsistency** — `card-hover`, `card-smooth`, `card-ios` all define hover lift but with different values | `index.css` | Visual inconsistency |
| C2 | **No skeleton → content transition** — components snap from skeleton to real content without fade | Multiple lazy components | Jarring UX |
| C3 | **SyncedPropertyCard compact variant** has `w-72` fixed width, not responsive | `SyncedPropertyCard.tsx` line 76 | Mobile overflow |
| C4 | **Search panel background** uses hardcoded opacity on hero (`bg-black/60`) | `FeaturedPropertiesCarousel.tsx` line 225 | Theme-unaware |
| C5 | **Redundant glass classes** — `glass-effect`, `glass-card`, `glass-ios`, `macos-glass-effect` all very similar | `index.css` | 200+ lines deduplicable |

### P3 — Nice-to-Have

| # | Issue | Location |
|---|-------|----------|
| D1 | Add `font-display: swap` to @font-face declarations properly (current ones are empty stubs) | `index.css` lines 9-11 |
| D2 | Consolidate animation keyframes (6+ shimmer-like animations exist) | `index.css` |
| D3 | Add focus-visible ring to FeaturedPropertiesCarousel slide indicators | `Index.tsx` line 644 |
| D4 | `perspective-1000` defined twice (component layer and utility layer) | `index.css` |

---

## 📐 Design Token Health

| Token Category | Status | Notes |
|---|---|---|
| Colors (semantic) | ✅ Good | Well-structured light/dark HSL tokens |
| Colors (brand) | ⚠️ Mixed | `astra` namespace vs `gold`/`navy` duplication |
| Shadows | ✅ Good | Dark mode shadow tokens defined |
| Typography | ⚠️ Needs work | 3 font families loaded, only Inter used consistently |
| Spacing | ⚠️ Fixed | Was using non-grid values (2.5, 3.5), now standardized |
| Border radius | ✅ Good | `--radius` token with calc-based variants |
| Animations | ⚠️ Bloated | 15+ keyframes, many duplicated |

---

## 🎯 Recommended Next Steps

1. **Remove Montserrat import** — save ~300KB (only 1 reference)
2. **Audit all `text-[Npx]` below 11px** — replace with `text-[11px]` minimum
3. **Add floating mobile inquiry button** — bottom-safe-area CTA
4. **Consolidate glass classes** into 2 variants (glass-sm, glass-lg)
5. **Add skeleton→content crossfade** animation utility
