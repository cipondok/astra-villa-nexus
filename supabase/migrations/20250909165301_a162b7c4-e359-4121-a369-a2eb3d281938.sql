-- Fix customer contact information exposure security vulnerability
-- Strengthen RLS policies for customer data protection

-- First, let's ensure rental_bookings has proper security
DROP POLICY IF EXISTS "Users can create bookings" ON public.rental_bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.rental_bookings; 
DROP POLICY IF EXISTS "Property owners and customers can update bookings" ON public.rental_bookings;

-- Create secure RLS policies for rental_bookings
CREATE POLICY "Block anonymous access to rental bookings" 
ON public.rental_bookings 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "Authenticated users can create rental bookings" 
ON public.rental_bookings 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL AND customer_id = auth.uid());

CREATE POLICY "Users can view own rental bookings only" 
ON public.rental_bookings 
FOR SELECT 
TO authenticated 
USING (
  customer_id = auth.uid() OR 
  agent_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = rental_bookings.property_id 
    AND p.owner_id = auth.uid()
  ) OR
  check_admin_access()
);

CREATE POLICY "Only authorized users can update rental bookings" 
ON public.rental_bookings 
FOR UPDATE 
TO authenticated 
USING (
  customer_id = auth.uid() OR 
  agent_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = rental_bookings.property_id 
    AND p.owner_id = auth.uid()
  ) OR
  check_admin_access()
)
WITH CHECK (
  customer_id = auth.uid() OR 
  agent_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = rental_bookings.property_id 
    AND p.owner_id = auth.uid()
  ) OR
  check_admin_access()
);

-- Strengthen customer_support_tickets policies
DROP POLICY IF EXISTS "Allow secure ticket creation" ON public.customer_support_tickets;

CREATE POLICY "Authenticated users can create support tickets" 
ON public.customer_support_tickets 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create secure function for contact-free ticket viewing
CREATE OR REPLACE FUNCTION public.get_sanitized_support_tickets()
RETURNS TABLE(
  id uuid,
  ticket_number text,
  subject text,
  category text,
  priority text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow support staff to view ticket summaries
  IF NOT is_authorized_support_user() THEN
    RAISE EXCEPTION 'Access denied: Support staff access required';
  END IF;

  RETURN QUERY
  SELECT 
    cst.id,
    cst.ticket_number,
    cst.subject,
    cst.category,
    cst.priority,
    cst.status,
    cst.created_at,
    cst.updated_at
  FROM customer_support_tickets cst
  ORDER BY cst.created_at DESC;
END;
$$;

-- Create function to get customer contact info (admin only)
CREATE OR REPLACE FUNCTION public.get_customer_contact_secure(p_ticket_id uuid)
RETURNS TABLE(
  customer_name text,
  customer_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to access customer contact information
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Access denied: Admin access required for customer contact information';
  END IF;

  -- Log the access for security monitoring
  PERFORM log_security_event(
    auth.uid(),
    'customer_contact_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('ticket_id', p_ticket_id),
    40
  );

  RETURN QUERY
  SELECT 
    cst.customer_name,
    cst.customer_email
  FROM customer_support_tickets cst
  WHERE cst.id = p_ticket_id;
END;
$$;

-- Audit trigger for customer data access
CREATE OR REPLACE FUNCTION public.audit_customer_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to any customer data tables
  IF TG_OP = 'SELECT' AND TG_TABLE_NAME IN ('rental_bookings', 'property_survey_bookings', 'customer_support_tickets') THEN
    PERFORM log_security_event(
      auth.uid(),
      'customer_data_access',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', now()
      ),
      25
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers to customer data tables
DROP TRIGGER IF EXISTS audit_rental_bookings_access ON public.rental_bookings;
CREATE TRIGGER audit_rental_bookings_access
  AFTER SELECT ON public.rental_bookings
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.audit_customer_data_access();

DROP TRIGGER IF EXISTS audit_survey_bookings_access ON public.property_survey_bookings;
CREATE TRIGGER audit_survey_bookings_access
  AFTER SELECT ON public.property_survey_bookings
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.audit_customer_data_access();

DROP TRIGGER IF EXISTS audit_support_tickets_access ON public.customer_support_tickets;
CREATE TRIGGER audit_support_tickets_access
  AFTER SELECT ON public.customer_support_tickets
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.audit_customer_data_access();