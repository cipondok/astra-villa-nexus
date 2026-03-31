
-- Fix 1: Add sensitive category filter to authenticated user read policy on system_settings
DROP POLICY IF EXISTS "public_read_only_system_settings" ON public.system_settings;
CREATE POLICY "public_read_only_system_settings" ON public.system_settings
  FOR SELECT TO authenticated
  USING (
    is_public = true
    AND category NOT IN ('api', 'astra_api', 'authentication', 'billing', 'credentials', 'keys', 'secrets', 'database', 'security')
  );

-- Fix 2: Remove editor-accessible policies from astra_reward_config and keep only strict access
DROP POLICY IF EXISTS "Admins can delete astra_reward_config" ON public.astra_reward_config;
DROP POLICY IF EXISTS "Admins can insert astra_reward_config" ON public.astra_reward_config;
DROP POLICY IF EXISTS "Admins can manage reward config" ON public.astra_reward_config;
DROP POLICY IF EXISTS "Admins can manage reward configs" ON public.astra_reward_config;
DROP POLICY IF EXISTS "Admins can select astra_reward_config" ON public.astra_reward_config;
DROP POLICY IF EXISTS "Admins can update astra_reward_config" ON public.astra_reward_config;
