

# Add Map View Toggle to Property Listing Pages

## Overview

Add a grid/map view toggle to both `/dijual` and `/disewa` pages. Users can switch between the current grid view and a Mapbox map showing property locations with clickable markers and popup cards.

## Approach

Reuse the existing `PropertyViewModeToggle` component (grid + map options) and create a new `PropertyListingMapView` component that renders a Mapbox map from an array of already-filtered properties (unlike `FilterMapView` which fetches its own data from Supabase).

## Changes

### 1. New file: `src/components/property/PropertyListingMapView.tsx`

A Mapbox map component that:
- Accepts `properties[]` and `formatPrice` function as props
- Places markers at city coordinates (same city-coordinate lookup as `FilterMapView`)
- Shows clickable popups with property title, price, image thumbnail, and a "View" button that navigates to `/properties/:id`
- Uses the existing Mapbox token and `useLocationSettings` for default center
- Full-height container with loading spinner

### 2. Edit: `src/pages/Dijual.tsx`

- Add `viewMode` state (`'grid' | 'map'`, default `'grid'`)
- Import `PropertyViewModeToggle` and `PropertyListingMapView`
- Place the toggle in the header area (next to property count)
- When `viewMode === 'map'`, render `PropertyListingMapView` with `filteredProperties` instead of the grid
- Hide infinite scroll sentinel when in map mode

### 3. Edit: `src/pages/Disewa.tsx`

- Same pattern: add `viewMode` state, toggle in header, conditional rendering between grid and map view

## Technical Details

The `PropertyListingMapView` component will:
- Group properties by city and place cluster markers
- On marker click, show a popup with a scrollable list of properties in that city (max 3 shown, with "+N more" link)
- Each popup item shows: thumbnail, title, price, and links to detail page
- Map height: `min-h-[500px] h-[calc(100vh-250px)]` for good mobile/desktop coverage

```text
Header: [Properti Dijual - 24 tersedia]  [Grid | Map]
        [Search bar + filters]
        [InlineFilterPanel]

Grid mode:                    Map mode:
[Card][Card][Card][Card]      [=========Mapbox Map=========]
[Card][Card][Card][Card]      [  (3) Jakarta   (2) Bandung ]
[sentinel + loading]          [      (1) Surabaya          ]
                              [============================]
```

## Files Summary

| File | Action |
|------|--------|
| `src/components/property/PropertyListingMapView.tsx` | Create -- Mapbox map accepting properties array with popups |
| `src/pages/Dijual.tsx` | Edit -- add viewMode state + toggle + conditional map/grid |
| `src/pages/Disewa.tsx` | Edit -- add viewMode state + toggle + conditional map/grid |

No new dependencies needed. Uses existing mapbox-gl, PropertyViewModeToggle, and useLocationSettings.
