ALTER FUNCTION public.get_listing_moderation_counts() SECURITY INVOKER;
DROP POLICY IF EXISTS "Admins view all properties" ON public.properties;