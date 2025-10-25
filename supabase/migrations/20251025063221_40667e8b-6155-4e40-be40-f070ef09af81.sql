-- Fix RPCs that referenced removed profiles.role by deriving role from user_roles

-- Helper CTE priority ordering used in multiple functions
-- Replace get_admin_profiles to compute role from user_roles
CREATE OR REPLACE FUNCTION public.get_admin_profiles(
  p_role text DEFAULT NULL,
  p_limit integer DEFAULT 200,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  role user_role,
  verification_status text,
  created_at timestamptz,
  is_suspended boolean,
  suspension_reason text,
  last_seen_at timestamptz,
  company_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH primary_role AS (
    SELECT
      ur.user_id,
      ur.role,
      row_number() OVER (
        PARTITION BY ur.user_id 
        ORDER BY 
          CASE ur.role
            WHEN 'super_admin' THEN 7
            WHEN 'admin' THEN 6
            WHEN 'customer_service' THEN 5
            WHEN 'agent' THEN 4
            WHEN 'vendor' THEN 3
            WHEN 'property_owner' THEN 2
            WHEN 'general_user' THEN 1
            ELSE 0
          END DESC,
          ur.assigned_at DESC NULLS LAST
      ) rn
    FROM public.user_roles ur
    WHERE ur.is_active = true
  )
  SELECT 
    p.id,
    p.email,
    p.full_name,
    COALESCE(pr.role, 'general_user'::user_role) AS role,
    p.verification_status,
    p.created_at,
    p.is_suspended,
    p.suspension_reason,
    p.last_seen_at,
    p.company_name
  FROM public.profiles p
  LEFT JOIN primary_role pr ON pr.user_id = p.id AND pr.rn = 1
  WHERE (p_role IS NULL OR COALESCE(pr.role::text, 'general_user') = p_role)
  ORDER BY p.created_at DESC
  LIMIT COALESCE(p_limit, 200)
  OFFSET COALESCE(p_offset, 0);
$$;

-- Replace get_admin_profile_stats to compute counts from derived primary role
CREATE OR REPLACE FUNCTION public.get_admin_profile_stats()
RETURNS TABLE(
  total bigint,
  general_users bigint,
  vendors bigint,
  agents bigint,
  property_owners bigint,
  customer_service bigint,
  admins bigint,
  suspended bigint,
  pending bigint,
  active_today bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH primary_role AS (
    SELECT
      ur.user_id,
      ur.role,
      row_number() OVER (
        PARTITION BY ur.user_id 
        ORDER BY 
          CASE ur.role
            WHEN 'super_admin' THEN 7
            WHEN 'admin' THEN 6
            WHEN 'customer_service' THEN 5
            WHEN 'agent' THEN 4
            WHEN 'vendor' THEN 3
            WHEN 'property_owner' THEN 2
            WHEN 'general_user' THEN 1
            ELSE 0
          END DESC,
          ur.assigned_at DESC NULLS LAST
      ) rn
    FROM public.user_roles ur
    WHERE ur.is_active = true
  )
  SELECT 
    COUNT(*)::bigint AS total,
    COUNT(*) FILTER (WHERE COALESCE(pr.role::text, 'general_user') = 'general_user')::bigint AS general_users,
    COUNT(*) FILTER (WHERE COALESCE(pr.role::text, 'general_user') = 'vendor')::bigint AS vendors,
    COUNT(*) FILTER (WHERE COALESCE(pr.role::text, 'general_user') = 'agent')::bigint AS agents,
    COUNT(*) FILTER (WHERE COALESCE(pr.role::text, 'general_user') = 'property_owner')::bigint AS property_owners,
    COUNT(*) FILTER (WHERE COALESCE(pr.role::text, 'general_user') = 'customer_service')::bigint AS customer_service,
    COUNT(*) FILTER (WHERE COALESCE(pr.role::text, 'general_user') IN ('admin','super_admin'))::bigint AS admins,
    COUNT(*) FILTER (WHERE p.is_suspended = true)::bigint AS suspended,
    COUNT(*) FILTER (WHERE p.verification_status = 'pending')::bigint AS pending,
    COUNT(*) FILTER (WHERE p.last_seen_at >= now() - interval '24 hours')::bigint AS active_today
  FROM public.profiles p
  LEFT JOIN primary_role pr ON pr.user_id = p.id AND pr.rn = 1;
$$;

-- Create a safe admin-only user deletion function to avoid RLS issues
CREATE OR REPLACE FUNCTION public.delete_user_admin(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require super admin privileges
  IF NOT public.is_super_admin_safe() THEN
    RAISE EXCEPTION 'Access denied: super admin only';
  END IF;

  -- Clean up related admin and role records first
  DELETE FROM public.admin_users WHERE user_id = p_user_id;
  DELETE FROM public.user_roles WHERE user_id = p_user_id;
  -- Finally remove the profile (auth.users row will remain unless managed elsewhere)
  DELETE FROM public.profiles WHERE id = p_user_id;
END;
$$;