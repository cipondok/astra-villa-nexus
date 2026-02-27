

# Fix OOM Build Error: Lazy/Dynamic Imports

## Problem
Rollup runs out of memory (3GB+) because heavy libraries (`mapbox-gl`, `three`, `@react-three/*`, `wagmi`) are statically imported, forcing the entire dependency graph into memory simultaneously.

## Changes (11 files)

### 1. Add default export to FilterMapView
**`src/components/search/FilterMapView.tsx`** — Add `export default FilterMapView` at end of file (needed for `React.lazy`).

### 2. Lazy-load map components (removes `mapbox-gl` from static graph)

**`src/pages/Dijual.tsx`** (line 18):
- Replace `import PropertyListingMapView from "..."` with `const PropertyListingMapView = lazy(() => import("..."))`, add `lazy, Suspense` to React import, wrap usage in `<Suspense>`.

**`src/pages/Disewa.tsx`** (line 16):
- Same pattern.

**`src/pages/PropertyListingPage.tsx`** (line 13):
- Same pattern.

**`src/pages/AdvancedSearchPage.tsx`** (line 31):
- Replace `import PropertyMapView` with `const PropertyMapView = lazy(() => import("..."))`, wrap usage in `<Suspense>`.

**`src/pages/PropertySearch.tsx`** (line 13):
- Same pattern.

**`src/components/search/EnhancedPropertySearch.tsx`** (line 18):
- Same pattern.

**`src/components/search/AdvancedPropertyFilters.tsx`** (line 22):
- Replace `import { FilterMapView }` with `const FilterMapView = lazy(() => import("./FilterMapView"))`, add `lazy, Suspense` to React import, wrap usage in `<Suspense>`.

### 3. Lazy-load 3D components (removes `three` + `@react-three` from static graph)

**`src/pages/PropertyDetail.tsx`** (line 16):
- Replace `import GLBModelViewer` with `const GLBModelViewer = lazy(() => import("..."))`, wrap usage in `<Suspense>`.

**`src/components/property/VideoTourViewer.tsx`** (line 3):
- Replace `import Panorama360Viewer` with `const Panorama360Viewer = lazy(() => import("./Panorama360Viewer"))`, wrap usage in `<Suspense>`.

### 4. Dynamic THREE import in use3DOptimization.ts

**`src/hooks/use3DOptimization.ts`** (line 2):
- Remove `import * as THREE from 'three'`
- Replace all `THREE.` references in the file with dynamically imported THREE: each function that uses THREE will call `const THREE = await import('three')` at its start
- Change interface types referencing `THREE.Scene`, `THREE.Camera`, etc. to `any` to avoid needing the static type import

### Suspense Fallback Pattern
All lazy-loaded components will be wrapped with:
```tsx
<Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
  <LazyComponent />
</Suspense>
```

## Expected Result
By breaking the static import chain for mapbox-gl (~2MB), three (~2MB), @react-three (~1MB), and their transitive dependencies, Rollup will process these as separate async chunks with significantly lower peak memory usage, resolving the OOM crash.

