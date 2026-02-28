

## Neighborhood Insights on Property Detail Page

### Current State
- `NeighborhoodInsights` component exists but is NOT used on the property detail page — only on the Analytics page
- The component uses hardcoded demo data (scores, nearby places) and has no interactive map
- Property detail page has `city`, `location`, `coordinates` fields available

### Plan

**1. Create `src/components/property/PropertyNeighborhoodMap.tsx`**
- New component that combines an interactive Mapbox map with neighborhood POI markers
- Uses the property's city/coordinates to center the map
- Generates simulated nearby POIs (schools, hospitals, transit, malls, restaurants) with markers using category-specific colors/icons
- Clickable markers with popup showing name, type, and distance
- Category filter buttons (All, Schools, Hospitals, Transit, Shopping) to toggle marker visibility
- Compact card layout with gold theming matching the rest of the detail page

**2. Create `src/components/property/PropertyNeighborhoodInsights.tsx`**
- Wrapper component that combines the map + analytics cards
- Generates city-aware mock data for mobility scores (walk/transit/bike) and nearby places based on property city
- Three stat cards in a row: Education, Transportation, Safety (reusing the pattern from existing `NeighborhoodInsights` but slimmed down for the detail page)
- Mobility score badges below the map
- Nearby places list with distance and type badges

**3. Edit `src/pages/PropertyDetail.tsx`**
- Import and place `PropertyNeighborhoodInsights` in the main content column (after the description/features tabs card, before the 3D viewer section)
- Pass `city`, `coordinates`, and `propertyType` props

### Technical Details
- Reuses existing Mapbox token (`MAPBOX_TOKEN`) and `cityCoordinates` map from `PropertyListingMapView`
- POI data is generated deterministically from city name (seeded pseudo-random offsets from city center)
- Map height constrained to 300px for the detail page context
- Lazy-loaded to avoid blocking initial render
- Mobile responsive: stat cards stack vertically, map takes full width

