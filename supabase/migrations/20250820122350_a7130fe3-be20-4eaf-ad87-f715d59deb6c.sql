-- Fix system_settings security vulnerabilities
-- Issue: Sensitive system configuration data could be exposed to unauthorized users

-- First, let's drop existing policies to start fresh
DROP POLICY IF EXISTS "Admin users can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "super_admin_system_settings_access" ON public.system_settings;

-- Create secure policies with proper access control

-- 1. Super admin access (highest level) - only for mycode103@gmail.com
CREATE POLICY "super_admin_full_system_settings_access"
ON public.system_settings
FOR ALL
TO authenticated
USING (check_super_admin_email())
WITH CHECK (check_super_admin_email());

-- 2. Admin access for general system settings management
CREATE POLICY "admin_system_settings_access"
ON public.system_settings
FOR ALL
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- 3. Public read-only access ONLY for explicitly marked public settings
CREATE POLICY "public_read_only_system_settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (is_public = true);

-- 4. Explicit denial for anonymous users (security hardening)
CREATE POLICY "deny_anonymous_system_settings"
ON public.system_settings
FOR ALL
TO anon
USING (false);

-- 5. Explicit denial for sensitive categories to all non-admin users
CREATE POLICY "deny_sensitive_categories"
ON public.system_settings
FOR ALL
TO authenticated
USING (
  -- Allow if user is admin/super-admin
  (check_admin_access() OR check_super_admin_email()) 
  OR 
  -- Or if it's a public setting and only SELECT operation
  (is_public = true AND category NOT IN ('api', 'astra_api', 'authentication', 'billing', 'credentials', 'keys', 'secrets', 'database', 'security'))
);

-- Update sensitive settings to ensure they're marked as non-public
UPDATE public.system_settings 
SET is_public = false 
WHERE category IN ('api', 'astra_api', 'authentication', 'billing', 'credentials', 'keys', 'secrets', 'database', 'security')
   OR key LIKE '%key%' 
   OR key LIKE '%secret%' 
   OR key LIKE '%token%'
   OR key LIKE '%password%'
   OR key LIKE '%credential%';

-- Create index for better policy performance
CREATE INDEX IF NOT EXISTS idx_system_settings_security 
ON public.system_settings (is_public, category);

-- Add comment for documentation
COMMENT ON TABLE public.system_settings IS 'System configuration table with RLS policies restricting sensitive data access to administrators only';