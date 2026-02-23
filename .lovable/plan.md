

# Improve Mobile Responsive Layout for Property Cards

## Overview

Optimize grid spacing, card sizes, and touch targets across all property card components for better mobile usability.

## Changes

### 1. Grid Spacing and Section Padding

**Files: `PropertiesForSaleSection.tsx`, `PropertiesForRentSection.tsx`**

- Section padding: Change `p-3` to `px-2 py-3 sm:p-3` -- tighter horizontal padding on mobile to maximize card width
- Grid gap: Change `gap-2 sm:gap-3` to `gap-1.5 sm:gap-3` -- slightly tighter gap on mobile so cards get more room
- Grid columns stay at `grid-cols-2` on mobile (good use of space)

**File: `PropertyCardSkeleton.tsx`**

- Match the same grid gap: `gap-1.5 sm:gap-3`

### 2. Touch Target Improvements

**Files: `ASTRAVillaPropertyCard.tsx`, `PropertiesForSaleSection.tsx`, `PropertiesForRentSection.tsx`**

All interactive elements on cards need minimum 44px touch targets on mobile:

- Heart button in ASTRAVillaPropertyCard: Change `h-7 w-7` (28px) to `h-8 w-8 sm:h-7 sm:w-7` -- larger on mobile, compact on desktop
- Heart icon: Change `h-3.5 w-3.5` to `h-4 w-4 sm:h-3.5 sm:w-3.5`
- Entire card already has `cursor-pointer` and acts as a touch target (good)

### 3. Card Content Mobile Optimization

**Files: `PropertiesForSaleSection.tsx`, `PropertiesForRentSection.tsx`**

- Content padding: Change `p-2.5` to `p-2 sm:p-2.5` -- slightly tighter on mobile
- Price container padding: Change `px-2.5 py-2` to `px-2 py-1.5 sm:px-2.5 sm:py-2`
- Monthly estimate badge: Hide on mobile to reduce clutter -- add `hidden sm:inline` to the monthly payment span
- Spec labels (KT, KM): Keep visible but ensure they wrap cleanly with `flex-wrap` (already present)

**File: `ASTRAVillaPropertyCard.tsx`**

- Content padding: Change `p-3` to `p-2 sm:p-3`
- Price container: Change `px-2.5 py-2` to `px-2 py-1.5 sm:px-2.5 sm:py-2`
- Monthly estimate: Add `hidden sm:inline` to hide on small screens

### 4. PropertySlideSection Mobile Grid Fix

**File: `PropertySlideSection.tsx`**

The `card-grid` class forces 1 column on mobile via CSS override, wasting space. Fix the slide layout for mobile:

- Loading skeleton: Change from `card-grid gap-4` to `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4`
- Slide grid: Change from `card-grid gap-4` to `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4`
- This bypasses the CSS override that forces 1 column and gives a cleaner responsive layout

### 5. SimilarProperties Mobile Grid

**File: `SimilarProperties.tsx`**

- Grid: `grid-cols-2 lg:grid-cols-3` is already good
- Gap: Change `gap-2 sm:gap-3` -- already good, no changes needed

### 6. Mobile CSS Override Cleanup

**File: `src/styles/mobile-optimizations.css`**

- The `.mobile-app-layout .card-grid` override forces `grid-template-columns: 1fr !important` which breaks multi-column layouts. Since PropertySlideSection will use explicit grid classes instead, this override should be updated to `repeat(2, 1fr)` to allow 2 columns on mobile for card grids.

---

## Technical Summary

| Area | Current | Updated |
|------|---------|---------|
| Section padding | `p-3` | `px-2 py-3 sm:p-3` |
| Grid gap (Sale/Rent) | `gap-2 sm:gap-3` | `gap-1.5 sm:gap-3` |
| Heart button size | `h-7 w-7` (28px) | `h-8 w-8 sm:h-7 sm:w-7` |
| Card content padding | `p-2.5` / `p-3` | `p-2 sm:p-2.5` / `p-2 sm:p-3` |
| Price padding | `px-2.5 py-2` | `px-2 py-1.5 sm:px-2.5 sm:py-2` |
| Monthly estimate | Always visible | `hidden sm:inline` on mobile |
| Slide section grid | `card-grid` (1col mobile) | Explicit `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Mobile CSS card-grid | `1fr !important` | `repeat(2, 1fr) !important` |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/property/PropertiesForSaleSection.tsx` | Padding, gap, touch targets, content density |
| `src/components/property/PropertiesForRentSection.tsx` | Padding, gap, touch targets, content density |
| `src/components/property/ASTRAVillaPropertyCard.tsx` | Touch targets, content padding, hide monthly on mobile |
| `src/components/property/PropertySlideSection.tsx` | Replace card-grid with explicit responsive grid |
| `src/components/property/PropertyCardSkeleton.tsx` | Match updated grid gap |
| `src/styles/mobile-optimizations.css` | Update card-grid mobile override to 2 columns |
