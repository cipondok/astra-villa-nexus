-- Drop existing functions first to allow return type change
DROP FUNCTION IF EXISTS public.delete_all_admin_alerts();
DROP FUNCTION IF EXISTS public.delete_admin_alerts_by_types(text[]);
DROP FUNCTION IF EXISTS public.delete_admin_alerts_except_types(text[]);
DROP FUNCTION IF EXISTS public.count_admin_alerts();

-- 1. delete_all_admin_alerts
CREATE FUNCTION public.delete_all_admin_alerts()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '120s'
AS $$
DECLARE
  deleted_count bigint;
BEGIN
  DELETE FROM admin_alerts WHERE true;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 2. delete_admin_alerts_by_types
CREATE FUNCTION public.delete_admin_alerts_by_types(p_types text[])
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '120s'
AS $$
DECLARE
  deleted_count bigint;
BEGIN
  DELETE FROM admin_alerts WHERE type = ANY(p_types);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 3. delete_admin_alerts_except_types
CREATE FUNCTION public.delete_admin_alerts_except_types(p_types text[])
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '120s'
AS $$
DECLARE
  deleted_count bigint;
BEGIN
  DELETE FROM admin_alerts WHERE type != ALL(p_types) OR type IS NULL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 4. count_admin_alerts
CREATE FUNCTION public.count_admin_alerts()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '30s'
AS $$
DECLARE
  total bigint;
BEGIN
  SELECT count(*) INTO total FROM admin_alerts;
  RETURN total;
END;
$$;

-- 5. Index for performance
CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON admin_alerts(type);