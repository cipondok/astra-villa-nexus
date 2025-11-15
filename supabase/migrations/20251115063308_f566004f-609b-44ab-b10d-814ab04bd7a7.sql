
-- =====================================================
-- SECURITY FIX: Remove Hardcoded Super Admin Email
-- =====================================================
-- This migration removes the hardcoded 'mycode103@gmail.com' email
-- from all security functions and replaces it with a role-based system
-- using the existing user_roles table with 'super_admin' role.
--
-- Benefits:
-- 1. Supports multiple super admins
-- 2. Enables proper credential rotation
-- 3. No database migrations needed to change admins
-- 4. Consistent with existing role-based architecture
-- 5. Eliminates single point of failure
-- =====================================================

-- Step 1: Ensure super_admin role exists for the initial admin user
-- (Role enum already includes 'super_admin')
INSERT INTO public.user_roles (user_id, role, assigned_by, is_active)
SELECT 
  id, 
  'super_admin'::user_role,
  id, -- Self-assigned initially
  true
FROM public.profiles 
WHERE email = 'mycode103@gmail.com'
ON CONFLICT (user_id, role) DO UPDATE 
SET is_active = true, assigned_at = now();

-- Step 2: Create helper function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    )),
    false
  );
$$;

-- Step 3: Create helper function to check if a specific user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = check_user_id
        AND role = 'super_admin'
        AND is_active = true
    )),
    false
  );
$$;

-- Step 4: Update all security functions to use role-based checks
-- Replace is_super_admin_safe() function
CREATE OR REPLACE FUNCTION public.is_super_admin_safe(user_email text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN user_email IS NOT NULL THEN 
      -- Check by email lookup
      EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.user_roles ur ON p.id = ur.user_id
        WHERE p.email = user_email 
          AND ur.role = 'super_admin' 
          AND ur.is_active = true
      )
    ELSE 
      -- Check current user
      public.is_super_admin()
  END;
$$;

-- Replace is_super_admin_by_email() function
CREATE OR REPLACE FUNCTION public.is_super_admin_by_email()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.is_super_admin();
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Replace check_super_admin_access() function
CREATE OR REPLACE FUNCTION public.check_super_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin();
$$;

-- Replace check_super_admin_email() function
CREATE OR REPLACE FUNCTION public.check_super_admin_email()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin();
$$;

-- Replace is_super_admin_direct() function
CREATE OR REPLACE FUNCTION public.is_super_admin_direct()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.is_super_admin();
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Replace check_is_admin() function - this checks for BOTH admin and super_admin
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )),
    false
  );
$$;

-- Update check_admin_access() to include super_admin
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_active = true
  );
$$;

-- Step 5: Update can_access_vendor_business_profile to use role-based check
CREATE OR REPLACE FUNCTION public.can_access_vendor_business_profile(profile_vendor_id uuid, operation text DEFAULT 'SELECT'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deny anonymous access completely
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Super admin and admin users have full access
  IF public.is_super_admin() OR public.check_admin_access() THEN
    RETURN true;
  END IF;
  
  -- Vendors can only access their own profiles
  IF profile_vendor_id = auth.uid() THEN
    RETURN true;
  END IF;
  
  -- For SELECT operations, allow authenticated users to view basic public info
  IF operation = 'SELECT_PUBLIC' THEN
    RETURN true;
  END IF;
  
  -- Deny all other access
  RETURN false;
END;
$$;

-- Step 6: Update can_access_vendor_categories_strict to use role-based check
CREATE OR REPLACE FUNCTION public.can_access_vendor_categories_strict()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deny anonymous access completely
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Super admin and admin users have full access
  IF public.is_super_admin() OR public.check_admin_access() THEN
    RETURN true;
  END IF;
  
  -- Customer service can access
  IF public.has_role(auth.uid(), 'customer_service') THEN
    RETURN true;
  END IF;
  
  -- Deny all other access
  RETURN false;
END;
$$;

-- Step 7: Update reset_admin_password function to use role-based check
CREATE OR REPLACE FUNCTION public.reset_admin_password(new_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id uuid;
  result_message text;
BEGIN
  -- Only allow if called by super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only super admin can reset admin password';
  END IF;
  
  -- Get admin user ID from user_roles (first admin found)
  SELECT ur.user_id INTO admin_user_id 
  FROM public.user_roles ur
  WHERE ur.role = 'admin' 
    AND ur.is_active = true
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin profile not found';
  END IF;
  
  -- Log the password reset attempt
  PERFORM log_security_event(
    admin_user_id,
    'admin_password_reset',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('timestamp', now()),
    50
  );
  
  result_message := 'Password reset logged for admin user: ' || admin_user_id::text;
  
  RETURN result_message;
END;
$$;

-- Step 8: Update can_create_development_status to use role-based check
CREATE OR REPLACE FUNCTION public.can_create_development_status(user_id uuid, dev_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if user is super admin or admin
  IF public.is_super_admin_user(user_id) OR public.has_role(user_id, 'admin') THEN
    RETURN true;
  END IF;
  
  -- Allow if user is agent or property_owner
  IF public.has_role(user_id, 'agent') OR public.has_role(user_id, 'property_owner') THEN
    RETURN true;
  END IF;
  
  -- For restricted development statuses, only allow authorized users above
  IF dev_status IN ('new_project', 'pre_launching') THEN
    RETURN false;
  END IF;
  
  -- Allow other statuses for everyone else
  RETURN true;
END;
$$;

-- Step 9: Drop and recreate RLS policies that reference the hardcoded email

-- System settings policy (from migration 20250820122350)
DROP POLICY IF EXISTS "super_admin_full_system_settings_access" ON public.system_settings;

CREATE POLICY "super_admin_full_system_settings_access"
ON public.system_settings
FOR ALL
TO authenticated
USING (
  public.is_super_admin()
)
WITH CHECK (
  public.is_super_admin()
);

-- Step 10: Update profiles access to include super_admin check
-- (The existing profiles policies should already work with has_role checks)

-- Add comment documenting the change
COMMENT ON FUNCTION public.is_super_admin() IS 
'Checks if the current authenticated user has the super_admin role in user_roles table. Replaces hardcoded email checks for mycode103@gmail.com.';

COMMENT ON FUNCTION public.is_super_admin_user(uuid) IS 
'Checks if a specific user ID has the super_admin role in user_roles table. Used for cross-user admin validation.';

-- Log the security migration
DO $$
BEGIN
  -- Create a security event for the migration
  INSERT INTO public.user_security_logs (
    user_id,
    event_type,
    metadata,
    risk_score,
    is_flagged
  ) VALUES (
    (SELECT id FROM public.profiles WHERE email = 'mycode103@gmail.com' LIMIT 1),
    'security_migration_super_admin_role',
    jsonb_build_object(
      'migration_type', 'hardcoded_email_removal',
      'previous_method', 'hardcoded_email_check',
      'new_method', 'role_based_check',
      'timestamp', now(),
      'description', 'Migrated from hardcoded super admin email to role-based system using user_roles table'
    ),
    10, -- Low risk - this is a security improvement
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If logging fails, continue anyway (table might not exist)
    NULL;
END $$;
