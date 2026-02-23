CREATE OR REPLACE FUNCTION public.get_admin_alerts_counts()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total', (SELECT count(*) FROM admin_alerts),
    'unread', (SELECT count(*) FROM admin_alerts WHERE is_read = false)
  );
$$;