
-- First, let's check if there are any existing RLS policies on system_settings
-- and create proper policies for admin access

-- Drop any existing policies if they exist (this won't error if they don't exist)
DROP POLICY IF EXISTS "Admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can delete system settings" ON public.system_settings;

-- Create comprehensive admin policies for system_settings
CREATE POLICY "Admins can view system settings" 
  ON public.system_settings 
  FOR SELECT 
  USING (public.check_admin_access());

CREATE POLICY "Admins can insert system settings" 
  ON public.system_settings 
  FOR INSERT 
  WITH CHECK (public.check_admin_access());

CREATE POLICY "Admins can update system settings" 
  ON public.system_settings 
  FOR UPDATE 
  USING (public.check_admin_access())
  WITH CHECK (public.check_admin_access());

CREATE POLICY "Admins can delete system settings" 
  ON public.system_settings 
  FOR DELETE 
  USING (public.check_admin_access());

-- Ensure RLS is enabled on the table
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
