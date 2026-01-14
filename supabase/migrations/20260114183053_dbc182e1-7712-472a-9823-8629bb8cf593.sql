-- Allow public (anon) read access ONLY to explicitly public settings, while keeping sensitive categories private

-- 1) Replace the blanket anon deny policy with a safe public-read SELECT policy
DROP POLICY IF EXISTS "deny_anonymous_system_settings" ON public.system_settings;

-- Explicitly deny writes for anon (defense-in-depth)
DROP POLICY IF EXISTS "anon_no_insert_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "anon_no_update_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "anon_no_delete_system_settings" ON public.system_settings;

CREATE POLICY "anon_no_insert_system_settings"
ON public.system_settings
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "anon_no_update_system_settings"
ON public.system_settings
FOR UPDATE
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "anon_no_delete_system_settings"
ON public.system_settings
FOR DELETE
TO anon
USING (false);

-- Public read policy for anon, limited to is_public=true and excluding sensitive categories
DROP POLICY IF EXISTS "anon_public_read_system_settings" ON public.system_settings;
CREATE POLICY "anon_public_read_system_settings"
ON public.system_settings
FOR SELECT
TO anon
USING (
  is_public = true
  AND category <> ALL (
    ARRAY[
      'api',
      'astra_api',
      'authentication',
      'billing',
      'credentials',
      'keys',
      'secrets',
      'database',
      'security'
    ]::text[]
  )
);

-- 2) Mark branding assets as public so the website can load logos for all visitors
UPDATE public.system_settings
SET is_public = true
WHERE category = 'general'
  AND key IN (
    'headerLogo',
    'footerLogo',
    'faviconUrl',
    'emailLogoUrl',
    'mobileAppIcon',
    'chatbotLogo',
    'welcomePageImage',
    'welcomePageBackgroundImage',
    'loginPageBackground',
    'defaultPropertyImage',
    'defaultAvatarImage'
  );
