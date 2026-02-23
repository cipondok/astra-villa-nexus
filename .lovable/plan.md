

# Add Unified Collapsible Filter Panel to Listing Pages

## Current State

- **Dijual** (`/dijual`): Uses `PropertySidebarFilters` -- a full-screen sidebar overlay with price slider, property type, bedrooms, bathrooms, area size, and features. Works well but is heavy and disrupts browsing flow.
- **Disewa** (`/disewa`): Uses `AdvancedRentalSearch` -- an inline collapsible panel with property type buttons, location, price dropdown, and rental period. Missing bedroom/bathroom filters and price range slider.

## Goal

Create a unified, inline collapsible filter panel component used on both pages that includes:
- Price range dual slider
- Property type checkboxes/pills
- Bedroom count selector
- Bathroom count selector
- Compact, non-overlay design that doesn't interrupt browsing

## Changes

### 1. Create `InlineFilterPanel` component

**New file**: `src/components/property/InlineFilterPanel.tsx`

A reusable collapsible filter panel that renders inline (not as a sidebar overlay). Includes:
- Collapsible wrapper using Radix Collapsible (already in project)
- **Price range**: Dual-thumb Slider (already in project) with formatted labels
- **Property type**: Pill-style toggle buttons (checkboxes)
- **Bedrooms**: Pill selector (Any, 1, 2, 3, 4, 5+)
- **Bathrooms**: Pill selector (Any, 1, 2, 3, 4+)
- Active filter count badge on the toggle button
- "Clear all" button when filters are active
- Smooth open/close animation via framer-motion

Props:
```text
filters: { propertyType, minPrice, maxPrice, bedrooms, bathrooms }
onFiltersChange: (updates) => void
propertyTypes: string[]        -- dynamic from data
maxPriceLimit?: number         -- 10B for sale, 100M for rent
priceStep?: number             -- 100M for sale, 500K for rent
isOpen: boolean
onToggle: () => void
```

### 2. Update `Dijual.tsx`

- Replace `PropertySidebarFilters` usage with the new `InlineFilterPanel`
- Render it between the search bar and the property grid
- Keep existing filter state and `useMemo` filtering logic unchanged
- Remove the sidebar overlay import

### 3. Update `Disewa.tsx`

- Add bedroom/bathroom fields to the `RentalFilters` interface (add `bedrooms: string` and `bathrooms: string`)
- Add `InlineFilterPanel` below the existing `AdvancedRentalSearch` (or replace the property type section of it)
- Add bedroom/bathroom matching to `filteredProperties` useMemo
- Use lower price limits appropriate for rentals

### 4. Keep existing components

`PropertySidebarFilters` and `AdvancedRentalSearch` remain in the codebase (no deletion) for backward compatibility, but the listing pages will use the new inline panel.

## Technical Details

The `InlineFilterPanel` layout on mobile (stacked) vs desktop (grid):

```text
Mobile:
[Toggle Button: "Filter (3)"]
  [Property Type pills - wrap]
  [Price Slider: Rp 0 --- Rp 10M]
  [Bedrooms: Any | 1 | 2 | 3 | 4 | 5+]
  [Bathrooms: Any | 1 | 2 | 3 | 4+]
  [Clear All]

Desktop:
[Toggle Button: "Filter (3)"]
  [Property Type pills] | [Price Slider]
  [Bedrooms pills]      | [Bathrooms pills]
  [Clear All]
```

## Files Summary

| File | Action |
|------|--------|
| `src/components/property/InlineFilterPanel.tsx` | Create -- new reusable inline collapsible filter panel |
| `src/pages/Dijual.tsx` | Edit -- replace sidebar filters with inline panel |
| `src/pages/Disewa.tsx` | Edit -- add bedroom/bathroom filters, integrate inline panel |

No new dependencies needed. Uses existing Slider, Collapsible, Badge, and framer-motion.
