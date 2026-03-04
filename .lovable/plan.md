

## Plan: Low-Connectivity Adaptive Mode

Your PWA and caching infrastructure is already strong. The main gap is **adaptive behavior** — automatically reducing data usage when the connection is slow. Here's what I'll build:

### 1. Data Saver Context & Hook
Create a `useDataSaver` hook + React context that:
- Auto-activates on slow connections (using existing `useConnectionSpeed`)
- Allows manual toggle via user preference (persisted in localStorage)
- Exposes `isDataSaver` boolean app-wide

### 2. Adaptive Image Loading
- Update `OptimizedPropertyImage` to load smaller image transforms (e.g., `width=400` instead of `1280`) when data saver is active
- Skip non-essential images (decorative backgrounds, partner logos) on slow connections
- Reduce image quality parameter in Supabase storage URLs

### 3. Reduce Non-Essential Network Requests
- Disable or increase intervals for background polling (e.g., AI recommendations, analytics pings) on slow connections
- Defer loading of heavy components (3D viewer, maps, charts) behind explicit user tap ("Tap to load")
- Skip auto-playing animations/carousels

### 4. Data Saver Toggle in UI
- Add a small toggle in the network status indicator or settings area so users can manually enable/disable data saver mode
- Show current estimated data savings

### 5. Extended Cache Durations on Slow Connections
- When data saver is active, increase API cache duration (e.g., 5 min → 30 min for listings) in the service worker via a message channel
- Prefer stale cache responses more aggressively

### Files to Create/Modify
- **New**: `src/contexts/DataSaverContext.tsx` — context + provider + hook
- **New**: `src/components/DataSaverToggle.tsx` — UI toggle component
- **Modify**: `src/components/property/OptimizedPropertyImage.tsx` — adaptive image sizing
- **Modify**: `src/components/NetworkStatusIndicator.tsx` — integrate data saver toggle
- **Modify**: `public/sw.js` — listen for data-saver message to extend cache TTLs
- **Modify**: `src/App.tsx` — wrap with DataSaverProvider
- **Modify**: Heavy component loaders (maps, 3D) — gate behind data saver check

