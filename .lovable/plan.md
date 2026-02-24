

## Add Map View to Property Listing Pages

### Overview
Integrate the existing `PropertyListingMapView` component into the `PropertyListingPage` with a view mode toggle (Grid / Map), so users can switch between browsing properties in a card grid or on an interactive Mapbox map with clustered markers and property preview popups.

### What Changes

#### 1. Update `src/pages/PropertyListingPage.tsx`
- **Add a view mode toggle** (Grid | Map) in the sticky header next to the Filter button, using the existing `PropertyViewModeToggle` component (simplified to just "grid" and "map" options, or reusing the existing toggle with list/grid/map).
- **Add state**: `viewMode` state (`'grid' | 'map'`), defaulting to `'grid'`.
- **Conditionally render** the property grid OR the `PropertyListingMapView` based on the selected view mode.
- **Extract `formatPrice`** into a shared helper so it can be passed to `PropertyListingMapView` (currently defined inline inside the `.map()` callback).
- **Pass properties** to `PropertyListingMapView` with the correct shape (`id`, `title`, `price`, `city`, `images`).

### Technical Details

**Header area** (around line 209-234): Add view mode toggle buttons next to the Filter button:
```
[Grid icon] [Map icon]   [Filter button]
```

**Conditional rendering** (around line 332-463): Wrap the existing grid in a condition:
- If `viewMode === 'grid'`: show current grid + infinite scroll sentinel
- If `viewMode === 'map'`: show `PropertyListingMapView` with current properties

**No new files needed** -- both `PropertyListingMapView` and `PropertyViewModeToggle` already exist. This is purely an integration task in `PropertyListingPage.tsx`.

### Files to Modify
- `src/pages/PropertyListingPage.tsx` -- add view toggle state, import existing components, conditionally render map vs grid

