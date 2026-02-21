-- Create a public view for property card display with only non-sensitive fields
CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT id, full_name, avatar_url, verification_status, user_level_id
FROM public.profiles;

-- Allow anonymous SELECT on public_profiles by adding a permissive policy on profiles for this view
-- Since security_invoker is on, we need a policy that allows reading these rows
-- Add a minimal read policy for public profile display
CREATE POLICY "allow_public_profile_read_for_display"
ON public.profiles
FOR SELECT
USING (true);
