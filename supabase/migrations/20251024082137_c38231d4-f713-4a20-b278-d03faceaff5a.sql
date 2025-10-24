-- Fix database functions to use user_roles table instead of profiles.role
-- Security Fix: CLIENT_SIDE_AUTH - Replace hardcoded checks with proper role table
-- Note: role column in user_roles is TEXT type, not enum

-- Fix is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  );
$$;

-- Fix is_current_user_admin function  
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  );
$$;

-- Fix check_admin_access function
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_active = true
  );
$$;

-- Fix is_authorized_support_user function
CREATE OR REPLACE FUNCTION public.is_authorized_support_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'customer_service')
      AND is_active = true
  );
$$;