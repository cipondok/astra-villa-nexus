-- Secure the property_survey_bookings table by fixing RLS policies

-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can create survey bookings" ON public.property_survey_bookings;

-- Create a secure policy for creating survey bookings that prevents data manipulation
CREATE POLICY "Public can create survey bookings"
ON public.property_survey_bookings
FOR INSERT
TO public
WITH CHECK (
  -- Only allow insertion of basic booking data, prevent manipulation of sensitive fields
  customer_name IS NOT NULL 
  AND customer_email IS NOT NULL 
  AND customer_phone IS NOT NULL
  AND preferred_date IS NOT NULL
  AND survey_type IS NOT NULL
  AND property_title IS NOT NULL
  -- Ensure status is set to pending for new bookings
  AND status = 'pending'
);

-- Add policy to prevent unauthorized SELECT access
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.property_survey_bookings;

CREATE POLICY "Restricted access to survey bookings"
ON public.property_survey_bookings
FOR SELECT
TO authenticated
USING (
  -- Only allow access to own bookings via email match or admin/agent access
  (customer_email = (auth.jwt() ->> 'email'::text)) 
  OR (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'agent')
  ))
);

-- Block all anonymous access to prevent data harvesting
CREATE POLICY "Block anonymous access to survey bookings"
ON public.property_survey_bookings
TO anon
USING (false);

-- Add policy for property owners to view bookings for their properties
CREATE POLICY "Property owners can view bookings for their properties"
ON public.property_survey_bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_survey_bookings.property_id
    AND p.owner_id = auth.uid()
  )
);

-- Create secure function for public survey booking submission
CREATE OR REPLACE FUNCTION public.create_survey_booking(
  p_property_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_preferred_date date,
  p_preferred_time time,
  p_message text DEFAULT NULL,
  p_survey_type text DEFAULT 'property_survey',
  p_property_title text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_id uuid;
BEGIN
  -- Validate input data
  IF p_customer_name IS NULL OR LENGTH(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;
  
  IF p_customer_email IS NULL OR LENGTH(trim(p_customer_email)) = 0 THEN
    RAISE EXCEPTION 'Customer email is required';
  END IF;
  
  IF p_customer_phone IS NULL OR LENGTH(trim(p_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'Customer phone is required';
  END IF;
  
  -- Insert the booking with controlled data
  INSERT INTO public.property_survey_bookings (
    property_id,
    customer_name,
    customer_email,
    customer_phone,
    preferred_date,
    preferred_time,
    message,
    survey_type,
    property_title,
    status
  ) VALUES (
    p_property_id,
    trim(p_customer_name),
    trim(lower(p_customer_email)),
    trim(p_customer_phone),
    p_preferred_date,
    p_preferred_time,
    p_message,
    p_survey_type,
    p_property_title,
    'pending'
  ) RETURNING id INTO booking_id;
  
  RETURN booking_id;
END;
$$;