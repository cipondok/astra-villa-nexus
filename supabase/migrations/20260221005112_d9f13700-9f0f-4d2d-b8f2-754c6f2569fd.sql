-- Remove the overly permissive policy
DROP POLICY IF EXISTS "allow_public_profile_read_for_display" ON public.profiles;

-- Recreate the view as security_definer so it bypasses RLS
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT id, full_name, avatar_url, verification_status, user_level_id
FROM public.profiles;