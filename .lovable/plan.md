

# Bundle Size Audit & Reduction Plan

## Findings

After auditing the codebase, the following heavy dependencies are either unused or statically imported where they should be dynamic:

### Safely removable from `package.json`
| Package | Size | Reason |
|---------|------|--------|
| `@vladmandic/face-api` | ~4MB | Only used via dynamic `import()` in `EmotionTracker.tsx` — but the package itself is listed as a dependency, pulling type metadata. Already dynamic, so no code change needed, but the dep entry forces Vite to process it. |
| `@types/qrcode.react` | tiny | Only one usage in `StickySearchPanel.tsx` — already works without the types package |
| `@types/dompurify` | tiny | Types-only, fine to keep |
| `qrcode.react` | ~30KB | Single usage in `StickySearchPanel` — should be dynamically imported |

### Static imports to convert to `React.lazy` / dynamic `import()`

1. **`IndonesiaMap`** in `LocationMap.tsx` — statically imports `react-simple-maps` (~120KB) + `topojson-client` (~15KB). The page itself is lazy-loaded, but the map component does a static import. This is fine since the route is already code-split. No change needed.

2. **`PropertyListingMapView.tsx`** and **`FilterMapView.tsx`** — statically import `mapbox-gl` (~800KB) and `DOMPurify` (~60KB). These should use dynamic imports.

3. **`ImageCropper`** in `AvatarUpload.tsx` — statically imports `react-image-crop` (~25KB). Should be `lazy()`.

4. **`DOMPurify`** in 4 files — statically imported (~60KB). Should use a lazy utility wrapper.

5. **`StickySearchPanel.tsx`** — statically imports `QRCodeSVG` from `qrcode.react` and multiple `recharts` components. Both should be dynamic.

## Implementation Steps

1. **Convert `ImageCropper` to lazy import** in `AvatarUpload.tsx`
2. **Create `src/utils/sanitize.ts`** — a thin async wrapper around DOMPurify that dynamically imports it, replacing the 4 static imports
3. **Convert `QRCodeSVG` to dynamic import** in `StickySearchPanel.tsx`
4. **Ensure `PropertyListingMapView` and `FilterMapView` lazy-load `mapbox-gl`** (check if they're already behind lazy routes — if so, no change needed)
5. **Remove `@vladmandic/face-api` from `package.json` dependencies** — it's only used via dynamic `import()` at runtime from a CDN pattern, so the npm package is dead weight. Keep the dynamic import in `EmotionTracker.tsx` as-is.

### Estimated savings
- Removing face-api from bundling: ~4MB from `node_modules` processing
- DOMPurify dynamic: ~60KB moved out of initial chunks
- QRCode dynamic: ~30KB moved out of initial chunks
- ImageCropper dynamic: ~25KB moved out of initial chunks

Total: **~115KB+ moved from eager to lazy chunks**, plus significant Vite dev-server speedup from dropping face-api processing.

