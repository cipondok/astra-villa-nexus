
# Add Sort Dropdown to Property Listing Pages

## Overview

Add a sort dropdown next to the view mode toggle on both `/dijual` and `/disewa` pages. Dijual already has sorting logic in its `useMemo` -- it just needs a visible UI control. Disewa needs both the UI and the sorting logic.

## Changes

### 1. Edit `src/pages/Dijual.tsx`

- Add a `Select` dropdown between the property count text and the `PropertyViewModeToggle`
- Options: Terbaru (newest, default), Terlama (oldest), Harga Terendah (price low), Harga Tertinggi (price high), Terpopuler (popular)
- Bind it to `filters.sortBy` via `updateFilter('sortBy', value)`
- Add "popular" case to the existing sort switch (sort by `views` or `click_count` if available, otherwise keep original order)

### 2. Edit `src/pages/Disewa.tsx`

- Add `sortBy: string` to the `RentalFilters` interface (default `'newest'`)
- Add sorting logic to the `filteredProperties` useMemo (same switch as Dijual)
- Add a `Select` dropdown in the header, same placement as Dijual

### Layout

The sort dropdown sits between the title/count and the view toggle:

```text
[Title + count]  [Sort: Terbaru v]  [Grid | Map]
```

On mobile, the sort dropdown collapses to a smaller width.

## Technical Details

Sort options (shared between both pages):

| Value | Label | Sort Logic |
|-------|-------|------------|
| `newest` | Terbaru | `created_at` descending |
| `oldest` | Terlama | `created_at` ascending |
| `price_low` | Harga Terendah | `price` ascending |
| `price_high` | Harga Tertinggi | `price` descending |
| `popular` | Terpopuler | `views` descending (fallback to original order) |

No new components or dependencies needed -- uses the existing `Select` component already imported in both pages.

## Files

| File | Action |
|------|--------|
| `src/pages/Dijual.tsx` | Edit -- add sort dropdown in header, add "popular" and "oldest" sort cases |
| `src/pages/Disewa.tsx` | Edit -- add `sortBy` to filters, add sort dropdown in header, add sorting logic to useMemo |
