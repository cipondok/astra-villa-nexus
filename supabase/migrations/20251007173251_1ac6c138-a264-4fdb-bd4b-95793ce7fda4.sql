-- First, check current enum values and add super_admin if missing
DO $$ 
DECLARE
  enum_exists boolean;
BEGIN
  -- Check if super_admin already exists in the enum
  SELECT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'user_role'::regtype 
    AND enumlabel = 'super_admin'
  ) INTO enum_exists;
  
  -- If it doesn't exist, add it
  IF NOT enum_exists THEN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
    RAISE NOTICE 'Added super_admin to user_role enum';
  ELSE
    RAISE NOTICE 'super_admin already exists in user_role enum';
  END IF;
END $$;

-- Now create the view with super_admin support
CREATE OR REPLACE VIEW public.profiles_with_roles AS
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

COMMENT ON VIEW public.profiles_with_roles IS 'Backward-compatible view for components expecting role column. Role is fetched from user_roles table (read-only, prevents privilege escalation).';

-- Grant SELECT permission on the view
GRANT SELECT ON public.profiles_with_roles TO authenticated;
GRANT SELECT ON public.profiles_with_roles TO anon;