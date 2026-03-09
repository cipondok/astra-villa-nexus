
DROP FUNCTION IF EXISTS public.delete_admin_alerts_by_types(text[]);

CREATE OR REPLACE FUNCTION public.delete_admin_alerts_by_types(p_types text[])
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count bigint;
BEGIN
  DELETE FROM public.admin_alerts WHERE type = ANY(p_types);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
