-- This policy was meant to scope reads but, as an ALL policy, it let any signed-in
-- user change any public marketplace setting (e.g. the sample-listing switch).
DROP POLICY IF EXISTS deny_sensitive_categories ON public.system_settings;
CREATE POLICY deny_sensitive_categories ON public.system_settings
  FOR SELECT TO authenticated
  USING (
    check_admin_access() OR check_super_admin_email()
    OR ((is_public = true) AND (category <> ALL (ARRAY['api','astra_api','authentication','billing','credentials','keys','secrets','database','security'])))
  );