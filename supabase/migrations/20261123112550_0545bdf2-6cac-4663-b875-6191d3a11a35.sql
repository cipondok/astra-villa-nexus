CREATE SCHEMA IF NOT EXISTS private;
ALTER FUNCTION public.set_property_slug() SET SCHEMA private;
REVOKE ALL ON FUNCTION private.set_property_slug() FROM public, anon, authenticated;
REVOKE ALL ON public.property_view_events FROM anon, authenticated;
DROP POLICY IF EXISTS "Admins can read property views" ON public.property_view_events;