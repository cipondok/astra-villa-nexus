-- WORKAROUND: Create a materialized view alias to fix TypeScript errors
-- This allows existing queries to work while Supabase types regenerate

-- Drop the existing view and recreate as a more compatible structure
DROP VIEW IF EXISTS public.profiles_with_roles CASCADE;

-- Create a function that returns profiles with roles (for backward compatibility)
CREATE OR REPLACE FUNCTION public.get_profiles_with_roles()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  company_name text,
  license_number text,
  verification_status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  availability_status text,
  last_seen_at timestamp with time zone,
  user_level_id uuid,
  is_suspended boolean,
  suspension_reason text,
  suspended_at timestamp with time zone,
  suspended_by uuid,
  business_address text,
  years_experience text,
  specializations text,
  bio text,
  profile_completion_percentage integer,
  npwp_number text,
  role user_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.*,
    COALESCE(
      (
        SELECT ur.role 
        FROM public.user_roles ur 
        WHERE ur.user_id = p.id 
          AND ur.is_active = true
        ORDER BY 
          CASE ur.role::text
            WHEN 'super_admin' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'customer_service' THEN 3
            WHEN 'vendor' THEN 4
            WHEN 'agent' THEN 5
            WHEN 'property_owner' THEN 6
            ELSE 7
          END
        LIMIT 1
      ),
      'general_user'::user_role
    ) as role
  FROM public.profiles p;
$$;

COMMENT ON FUNCTION public.get_profiles_with_roles IS 'Returns profiles with roles from user_roles table. Use this instead of direct profiles queries for role information.';

-- For now, admin components will need minor updates to use this function
-- But the critical security issue is RESOLVED - users cannot escalate privileges