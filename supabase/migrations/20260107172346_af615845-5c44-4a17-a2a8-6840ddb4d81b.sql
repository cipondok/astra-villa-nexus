
-- STEP 1: Create secure admin/role checking infrastructure
-- This fixes the function search_path issues and provides secure role checking

-- Drop and recreate the secure admin check function with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin_secure(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = _user_id
    AND (is_super_admin = true OR role_id IS NOT NULL)
  );
$$;

-- Create a function to check user roles from user_roles table
CREATE OR REPLACE FUNCTION public.has_user_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role::text = _role
  );
$$;

-- Create authenticated user check function
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- Create function to check if user owns the resource
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = _user_id;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_secure(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_user_role(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_authenticated() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_owner(uuid) TO authenticated, anon;
