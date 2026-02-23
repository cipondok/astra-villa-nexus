

# Infinite Scroll Pagination for Property Listing Pages

## Overview

Add infinite scroll to property listing pages so properties load in batches (e.g., 12 at a time) as users scroll down, instead of loading all at once. This improves initial load performance and provides a smoother browsing experience.

## Approach

Reuse the existing `useIntersectionObserver` hook to detect when the user scrolls near the bottom of the list, then fetch the next batch from Supabase using `offset` and `limit` pagination.

## Changes

### 1. Create `useInfiniteProperties` hook

**New file**: `src/hooks/useInfiniteProperties.ts`

A reusable hook that manages:
- `properties` array (accumulates batches)
- `isLoading` (initial load) and `isFetchingMore` (subsequent loads)
- `hasMore` flag to stop fetching when no more results
- `loadMore()` function triggered by the intersection observer
- Accepts query config (listing_type, development_status, filters) as parameters
- Uses Supabase `.range(offset, offset + limit - 1)` for pagination
- Resets state when filters change

### 2. Update `PropertyListingPage.tsx`

- Replace the current `fetchProperties` + `useState` with `useInfiniteProperties`
- Change `limit(50)` to paginated fetches of 12 per batch
- Add a sentinel `<div ref={sentinelRef} />` after the property grid
- Show a small spinner when `isFetchingMore` is true
- Show "No more properties" text when `hasMore` is false
- Search results also use infinite scroll

### 3. Update `Dijual.tsx`

- Replace `fetchProperties` with `useInfiniteProperties` configured for `listing_type: 'sale'`
- Client-side filtering still applies on the accumulated properties array
- Add sentinel div and loading indicator after the grid
- Keep demo data fallback when no real data exists

### 4. Update `Disewa.tsx`

- Same pattern as Dijual.tsx but for `listing_type: 'rent'`

## Technical Details

```text
Hook API:

useInfiniteProperties({
  listingType?: string,
  developmentStatus?: string[],
  pageSize?: number,       // default 12
  initialEnabled?: boolean
})

Returns:
  properties: any[]
  isLoading: boolean
  isFetchingMore: boolean
  hasMore: boolean
  loadMore: () => void
  reset: () => void
```

**Sentinel pattern** using the existing `useIntersectionObserver`:

```text
[Property Grid]
  - Card 1
  - Card 2
  - ...
  - Card 12
[Sentinel div] <-- ref from useIntersectionObserver
  When visible --> calls loadMore()
[Loading spinner or "End of results"]
```

**Filter change handling**: When filters change, call `reset()` which clears accumulated properties and re-fetches from offset 0.

## Files Summary

| File | Action |
|------|--------|
| `src/hooks/useInfiniteProperties.ts` | Create -- reusable infinite scroll hook |
| `src/pages/PropertyListingPage.tsx` | Edit -- integrate infinite scroll |
| `src/pages/Dijual.tsx` | Edit -- integrate infinite scroll |
| `src/pages/Disewa.tsx` | Edit -- integrate infinite scroll |

No new dependencies needed.

