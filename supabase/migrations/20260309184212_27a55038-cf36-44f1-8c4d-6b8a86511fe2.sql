
CREATE OR REPLACE FUNCTION public.delete_all_admin_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_alerts;
END;
$$;
