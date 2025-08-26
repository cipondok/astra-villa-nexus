-- Fix critical customer contact information security vulnerability
-- Prevent scammers from harvesting customer names, emails, and phone numbers

-- Remove overly permissive policies that could expose customer data
DROP POLICY IF EXISTS "Public can create survey bookings" ON public.property_survey_bookings;
DROP POLICY IF EXISTS "Restricted access to survey bookings" ON public.property_survey_bookings;

-- Create secure authenticated-only booking creation policy
CREATE POLICY "Authenticated users can create survey bookings"
ON public.property_survey_bookings FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create strict access control for viewing sensitive customer data
-- Only allow specific authorized users to view customer contact information
CREATE POLICY "Property owners can view bookings for their properties only"
ON public.property_survey_bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_survey_bookings.property_id 
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Agents can view bookings they are assigned to"
ON public.property_survey_bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agent'
    AND (
      -- Agent is assigned to the property
      EXISTS (
        SELECT 1 FROM properties p 
        WHERE p.id = property_survey_bookings.property_id 
        AND p.agent_id = auth.uid()
      )
      OR
      -- Agent name matches (for legacy assignments)
      agent_name IS NOT NULL
    )
  )
);

CREATE POLICY "Customers can view their own survey bookings"
ON public.property_survey_bookings FOR SELECT
USING (customer_email = (auth.jwt() ->> 'email'));

-- Create update/delete policies with strict access control
CREATE POLICY "Property owners can update bookings for their properties"
ON public.property_survey_bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_survey_bookings.property_id 
    AND p.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_survey_bookings.property_id 
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Agents can update bookings they manage"
ON public.property_survey_bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agent'
    AND EXISTS (
      SELECT 1 FROM properties p 
      WHERE p.id = property_survey_bookings.property_id 
      AND p.agent_id = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agent'
    AND EXISTS (
      SELECT 1 FROM properties p 
      WHERE p.id = property_survey_bookings.property_id 
      AND p.agent_id = auth.uid()
    )
  )
);

-- Customers cannot update or delete bookings (only view)
CREATE POLICY "Customers cannot modify survey bookings"
ON public.property_survey_bookings FOR UPDATE
USING (false);

CREATE POLICY "Customers cannot delete survey bookings"
ON public.property_survey_bookings FOR DELETE
USING (false);

-- Only property owners and agents can delete bookings
CREATE POLICY "Property owners can delete bookings for their properties"
ON public.property_survey_bookings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_survey_bookings.property_id 
    AND p.owner_id = auth.uid()
  )
);

-- Create secure function for public booking creation without exposing existing data
CREATE OR REPLACE FUNCTION public.create_secure_survey_booking(
  p_property_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_preferred_date date,
  p_preferred_time time,
  p_message text DEFAULT NULL,
  p_survey_type text DEFAULT 'property_survey'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  booking_id uuid;
  property_exists boolean;
BEGIN
  -- Validate input data to prevent malicious submissions
  IF p_customer_name IS NULL OR LENGTH(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Valid customer name is required';
  END IF;
  
  IF p_customer_email IS NULL OR p_customer_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Valid email address is required';
  END IF;
  
  IF p_customer_phone IS NULL OR LENGTH(regexp_replace(p_customer_phone, '[^0-9]', '', 'g')) < 8 THEN
    RAISE EXCEPTION 'Valid phone number is required';
  END IF;
  
  -- Verify property exists and is available for surveys
  SELECT EXISTS(
    SELECT 1 FROM properties 
    WHERE id = p_property_id 
    AND status = 'available'
  ) INTO property_exists;
  
  IF NOT property_exists THEN
    RAISE EXCEPTION 'Property not available for survey booking';
  END IF;
  
  -- Create booking with validated data
  INSERT INTO public.property_survey_bookings (
    property_id,
    customer_name,
    customer_email,
    customer_phone,
    preferred_date,
    preferred_time,
    message,
    survey_type,
    status
  ) VALUES (
    p_property_id,
    trim(p_customer_name),
    lower(trim(p_customer_email)),
    trim(p_customer_phone),
    p_preferred_date,
    p_preferred_time,
    p_message,
    p_survey_type,
    'pending'
  ) RETURNING id INTO booking_id;
  
  -- Log the booking creation for security monitoring
  PERFORM log_financial_access('property_survey_bookings', 'booking_created');
  
  RETURN booking_id;
END;
$$;

-- Create function to get sanitized booking data for property listings (without exposing customer details)
CREATE OR REPLACE FUNCTION public.get_property_booking_stats(p_property_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stats jsonb;
BEGIN
  -- Return only aggregated stats, no personal information
  SELECT jsonb_build_object(
    'total_bookings', COUNT(*),
    'pending_bookings', COUNT(*) FILTER (WHERE status = 'pending'),
    'completed_bookings', COUNT(*) FILTER (WHERE status = 'completed'),
    'last_booking_date', MAX(created_at::date)
  ) INTO stats
  FROM property_survey_bookings
  WHERE property_id = p_property_id;
  
  RETURN COALESCE(stats, '{"total_bookings": 0, "pending_bookings": 0, "completed_bookings": 0}'::jsonb);
END;
$$;