
-- First, let's create a proper admin access function that doesn't cause recursion
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT p.role = 'admin' OR p.email = 'mycode103@gmail.com'
     FROM public.profiles p 
     WHERE p.id = auth.uid()),
    false
  );
$$;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can delete system settings" ON public.system_settings;

-- Create new policies using the fixed function
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

-- Ensure RLS is enabled
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
