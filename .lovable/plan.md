

# Add Pull-to-Refresh on Property Listing Pages

## Overview

Add pull-to-refresh functionality to `/dijual` and `/disewa` pages so mobile users can swipe down to reload the latest properties. This reuses the existing `usePullToRefresh` hook and `PullToRefreshIndicator` component already in the codebase.

## Changes

### 1. `src/pages/Dijual.tsx`

- Import `usePullToRefresh` and `PullToRefreshIndicator`
- Initialize the hook with `onRefresh` calling `reset()` from `useInfiniteProperties`
- Attach `handlers` (onTouchStart, onTouchMove, onTouchEnd) to the outermost wrapper `<div>`
- Render `<PullToRefreshIndicator />` at the top of the component

### 2. `src/pages/Disewa.tsx`

- Same pattern as Dijual: import hook + indicator, wire up `reset()` as the refresh callback, attach touch handlers to wrapper div, render indicator.

### Implementation Pattern

```tsx
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator';

// Inside component:
const { reset } = useInfiniteProperties({ ... });

const {
  isPulling, pullDistance, isRefreshing,
  indicatorOpacity, indicatorRotation, threshold,
  handlers
} = usePullToRefresh({
  onRefresh: async () => { reset(); }
});

// In JSX:
return (
  <div {...handlers}>
    <PullToRefreshIndicator
      isPulling={isPulling}
      isRefreshing={isRefreshing}
      pullDistance={pullDistance}
      indicatorOpacity={indicatorOpacity}
      indicatorRotation={indicatorRotation}
      threshold={threshold}
    />
    {/* existing page content */}
  </div>
);
```

## Files Modified

| File | Change |
|------|--------|
| `src/pages/Dijual.tsx` | Add pull-to-refresh hook + indicator |
| `src/pages/Disewa.tsx` | Add pull-to-refresh hook + indicator |

No new files or dependencies needed.

