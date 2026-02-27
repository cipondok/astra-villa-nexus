

# Remove Dead Code Files

## Files to Delete (3 files)
These files are never imported anywhere in the codebase — they only reference themselves:

1. **`src/components/ParticleEffect.tsx`** — Uses `three` + `@react-three/fiber` + `@react-three/drei`. Never imported.
2. **`src/components/home/PropertyTour3D.tsx`** — Uses `three` + `@react-three`. Never imported.
3. **`src/components/search/EnhancedPropertySearch.tsx`** — Large component with map imports. Never imported.

## Impact
- Removes ~600 lines of dead code
- Eliminates additional static references to `three`/`@react-three` that Rollup still processes during module resolution
- Reduces build graph complexity, further helping with OOM prevention

