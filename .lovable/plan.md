

## Problem Analysis

The `/dijual`, `/disewa`, and `PropertyListingPage` pages all render `PropertyViewModeToggle` in their headers, but the `viewMode` state is **only used to switch to map view**. When `viewMode === 'list'`, the code falls through to the same grid layout as `viewMode === 'grid'`. There is no conditional branch that renders `PropertyListView`.

The `PropertyListView` component itself is working (it was fixed previously with `onClick` handlers). The bug is that it is never imported or rendered in these three pages.

## Plan

### 1. Fix `src/pages/Dijual.tsx`

- **Import** `PropertyListView` and `PropertyGridView` from `@/components/search/`
- **Replace** the single grid block (lines 476-570) with a conditional:
  - `viewMode === 'list'` → render `<PropertyListView>` with compact styling, passing `filteredProperties`, `onPropertyClick`, `onSave`, `onShare`, `onContact`
  - `viewMode === 'grid'` (default) → keep existing grid cards as-is
- Wire `onPropertyClick` to `navigate('/properties/${property.id}')`

### 2. Fix `src/pages/Disewa.tsx`

- **Import** `PropertyListView`
- **Replace** the single grid block (lines 369-418) with the same list/grid conditional
- Wire `onPropertyClick` to `navigate('/properties/${property.id}')`

### 3. Fix `src/pages/PropertyListingPage.tsx`

- **Import** `PropertyListView`
- **Replace** the single grid block (lines 386-469) with the same list/grid conditional
- Wire navigation similarly

### Summary of Changes

| File | Change |
|------|--------|
| `src/pages/Dijual.tsx` | Import `PropertyListView`; add `viewMode === 'list'` branch before existing grid |
| `src/pages/Disewa.tsx` | Import `PropertyListView`; add `viewMode === 'list'` branch before existing grid |
| `src/pages/PropertyListingPage.tsx` | Import `PropertyListView`; add `viewMode === 'list'` branch before existing grid |

Each page already has `viewMode` state and `PropertyViewModeToggle`. The only missing piece is the conditional rendering of `PropertyListView` when list mode is selected.

