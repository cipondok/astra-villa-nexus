# ASTRAVILLA Property Card UI Audit Report
> Date: 2026-03-16 | Focus: Property Listing Card Components

## ✅ FIXES IMPLEMENTED (This Session)

### Across All 5 Card Variants
(`ASTRAVillaPropertyCard`, `CompactPropertyCard`, `ModernPropertyCard`, `FeaturedPropertiesCarousel`, `SyncedPropertyCard`)

---

### 1. Accessibility — Sub-12px Text Sizes (P0)
**Problem:** 23 instances of `text-[8px]` and `text-[9px]` across card components (below WCAG minimum ~11px).
**Fix:** Raised all sub-10px text to `text-[10px]` minimum. Spec labels (KT, KM, LB) raised from 8px→10px. Location text raised from 9px→11px. Deal score badges 9px→10px.
**Files:** `ASTRAVillaPropertyCard`, `CompactPropertyCard`, `ModernPropertyCard`, `DealHunterHero`

### 2. `will-change-transform` Missing (P0)
**Problem:** Cards with `hover:-translate-y-1` and `hover:scale-105` caused layout recalculations and janky animations on mid-range devices.
**Fix:** Added `will-change-transform` to all card root elements across 4 variants.

### 3. Hardcoded `gold-primary` Token Usage (P1)
**Problem:** `ModernPropertyCard` used `gold-primary` for hover borders, shadows, badges, avatars, ratings — 15+ instances. Should use semantic `primary` token for theme consistency.
**Fix:** Replaced all `gold-primary` references with `primary` in ModernPropertyCard, CompactPropertyCard hover states, and FeaturedPropertiesCarousel.

### 4. Price Emphasis Enhancement (P1)
**Problem:** Price was `font-black` but lacked visual weight differentiation from surrounding content on ASTRA card.
**Fix:** Added `drop-shadow-sm` to price text. Upgraded title from `text-xs` to `text-[13px]` for better hierarchy.

### 5. Card Content Padding Standardization (P1)
**Problem:** Inconsistent content padding across variants:
- `ASTRAVillaPropertyCard`: `p-2 sm:p-3` (8px→12px)
- `ModernPropertyCard`: `p-2` (8px fixed)
- `CompactPropertyCard`: `p-1.5 sm:p-2 md:p-3`
**Fix:** Standardized to `p-2.5 sm:p-3` (10px→12px) for ASTRA and Modern cards.

### 6. InvestmentScoreBadge Upgrade (P1)
**Problem:** Badge used flat `text-[9px]` with basic outline styling. No visual presence on card images.
**Fix:** Complete redesign:
- Added `backdrop-blur-md` for glass effect on image overlays
- Added conditional glow shadows for A+/A/B+ grades
- Raised text to `text-[10px]` compact / `text-[11px]` full
- Color-coded grade system with distinct glow intensities

### 7. Hover Interaction Consistency (P2)
**Problem:** Different hover durations across cards: 300ms, 400ms, 500ms, 700ms.
**Fix:** Standardized card root lift to `duration-300` for border/shadow, kept image zoom at `duration-700` for cinematic feel.

---

## 🔍 REMAINING FINDINGS

### P0 — Critical

| # | Issue | Location |
|---|-------|----------|
| A1 | `CompactPropertyCard` action buttons use `text-[9px]` — fixed for labels but CTA button text still at 9px on mobile | CompactPropertyCard L394 |
| A2 | Discount badge uses `animate-pulse` on destructive background — seizure risk for photosensitive users | CompactPropertyCard L263, ModernPropertyCard L223 |

### P1 — High

| # | Issue | Impact |
|---|-------|--------|
| B1 | **5 card variants exist** with overlapping functionality — consolidation to 2 (grid + list) recommended | Maintenance burden |
| B2 | `ModernPropertyCard` hardcodes `rating = 4.5` when no rating exists (line 119) | Trust erosion — fake data |
| B3 | Missing AI Deal Score on `CompactPropertyCard` and `FeaturedPropertiesCarousel` | Key feature absent from primary views |
| B4 | Owner section in `ModernPropertyCard` uses `text-[9px]` for joining date | Below 10px minimum |

### P2 — Medium

| # | Issue | Impact |
|---|-------|--------|
| C1 | Image hover zoom inconsistent: 105% (Modern), 110% (Compact), 105% (ASTRA) | Visual inconsistency |
| C2 | Heart button positioning differs across cards (top-9 vs top-8 vs top-1.5) | UX confusion |
| C3 | No skeleton→content crossfade animation on `ASTRAVillaPropertyCard` | Content snap |
| C4 | `PropertyCard.tsx` (415 lines) — largest variant, needs audit separately | Complexity |

---

## 📐 Card Variant Inventory

| Variant | Lines | Used In | Has Score Badge | Has Owner Info |
|---------|-------|---------|-----------------|----------------|
| `ASTRAVillaPropertyCard` | 261 | SimilarProperties, AgentCarousel | ✅ | ❌ |
| `CompactPropertyCard` | 470 | PropertySlideSection, Search grid | ❌ | ✅ |
| `ModernPropertyCard` | 339 | Various grids | ❌ | ✅ |
| `PropertyCard` | 415 | Main grid views | ❌ | ✅ |
| `FeaturedPropertiesCarousel` (inline) | 100 | Homepage | ❌ | ❌ |

**Recommendation:** Consolidate to 2 variants — `ASTRAVillaPropertyCard` (with owner info + score badge) as the primary grid card, and a compact inline variant for carousels.

---

## 🎯 Recommended Next Steps

1. **Remove fake 4.5 rating** from ModernPropertyCard
2. **Add InvestmentScoreBadge** to CompactPropertyCard and FeaturedPropertiesCarousel
3. **Remove discount `animate-pulse`** — replace with static styling + `prefers-reduced-motion` guard
4. **Begin card consolidation** — merge ModernPropertyCard into ASTRAVillaPropertyCard
5. **Standardize image hover zoom** to 105% across all variants
