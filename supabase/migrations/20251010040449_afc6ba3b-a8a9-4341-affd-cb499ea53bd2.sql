-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_survey_bookings_secure(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.get_survey_booking_stats_secure(UUID);
DROP FUNCTION IF EXISTS public.get_my_property_booking_count();

-- Create the survey bookings secure function
CREATE OR REPLACE FUNCTION public.get_survey_bookings_secure(
  p_property_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  property_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  preferred_date DATE,
  preferred_time TIME,
  message TEXT,
  status TEXT,
  survey_type TEXT,
  property_title TEXT,
  property_location TEXT,
  agent_name TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  has_full_access BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  is_admin BOOLEAN;
  is_agent BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user is admin using the has_role function
  is_admin := has_role(current_user_id, 'admin'::user_role);
  
  -- Check if user is agent
  is_agent := has_role(current_user_id, 'agent'::user_role);
  
  -- Return survey bookings with privacy controls
  RETURN QUERY
  SELECT 
    psb.id,
    psb.property_id,
    -- Mask customer info for non-admins viewing other properties
    CASE 
      WHEN is_admin OR p.owner_id = current_user_id OR p.agent_id = current_user_id 
      THEN psb.customer_name
      ELSE LEFT(psb.customer_name, 1) || '***'
    END as customer_name,
    CASE 
      WHEN is_admin OR p.owner_id = current_user_id OR p.agent_id = current_user_id 
      THEN psb.customer_email
      ELSE '***@***'
    END as customer_email,
    CASE 
      WHEN is_admin OR p.owner_id = current_user_id OR p.agent_id = current_user_id 
      THEN psb.customer_phone
      ELSE '***-****'
    END as customer_phone,
    psb.preferred_date,
    psb.preferred_time,
    psb.message,
    psb.status,
    psb.survey_type,
    p.title as property_title,
    COALESCE(p.city || ', ' || p.area, p.location) as property_location,
    COALESCE(prof.full_name, 'N/A') as agent_name,
    psb.admin_notes,
    psb.created_at,
    psb.updated_at,
    (is_admin OR p.owner_id = current_user_id OR p.agent_id = current_user_id) as has_full_access
  FROM public.property_survey_bookings psb
  LEFT JOIN public.properties p ON p.id = psb.property_id
  LEFT JOIN public.profiles prof ON prof.id = p.agent_id
  WHERE 
    -- Admins see all bookings
    (is_admin OR 
     -- Agents see bookings for their properties
     (is_agent AND p.agent_id = current_user_id) OR
     -- Property owners see their property bookings
     p.owner_id = current_user_id)
    AND (p_property_id IS NULL OR psb.property_id = p_property_id)
  ORDER BY psb.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create the survey booking stats function
CREATE OR REPLACE FUNCTION public.get_survey_booking_stats_secure(
  p_property_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  is_admin BOOLEAN;
  stats JSON;
BEGIN
  current_user_id := auth.uid();
  is_admin := has_role(current_user_id, 'admin'::user_role);
  
  -- Return aggregated stats
  SELECT json_build_object(
    'total_bookings', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE psb.status = 'pending'),
    'confirmed', COUNT(*) FILTER (WHERE psb.status = 'confirmed'),
    'completed', COUNT(*) FILTER (WHERE psb.status = 'completed'),
    'cancelled', COUNT(*) FILTER (WHERE psb.status = 'cancelled'),
    'today', COUNT(*) FILTER (WHERE DATE(psb.preferred_date) = CURRENT_DATE)
  ) INTO stats
  FROM public.property_survey_bookings psb
  LEFT JOIN public.properties p ON p.id = psb.property_id
  WHERE 
    (is_admin OR p.owner_id = current_user_id OR p.agent_id = current_user_id)
    AND (p_property_id IS NULL OR psb.property_id = p_property_id);
  
  RETURN stats;
END;
$$;

-- Create helper function for booking count
CREATE OR REPLACE FUNCTION public.get_my_property_booking_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  booking_count INTEGER;
BEGIN
  current_user_id := auth.uid();
  
  SELECT COUNT(*) INTO booking_count
  FROM public.property_survey_bookings psb
  LEFT JOIN public.properties p ON p.id = psb.property_id
  WHERE p.owner_id = current_user_id OR p.agent_id = current_user_id;
  
  RETURN booking_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_survey_bookings_secure TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_survey_booking_stats_secure TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_property_booking_count TO authenticated;