

# Add Saved/Favorite Properties Page

## Overview

The backend infrastructure is already in place: a `favorites` table in Supabase, and a `useFavorites` hook that handles toggling. The `/saved` page currently only shows an empty state. This plan upgrades it to fetch and display the user's saved properties using the existing `CompactPropertyCard` component.

## Changes

### 1. Edit `src/pages/Saved.tsx`

Replace the static empty-state-only page with a fully functional saved properties page:

- **Fetch saved properties**: Query `favorites` table joined with `properties` table using Supabase, ordered by `created_at` descending (most recently saved first)
- **Loading state**: Show skeleton cards while data loads
- **Display properties**: Render saved properties using `CompactPropertyCard` in a responsive grid (same layout as `/dijual`)
- **Unsave action**: Wire the heart button on each card to `useFavorites.toggleFavorite()` so users can remove properties directly from this page; on successful removal, remove the card from the list with an optimistic update
- **Empty state**: Keep the existing empty state UI for when the user has no saved properties
- **Count indicator**: Show "N properti tersimpan" header text

### 2. No database changes needed

The `favorites` table already has a foreign key to `properties` and supports the required join query. RLS policies are already in place (user can only read/write their own favorites).

## Technical Details

Query approach:
```sql
-- Supabase JS equivalent
supabase
  .from('favorites')
  .select('id, property_id, created_at, properties(*)')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

This returns the full property data for each favorited item in a single query. The property data maps directly to the `CompactProperty` interface used by `CompactPropertyCard`.

The page will use `useQuery` from TanStack React Query (matching the pattern in `useUserDashboardData`) with a `queryKey` of `['saved-properties', user.id]` and invalidate on toggle.

## Files

| File | Action |
|------|--------|
| `src/pages/Saved.tsx` | Edit -- add data fetching, property grid, unsave functionality |

