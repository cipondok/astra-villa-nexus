
-- First, completely disable RLS temporarily to clear any problematic state
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on admin_users to ensure clean slate
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_users' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.admin_users';
    END LOOP;
END $$;

-- Drop any potentially problematic functions
DROP FUNCTION IF EXISTS public.get_current_user_admin_status() CASCADE;
DROP FUNCTION IF EXISTS public.is_current_user_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_current_user_super_admin_safe() CASCADE;

-- Create a completely isolated function that doesn't reference any tables with RLS
CREATE OR REPLACE FUNCTION public.check_super_admin_email()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT email = 'mycode103@gmail.com' FROM auth.users WHERE id = auth.uid()),
    false
  );
$$;

-- Re-enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "super_admin_full_access" ON public.admin_users
FOR ALL USING (public.check_super_admin_email());

-- Also fix system_settings to use the same function
DROP POLICY IF EXISTS "super_admin_can_manage_system_settings" ON public.system_settings;

CREATE POLICY "super_admin_system_settings_access" ON public.system_settings
FOR ALL USING (public.check_super_admin_email());
