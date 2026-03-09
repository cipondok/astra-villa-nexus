

# Fix Delete All Alerts - RPC Functions Broken

## Root Cause
Three issues found:

1. **`delete_all_admin_alerts()`** uses bare `DELETE FROM admin_alerts` without a WHERE clause. Supabase/PostgREST blocks this with error "DELETE requires a WHERE clause". Fix: add `WHERE true`.

2. **`delete_admin_alerts_except_types()`** RPC is called in code but **never created** in any migration. This causes the "Other" category delete to fail.

3. **`count_admin_alerts()`** RPC is also referenced but never created, so the total count header doesn't work.

4. All RPCs need `SET statement_timeout = '120s'` to avoid statement timeout on large tables.

## Plan

### Migration (single SQL file)
Recreate all three RPCs with proper fixes:

```sql
-- 1. Fix delete_all: add WHERE true
CREATE OR REPLACE FUNCTION public.delete_all_admin_alerts()
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public SET statement_timeout = '120s'
AS $$ ... DELETE FROM admin_alerts WHERE true; GET DIAGNOSTICS ... $$

-- 2. Fix delete_by_types: add timeout  
CREATE OR REPLACE FUNCTION public.delete_admin_alerts_by_types(p_types text[])
RETURNS bigint ... SET statement_timeout = '120s'

-- 3. Create missing delete_except_types
CREATE OR REPLACE FUNCTION public.delete_admin_alerts_except_types(p_types text[])
RETURNS bigint ... DELETE WHERE type != ALL(p_types) OR type IS NULL

-- 4. Create missing count function
CREATE OR REPLACE FUNCTION public.count_admin_alerts()
RETURNS bigint ... SELECT count(*) FROM admin_alerts

-- 5. Add index on type column for performance
CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON admin_alerts(type);
```

### No component changes needed
The frontend code already correctly calls all these RPCs. Only the database functions are missing/broken.

### Files
- **Create**: 1 new migration SQL file

