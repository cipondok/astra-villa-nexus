# ASTRAVILLA PropertyCard — Pixel-Perfect Component Specification
**Date:** 2026-03-16 | **Status:** Active

---

## Current State Assessment

The card (`PropertyCard.tsx`, 406 lines) is structurally sound with proper `card-hover-lift`, `img-hover-zoom`, and `btn-press` utility classes from the interaction audit. Key issues are **price typography not matching platform constraints** (`font-bold` instead of required `font-black` + `drop-shadow-sm`), **missing listing freshness indicator**, and **no fixed card height** causing grid misalignment when cards have varying content (VR buttons, agent info, ratings).

---

## Layout Proportions

| Element | Current | Spec | Status |
|---------|---------|------|--------|
| Image aspect ratio | `aspect-[4/3]` | `aspect-[4/3]` | ✅ Correct |
| Content padding | `p-3 sm:p-4` (12px / 16px) | `p-3 sm:p-4` | ✅ Correct |
| Card border radius | Default Card (rounded-xl) | `rounded-xl` | ✅ Correct |
| Responsive min-width | Inherited from grid parent | 280px min via grid | ✅ Correct |

## Typography Hierarchy

| Element | Current | Required | Issue |
|---------|---------|----------|-------|
| **Price** | `text-lg sm:text-xl font-bold text-primary` | `text-lg sm:text-xl font-black text-primary drop-shadow-sm` | ❌ Missing `font-black` + `drop-shadow-sm` per platform constraints |
| Title | `text-sm sm:text-base font-semibold line-clamp-1` | Same | ✅ |
| Location | `text-xs sm:text-sm text-muted-foreground` | Same | ✅ |
| Specs | `text-xs sm:text-sm text-muted-foreground` | Same | ✅ |
| Badges | `text-xs font-bold` | Same | ✅ |
| Agent name | `text-xs font-medium` | Same | ✅ |
| Freshness | Not present | `text-[10px] text-muted-foreground` | ❌ Missing |

## Hover Elevation System

| Property | Value | Status |
|----------|-------|--------|
| translateY | `-4px` on hover, `-1px` on active | ✅ via `.card-hover-lift` |
| Shadow | `0 12px 28px -8px hsl(primary/0.12)` | ✅ |
| Duration | 250ms cubic-bezier(0.33, 1, 0.68, 1) | ✅ |
| Active duration | 100ms | ✅ |
| Image zoom | `scale(1.05)` 400ms | ✅ via `.img-hover-zoom` |
| `will-change` | `transform` | ✅ |

## Issues Found & Applied

### P0 — Applied
1. **Price font-weight** → `font-black` + `drop-shadow-sm` (platform constraint)
2. **Listing freshness indicator** → Added `Clock` icon with `formatTimeAgo` below location

### P1 — Recommended (Future)
3. **Inconsistent card heights in grids** — Cards with VR buttons + agent + rating are ~80px taller than minimal cards. Recommend: move VR/agent/rating into the detail modal, keeping card content uniform (image + price + title + location + specs only)
4. **3 border-t dividers possible** — specs, agent, rating each add `border-t`. Max 3 horizontal lines in content zone creates visual noise. Recommend: keep only specs divider
5. **Disabled AR button** — `cursor-not-allowed opacity-60` button is confusing. Recommend: remove entirely until feature is ready
