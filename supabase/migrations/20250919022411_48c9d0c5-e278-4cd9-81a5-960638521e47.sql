-- First, let's create a secure function to check if user can access booking details
CREATE OR REPLACE FUNCTION public.can_access_survey_booking_details(booking_row property_survey_bookings)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_role text;
  property_owner_id uuid;
  property_agent_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Anonymous users have no access
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role
  SELECT role INTO user_role FROM public.profiles WHERE id = current_user_id;
  
  -- Super admin always has access (for system maintenance)
  IF check_super_admin_email() THEN
    RETURN true;
  END IF;
  
  -- Get property ownership details
  SELECT owner_id, agent_id INTO property_owner_id, property_agent_id
  FROM public.properties 
  WHERE id = booking_row.property_id;
  
  -- Check if user is the customer who made the booking
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = current_user_id 
    AND email = booking_row.customer_email
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is the property owner
  IF current_user_id = property_owner_id THEN
    RETURN true;
  END IF;
  
  -- Check if user is the assigned agent for this property
  IF current_user_id = property_agent_id THEN
    RETURN true;
  END IF;
  
  -- Admin and customer service can only access for support purposes
  -- but we'll log this access for audit
  IF user_role IN ('admin', 'customer_service') THEN
    -- Log the sensitive data access
    PERFORM log_security_event(
      current_user_id,
      'survey_booking_admin_access',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'booking_id', booking_row.id,
        'property_id', booking_row.property_id,
        'access_reason', 'admin_support'
      ),
      35 -- Medium-high risk score for admin access to customer data
    );
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create a secure view that masks sensitive customer information
CREATE OR REPLACE VIEW public.survey_bookings_secure AS
SELECT 
  id,
  property_id,
  CASE 
    WHEN can_access_survey_booking_details(property_survey_bookings.*) THEN customer_name
    ELSE CASE 
      WHEN LENGTH(customer_name) > 3 THEN LEFT(customer_name, 2) || '***'
      ELSE '***'
    END
  END as customer_name,
  CASE 
    WHEN can_access_survey_booking_details(property_survey_bookings.*) THEN customer_email
    ELSE CASE 
      WHEN POSITION('@' IN customer_email) > 2 THEN 
        LEFT(customer_email, 2) || '***@' || SPLIT_PART(customer_email, '@', 2)
      ELSE '***@' || SPLIT_PART(customer_email, '@', 2)
    END
  END as customer_email,
  CASE 
    WHEN can_access_survey_booking_details(property_survey_bookings.*) THEN customer_phone
    ELSE CASE 
      WHEN LENGTH(customer_phone) > 4 THEN LEFT(customer_phone, 3) || '***'
      ELSE '***'
    END
  END as customer_phone,
  preferred_date,
  preferred_time,
  CASE 
    WHEN can_access_survey_booking_details(property_survey_bookings.*) THEN message
    ELSE '[Restricted Access]'
  END as message,
  status,
  survey_type,
  property_title,
  property_location,
  agent_name,
  CASE 
    WHEN can_access_survey_booking_details(property_survey_bookings.*) THEN admin_notes
    ELSE NULL
  END as admin_notes,
  created_at,
  updated_at,
  can_access_survey_booking_details(property_survey_bookings.*) as has_full_access
FROM public.property_survey_bookings;

-- Now let's update the RLS policies to be more restrictive
-- Drop existing permissive policies
DROP POLICY IF EXISTS "secure_admin_survey_bookings_select" ON public.property_survey_bookings;
DROP POLICY IF EXISTS "secure_admin_survey_bookings_update" ON public.property_survey_bookings;
DROP POLICY IF EXISTS "secure_customer_own_survey_bookings_select" ON public.property_survey_bookings;
DROP POLICY IF EXISTS "secure_property_owner_survey_bookings_select" ON public.property_survey_bookings;
DROP POLICY IF EXISTS "secure_super_admin_survey_bookings_delete" ON public.property_survey_bookings;
DROP POLICY IF EXISTS "secure_survey_booking_insert" ON public.property_survey_bookings;

-- Create new restrictive policies
-- 1. Only allow SELECT access through the secure function
CREATE POLICY "restrictive_survey_bookings_select" 
ON public.property_survey_bookings 
FOR SELECT 
USING (can_access_survey_booking_details(property_survey_bookings.*));

-- 2. Only allow admins and customer service to update (with logging)
CREATE POLICY "restrictive_survey_bookings_update" 
ON public.property_survey_bookings 
FOR UPDATE 
USING (
  (check_super_admin_email() OR 
   EXISTS (
     SELECT 1 FROM public.profiles 
     WHERE id = auth.uid() 
     AND role IN ('admin', 'customer_service')
   )) AND
  -- Log the update attempt
  (log_security_event(
    auth.uid(),
    'survey_booking_update',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'booking_id', id,
      'property_id', property_id
    ),
    40
  ) IS NOT NULL)
)
WITH CHECK (
  check_super_admin_email() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'customer_service')
  )
);

-- 3. Only super admin can delete (extreme sensitive operation)
CREATE POLICY "restrictive_survey_bookings_delete" 
ON public.property_survey_bookings 
FOR DELETE 
USING (
  check_super_admin_email() AND
  -- Log the deletion attempt
  (log_security_event(
    auth.uid(),
    'survey_booking_delete',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'booking_id', id,
      'property_id', property_id,
      'customer_email', customer_email
    ),
    80 -- High risk score for deletion
  ) IS NOT NULL)
);

-- 4. Allow authenticated users to insert (public booking form)
CREATE POLICY "restrictive_survey_bookings_insert" 
ON public.property_survey_bookings 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  -- Log the booking creation
  (log_security_event(
    auth.uid(),
    'survey_booking_create',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'property_id', property_id,
      'survey_type', survey_type
    ),
    10 -- Low risk for booking creation
  ) IS NOT NULL)
);

-- Create a secure function for getting booking statistics without exposing personal data
CREATE OR REPLACE FUNCTION public.get_survey_booking_stats_secure(p_property_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats jsonb;
  current_user_id uuid;
  user_role text;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user has legitimate access to statistics
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  SELECT role INTO user_role FROM public.profiles WHERE id = current_user_id;
  
  -- Only allow property owners, agents, and admins to see stats
  IF NOT (
    check_super_admin_email() OR 
    user_role IN ('admin', 'customer_service') OR
    (p_property_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = p_property_id 
      AND (owner_id = current_user_id OR agent_id = current_user_id)
    ))
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to view booking statistics';
  END IF;
  
  -- Return aggregated stats without personal information
  SELECT jsonb_build_object(
    'total_bookings', COUNT(*),
    'pending_bookings', COUNT(*) FILTER (WHERE status = 'pending'),
    'completed_bookings', COUNT(*) FILTER (WHERE status = 'completed'),
    'cancelled_bookings', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'last_booking_date', MAX(created_at::date),
    'avg_bookings_per_month', ROUND(
      COUNT(*)::numeric / GREATEST(
        EXTRACT(months FROM (NOW() - MIN(created_at)))::numeric, 
        1
      ), 2
    )
  ) INTO stats
  FROM public.property_survey_bookings
  WHERE (p_property_id IS NULL OR property_id = p_property_id);
  
  -- Log the stats access
  PERFORM log_security_event(
    current_user_id,
    'survey_booking_stats_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'property_id', p_property_id,
      'user_role', user_role
    ),
    15
  );
  
  RETURN COALESCE(stats, '{"total_bookings": 0}'::jsonb);
END;
$$;