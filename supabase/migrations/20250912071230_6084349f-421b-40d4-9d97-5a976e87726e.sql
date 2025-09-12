-- Ensure authenticated role has base privileges with RLS enforcing row access
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.vendor_business_profiles TO authenticated;
-- Optional: allow admins via function-based policy; base grants already cover
-- No DELETE grant for safety