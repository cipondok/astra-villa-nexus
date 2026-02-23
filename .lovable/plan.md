
# Add Pull-to-Refresh on Property Listing Pages

## Overview

Extract the existing pull-to-refresh logic from `Search.tsx` into a reusable hook, then apply it to the **Homepage** (Index.tsx) and **Properties page** (Properties.tsx) for mobile users.

## Changes

### 1. Create Reusable Hook: `usePullToRefresh`

**New file: `src/hooks/usePullToRefresh.ts`**

Extract the pull-to-refresh touch logic from `Search.tsx` into a standalone hook that returns:
- State: `isPulling`, `pullDistance`, `isRefreshing`
- Computed: `indicatorOpacity`, `indicatorRotation`
- Touch handlers: `onTouchStart`, `onTouchMove`, `onTouchEnd`
- Config: accepts `onRefresh` callback, optional `threshold` (default 80px)

Includes haptic feedback (`navigator.vibrate`) and resistance curve on pull distance.

### 2. Create Reusable Component: `PullToRefreshIndicator`

**New file: `src/components/ui/PullToRefreshIndicator.tsx`**

Extract the animated indicator UI (the floating pill with spinning RefreshCw icon and status text) from `Search.tsx` into a reusable component. Uses framer-motion for enter/exit animations.

Props: `isPulling`, `isRefreshing`, `pullDistance`, `indicatorOpacity`, `indicatorRotation`, `threshold`.

### 3. Apply to Homepage (Index.tsx)

- Import the hook and indicator component
- Wrap the main content div with touch handlers from `usePullToRefresh`
- The `onRefresh` callback will invalidate React Query cache for `sale-properties` and `rent-properties` query keys, triggering a refetch of both property sections
- Show the `PullToRefreshIndicator` at the top
- Display a toast on completion

### 4. Apply to Properties Page (Properties.tsx)

- Same pattern: hook + indicator + toast
- The `onRefresh` callback will call the existing query's `refetch()`

### 5. Refactor Search.tsx

- Replace the inline pull-to-refresh logic with the new `usePullToRefresh` hook and `PullToRefreshIndicator` component
- Keeps the same behavior (new property highlighting, count diff toasts) but with cleaner code

## Technical Details

### Hook API

```typescript
const {
  isPulling, pullDistance, isRefreshing,
  indicatorOpacity, indicatorRotation,
  handlers // { onTouchStart, onTouchMove, onTouchEnd }
} = usePullToRefresh({
  onRefresh: async () => { /* refetch data */ },
  threshold: 80
});
```

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/usePullToRefresh.ts` | Reusable pull-to-refresh touch logic |
| `src/components/ui/PullToRefreshIndicator.tsx` | Animated refresh indicator UI |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add hook + indicator + touch handlers on main container |
| `src/pages/Properties.tsx` | Add hook + indicator + touch handlers on main container |
| `src/pages/Search.tsx` | Refactor to use shared hook + indicator (reduces ~80 lines) |
