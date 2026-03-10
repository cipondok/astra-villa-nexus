

# Fix Property Image Manager -- Accurate Counts and Image Display

## Problems Identified

1. **Stats are wrong**: The query fetches properties without a row limit, but Supabase defaults to 1000 rows max. The stats ("Total", "With Images", "No Images") reflect only that 1000-row subset, not the actual database totals (283,856 properties, 125,649 with images, 158,207 without).

2. **No total image count**: The dashboard doesn't show how many total images exist in the database (125,693 images).

3. **Property list dominated by "no image" entries**: Newer properties (no images) appear first due to `order by created_at desc`, making it look like nothing has images.

## Plan

### 1. Add server-side count queries for accurate stats
Instead of computing stats from the fetched array, use separate Supabase `count` queries with `head: true`:
- Total properties count
- Properties with images count (using `not.is.null` filter on `images`)
- Total image count (new RPC function)

Create a small Supabase RPC function `get_total_image_count` that runs:
```sql
SELECT COALESCE(SUM(array_length(images, 1)), 0)::int FROM properties;
```

### 2. Add "Total Images" stat card
Add a 5th stat card showing the total image count across all properties (125,693). This gives the user the metric they asked for.

### 3. Fix property list to prioritize properties WITH images
Change the default query ordering and filtering:
- Default filter to "with-images" instead of "all" so the manager opens showing properties that have images
- Add secondary sort: properties with images first, then by created_at desc
- Keep pagination at 30 per page with server-side pagination using `.range()`

### 4. Show image thumbnails in property list cards
The property cards in the list already show image counts but may not render the actual thumbnail preview correctly when `images` is a text array. Verify the rendering uses `getImages()` helper properly and displays the first image as a small thumbnail.

## Files to Change

- **New migration**: Create `get_total_image_count` RPC function
- **`src/components/admin/PropertyImageManager.tsx`**: 
  - Replace client-side stats with server-side count queries
  - Add "Total Images" stat card
  - Change default filter to "with-images"
  - Add server-side pagination with `.range()`
  - Ensure thumbnail previews render in the property list

