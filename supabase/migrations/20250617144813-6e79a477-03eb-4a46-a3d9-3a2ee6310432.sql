
-- Fix infinite recursion in admin_users table policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "admin_users_select_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_insert_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_delete_policy" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin email can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Authenticated users can read admin users" ON public.admin_users;

-- Create a simple security definer function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin_direct()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get current user email directly from auth.users without triggering RLS
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if user is super admin by email
  RETURN user_email = 'mycode103@gmail.com';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create non-recursive policies for admin_users table
CREATE POLICY "super_admin_can_manage_admin_users" ON public.admin_users
FOR ALL USING (public.is_super_admin_direct());

-- Allow users to read their own admin_users record
CREATE POLICY "users_can_read_own_admin_record" ON public.admin_users
FOR SELECT USING (user_id = auth.uid());

-- Fix system_settings policies to use the new function
DROP POLICY IF EXISTS "Admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can delete system settings" ON public.system_settings;

CREATE POLICY "super_admin_can_manage_system_settings" ON public.system_settings
FOR ALL USING (public.is_super_admin_direct());
