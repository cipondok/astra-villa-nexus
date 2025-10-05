-- FINAL FIX: Clean up profiles table RLS policies completely
-- Remove ALL existing policies and create a minimal, strict set

-- Drop all existing policies
DROP POLICY IF EXISTS "admins_full_profile_access" ON public.profiles;
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_manage_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_select_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles_logged" ON public.profiles;
DROP POLICY IF EXISTS "new_users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "self_or_admin_insert_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_select_own_profile_v2" ON public.profiles;
DROP POLICY IF EXISTS "users_update_only_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile_v2" ON public.profiles;
DROP POLICY IF EXISTS "users_view_only_own_profile" ON public.profiles;

-- Create minimal, strict policies
-- 1. Users can ONLY view their own profile
CREATE POLICY "strict_users_view_own_profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

-- 2. Users can ONLY update their own profile
CREATE POLICY "strict_users_update_own_profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 3. New users can insert their own profile (during signup)
CREATE POLICY "strict_users_insert_own_profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- 4. Admins have full access with logging
CREATE POLICY "strict_admins_full_access"
ON public.profiles FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role) 
  AND (
    -- Log admin access to other users' profiles
    id = auth.uid() 
    OR log_security_event(
      auth.uid(), 
      'admin_cross_profile_access'::text, 
      inet_client_addr(), 
      NULL::text, 
      NULL::text, 
      jsonb_build_object('accessed_profile_id', id, 'action', 'read'),
      30
    ) IS NOT NULL
  )
)
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add helpful comment
COMMENT ON TABLE public.profiles IS 'User profiles with strict RLS: users can only access their own data, admins have logged access to all profiles';