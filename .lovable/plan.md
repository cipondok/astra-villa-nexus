

# Category-Specific "Delete All" Button

## Overview
Add a "Delete All [Category]" button to each category tab that deletes **all** notifications of that specific type directly from the database, with live progress tracking.

## Changes

### 1. Database: New RPC function for category-specific counts
Create `get_admin_alerts_count_by_category(category_types text[])` -- a Postgres function that returns the exact count of alerts matching given type patterns, so the progress bar shows the real total (not capped at 1,000).

### 2. UI: Per-category "Delete All" button
- When viewing a specific category tab (system, property, application, other), show a **"Delete All [Category]"** button next to the select-all checkbox area
- The button triggers a new `clearCategoryMutation` that:
  1. Queries the real count via RPC or count query
  2. Fetches IDs in batches of 500 (filtered by category types)
  3. Deletes in chunks of 20, updating the progress bar
- Uses the same progress bar already in place
- Disabled during any active delete operation

### 3. Category type mapping
Reuse the existing `categorize()` logic to map category tabs to database `type` values:
- **system**: `critical`, `security`, `warning`, `info`
- **property**: types containing `property` or `listing`
- **application**: `property_owner_application`, `vendor_application`, `agent_application`
- **other**: everything else (requires fetching all then filtering, or a DB function)

### Technical Details

**File: `supabase/migrations/` (new migration)**
```sql
CREATE OR REPLACE FUNCTION public.delete_admin_alerts_by_types(type_patterns text[])
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  deleted_count integer := 0;
  batch_ids uuid[];
BEGIN
  LOOP
    SELECT array_agg(id) INTO batch_ids
    FROM (SELECT id FROM admin_alerts WHERE type = ANY(type_patterns) LIMIT 500) sub;
    
    IF batch_ids IS NULL OR array_length(batch_ids, 1) IS NULL THEN EXIT; END IF;
    
    DELETE FROM admin_alerts WHERE id = ANY(batch_ids);
    deleted_count := deleted_count + array_length(batch_ids, 1);
  END LOOP;
  RETURN deleted_count;
END;
$$;
```

**File: `src/components/admin/AdminNotificationsCenter.tsx`**
- Add a helper `getCategoryTypes(category)` that returns the DB type values for each category
- Add `clearCategoryMutation` that calls the RPC function or does client-side batch delete filtered by type
- Add a "Delete All [Category]" destructive button in the category tab area, visible only when `categoryTab !== 'all'`
- Show progress bar during category deletion with accurate counts
- Invalidate all relevant query keys on completion

