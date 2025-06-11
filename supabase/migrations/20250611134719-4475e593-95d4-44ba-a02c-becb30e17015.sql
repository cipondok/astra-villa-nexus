
-- Create a simple admin check function that avoids recursion
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_role text;
BEGIN
  -- Get current user info directly without triggering RLS
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if user is super admin by email
  IF user_email = 'mycode103@gmail.com' THEN
    RETURN true;
  END IF;
  
  -- Check if user has admin role in profiles (using a direct query)
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Also fix the admin_users table policies to prevent recursion
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.admin_users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.admin_users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.admin_users;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.admin_users;

-- Create simple, non-recursive policies for admin_users
CREATE POLICY "Super admin can manage admin users" ON public.admin_users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'mycode103@gmail.com'
  )
);

CREATE POLICY "Read access for authenticated users" ON public.admin_users
FOR SELECT USING (auth.uid() IS NOT NULL);
