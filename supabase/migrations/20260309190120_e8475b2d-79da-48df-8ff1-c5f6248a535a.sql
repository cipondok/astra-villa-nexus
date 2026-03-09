-- Count alerts by read status
CREATE OR REPLACE FUNCTION public.count_admin_alerts_by_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '30s'
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total', count(*),
    'unread', count(*) FILTER (WHERE is_read = false),
    'read', count(*) FILTER (WHERE is_read = true)
  ) INTO result FROM admin_alerts;
  RETURN result;
END;
$$;

-- Count alerts grouped by type
CREATE OR REPLACE FUNCTION public.count_admin_alerts_by_type()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '30s'
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_object_agg(COALESCE(type, 'unknown'), cnt)
  INTO result
  FROM (SELECT type, count(*) as cnt FROM admin_alerts GROUP BY type) t;
  RETURN result;
END;
$$;

-- Add index for is_read queries
CREATE INDEX IF NOT EXISTS idx_admin_alerts_is_read ON admin_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created_at ON admin_alerts(created_at DESC);