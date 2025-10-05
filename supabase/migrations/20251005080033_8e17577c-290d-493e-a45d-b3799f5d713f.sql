-- Phase 1: Fix Critical Privilege Escalation
-- Clean slate approach: drop all policies first, then create new secure ones

-- Step 1: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 2: Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT id, role, created_at 
FROM public.profiles 
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Create security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Step 4: Drop ALL existing policies on user_roles (if they exist)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "users_can_view_own_roles" ON public.user_roles;
  DROP POLICY IF EXISTS "admins_can_view_all_roles" ON public.user_roles;
  DROP POLICY IF EXISTS "only_admins_can_manage_roles" ON public.user_roles;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Step 5: Create RLS policies on user_roles table
CREATE POLICY "users_can_view_own_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admins_can_view_all_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "only_admins_can_manage_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 6: Drop ALL existing RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile_no_role" ON public.profiles;
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "admin_full_profile_access" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "service_role_bypass" ON public.profiles;

-- Step 7: Create new consolidated RLS policies on profiles
CREATE POLICY "users_select_own_profile_v2"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users_update_own_profile_v2"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "admins_full_profile_access"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 8: Create or update trigger for new user role sync
DROP TRIGGER IF EXISTS on_auth_user_role_sync ON auth.users;

CREATE OR REPLACE FUNCTION public.sync_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'general_user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_role_sync
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_new_user_role();

-- Step 9: Update all admin check functions to use has_role
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Step 10: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(user_id, role) WHERE is_active = true;

-- Step 11: Create audit table for role changes
CREATE TABLE IF NOT EXISTS public.user_role_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role user_role NOT NULL,
  action TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.user_role_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing audit policies if any
DROP POLICY IF EXISTS "only_admins_view_role_audit" ON public.user_role_audit;

-- Create audit policy
CREATE POLICY "only_admins_view_role_audit"
ON public.user_role_audit
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 12: Create audit trigger
DROP TRIGGER IF EXISTS audit_user_role_changes ON public.user_roles;

CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_role_audit (user_id, role, action, changed_by, metadata)
    VALUES (NEW.user_id, NEW.role, 'ASSIGNED', auth.uid(), jsonb_build_object('assigned_at', NEW.assigned_at));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.user_role_audit (user_id, role, action, changed_by, metadata)
    VALUES (NEW.user_id, NEW.role, 'MODIFIED', auth.uid(), jsonb_build_object('old_active', OLD.is_active, 'new_active', NEW.is_active));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_role_audit (user_id, role, action, changed_by, metadata)
    VALUES (OLD.user_id, OLD.role, 'REMOVED', auth.uid(), jsonb_build_object('removed_at', now()));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_user_role_changes
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();