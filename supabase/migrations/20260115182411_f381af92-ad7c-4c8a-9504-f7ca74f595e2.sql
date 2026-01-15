-- Fix get_platform_stats: profiles table has no role column; roles live in public.user_roles
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE(
  total_users bigint,
  total_properties bigint,
  total_bookings bigint,
  total_vendors bigint,
  active_sessions bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT (
    public.has_role(auth.uid(), 'admin'::public.user_role) OR
    public.has_role(auth.uid(), 'super_admin'::public.user_role)
  ) THEN
    RETURN QUERY SELECT 0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.profiles)::bigint AS total_users,
    (SELECT COUNT(*) FROM public.properties)::bigint AS total_properties,
    (SELECT COUNT(*) FROM public.vendor_bookings)::bigint AS total_bookings,
    (
      SELECT COUNT(DISTINCT ur.user_id)
      FROM public.user_roles ur
      WHERE ur.is_active = true
        AND ur.role IN ('vendor'::public.user_role, 'agent'::public.user_role)
    )::bigint AS total_vendors,
    (SELECT COUNT(*) FROM public.user_device_sessions WHERE is_active = true)::bigint AS active_sessions;
END;
$$;