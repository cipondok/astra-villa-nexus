-- Create a secure function to get total user count for admin dashboards
-- This bypasses RLS safely for counting purposes only

CREATE OR REPLACE FUNCTION public.get_total_user_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count bigint;
BEGIN
  -- Only allow admins to call this function
  IF NOT (
    has_role(auth.uid(), 'admin'::user_role) OR 
    has_role(auth.uid(), 'super_admin'::user_role)
  ) THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO user_count FROM profiles;
  RETURN user_count;
END;
$$;

-- Grant execute to authenticated users (RLS in function handles access control)
GRANT EXECUTE ON FUNCTION public.get_total_user_count() TO authenticated;

-- Create a secure function to get platform statistics for admins
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE (
  total_users bigint,
  total_properties bigint,
  total_bookings bigint,
  total_vendors bigint,
  active_sessions bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT (
    has_role(auth.uid(), 'admin'::user_role) OR 
    has_role(auth.uid(), 'super_admin'::user_role)
  ) THEN
    RETURN QUERY SELECT 0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint;
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles)::bigint as total_users,
    (SELECT COUNT(*) FROM properties)::bigint as total_properties,
    (SELECT COUNT(*) FROM vendor_bookings)::bigint as total_bookings,
    (SELECT COUNT(*) FROM profiles WHERE role IN ('vendor', 'agent'))::bigint as total_vendors,
    (SELECT COUNT(*) FROM user_device_sessions WHERE is_active = true)::bigint as active_sessions;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated;