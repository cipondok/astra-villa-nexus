-- Secure the api_settings table to protect API keys and credentials
-- Drop existing policies and recreate with proper security

-- First ensure RLS is enabled
ALTER TABLE public.api_settings ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be too permissive
DROP POLICY IF EXISTS "Admins can manage API settings" ON public.api_settings;
DROP POLICY IF EXISTS "Public can read API settings" ON public.api_settings;
DROP POLICY IF EXISTS "Anyone can view API settings" ON public.api_settings;

-- Create secure policies that restrict access to API credentials

-- Only admins can view API settings (with sensitive data)
CREATE POLICY "Only admins can view API settings"
ON public.api_settings
FOR SELECT
TO authenticated
USING (check_admin_access());

-- Only admins can insert new API settings
CREATE POLICY "Only admins can insert API settings"
ON public.api_settings
FOR INSERT
TO authenticated
WITH CHECK (check_admin_access());

-- Only admins can update API settings
CREATE POLICY "Only admins can update API settings"
ON public.api_settings
FOR UPDATE
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Only admins can delete API settings
CREATE POLICY "Only admins can delete API settings"
ON public.api_settings
FOR DELETE
TO authenticated
USING (check_admin_access());

-- Ensure no anonymous access is possible
-- Add an explicit deny policy for anonymous users
CREATE POLICY "Deny anonymous access to API settings"
ON public.api_settings
FOR ALL
TO anon
USING (false);

-- Add a comment to document the security measures
COMMENT ON TABLE public.api_settings IS 'Contains sensitive API keys and credentials. Access restricted to admin users only via RLS policies.';
COMMENT ON COLUMN public.api_settings.api_key IS 'Sensitive credential - access restricted to admin users only';
COMMENT ON COLUMN public.api_settings.api_endpoint IS 'API endpoint information - access restricted to admin users only';