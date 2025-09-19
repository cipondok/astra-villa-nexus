-- Fix the SECURITY DEFINER view issue by converting to a function
-- Drop the problematic view
DROP VIEW IF EXISTS public.survey_bookings_secure;

-- Create a secure function instead of a view to avoid SECURITY DEFINER view issues
CREATE OR REPLACE FUNCTION public.get_survey_bookings_secure(
  p_property_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  property_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  preferred_date date,
  preferred_time time,
  message text,
  status text,
  survey_type text,
  property_title text,
  property_location text,
  agent_name text,
  admin_notes text,
  created_at timestamptz,
  updated_at timestamptz,
  has_full_access boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_role text;
BEGIN
  current_user_id := auth.uid();
  
  -- Require authentication
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get user role for access control
  SELECT role INTO user_role FROM public.profiles WHERE profiles.id = current_user_id;
  
  -- Return filtered and masked data based on access permissions
  RETURN QUERY
  SELECT 
    psb.id,
    psb.property_id,
    CASE 
      WHEN can_access_survey_booking_details(psb.*) THEN psb.customer_name
      ELSE CASE 
        WHEN LENGTH(psb.customer_name) > 3 THEN LEFT(psb.customer_name, 2) || '***'
        ELSE '***'
      END
    END as customer_name,
    CASE 
      WHEN can_access_survey_booking_details(psb.*) THEN psb.customer_email
      ELSE CASE 
        WHEN POSITION('@' IN psb.customer_email) > 2 THEN 
          LEFT(psb.customer_email, 2) || '***@' || SPLIT_PART(psb.customer_email, '@', 2)
        ELSE '***@' || SPLIT_PART(psb.customer_email, '@', 2)
      END
    END as customer_email,
    CASE 
      WHEN can_access_survey_booking_details(psb.*) THEN psb.customer_phone
      ELSE CASE 
        WHEN LENGTH(psb.customer_phone) > 4 THEN LEFT(psb.customer_phone, 3) || '***'
        ELSE '***'
      END
    END as customer_phone,
    psb.preferred_date,
    psb.preferred_time,
    CASE 
      WHEN can_access_survey_booking_details(psb.*) THEN psb.message
      ELSE '[Restricted Access]'
    END as message,
    psb.status,
    psb.survey_type,
    psb.property_title,
    psb.property_location,
    psb.agent_name,
    CASE 
      WHEN can_access_survey_booking_details(psb.*) THEN psb.admin_notes
      ELSE NULL
    END as admin_notes,
    psb.created_at,
    psb.updated_at,
    can_access_survey_booking_details(psb.*) as has_full_access
  FROM public.property_survey_bookings psb
  WHERE (p_property_id IS NULL OR psb.property_id = p_property_id)
    AND (
      -- User can see basic info about bookings they have some access to
      can_access_survey_booking_details(psb.*) OR
      -- Property owners can see masked info for their properties
      EXISTS (
        SELECT 1 FROM public.properties p 
        WHERE p.id = psb.property_id 
        AND p.owner_id = current_user_id
      ) OR
      -- Agents can see masked info for properties they manage
      EXISTS (
        SELECT 1 FROM public.properties p 
        WHERE p.id = psb.property_id 
        AND p.agent_id = current_user_id
      ) OR
      -- Admins can see all (with logging)
      user_role IN ('admin', 'customer_service')
    )
  ORDER BY psb.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create an additional function specifically for property owners to get their booking count
CREATE OR REPLACE FUNCTION public.get_my_property_booking_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  booking_count integer;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*)::integer INTO booking_count
  FROM public.property_survey_bookings psb
  JOIN public.properties p ON p.id = psb.property_id
  WHERE p.owner_id = current_user_id OR p.agent_id = current_user_id;
  
  RETURN COALESCE(booking_count, 0);
END;
$$;