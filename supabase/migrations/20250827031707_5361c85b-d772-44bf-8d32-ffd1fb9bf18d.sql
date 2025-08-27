-- Fix Customer Support Tickets Security Issues (Corrected)
-- Drop existing potentially conflicting policies
DROP POLICY IF EXISTS "Anyone can create tickets" ON customer_support_tickets;
DROP POLICY IF EXISTS "CS agents can manage all tickets" ON customer_support_tickets;
DROP POLICY IF EXISTS "Users can only view their own support tickets" ON customer_support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON customer_support_tickets;

-- Create secure and comprehensive RLS policies for customer_support_tickets

-- 1. Allow authenticated users and anonymous users to create tickets
CREATE POLICY "Allow secure ticket creation"
ON customer_support_tickets
FOR INSERT
WITH CHECK (true);

-- 2. Customers can only view their own tickets, support staff can view all
CREATE POLICY "Customers view own tickets, support staff view all"
ON customer_support_tickets
FOR SELECT
USING (
  auth.uid() = customer_id OR
  is_authorized_support_user() OR
  auth.uid() = assigned_to
);

-- 3. Only support staff can update tickets (customers use separate function for responses)
CREATE POLICY "Support staff can update tickets"
ON customer_support_tickets
FOR UPDATE
USING (is_authorized_support_user() OR auth.uid() = assigned_to)
WITH CHECK (is_authorized_support_user() OR auth.uid() = assigned_to);

-- 4. Prevent unauthorized deletion - only support staff
CREATE POLICY "Only support staff can delete tickets"
ON customer_support_tickets
FOR DELETE
USING (is_authorized_support_user());

-- Create a secure function to create support tickets with input validation
CREATE OR REPLACE FUNCTION public.create_support_ticket_secure(
  p_customer_name text,
  p_customer_email text,
  p_subject text,
  p_message text,
  p_category text DEFAULT 'general',
  p_priority text DEFAULT 'medium'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ticket_id uuid;
  ticket_number text;
  sequence_num integer;
BEGIN
  -- Input validation
  IF p_customer_name IS NULL OR LENGTH(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Valid customer name is required (minimum 2 characters)';
  END IF;
  
  IF p_customer_email IS NULL OR p_customer_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Valid email address is required';
  END IF;
  
  IF p_subject IS NULL OR LENGTH(trim(p_subject)) < 5 THEN
    RAISE EXCEPTION 'Subject must be at least 5 characters long';
  END IF;
  
  IF p_message IS NULL OR LENGTH(trim(p_message)) < 10 THEN
    RAISE EXCEPTION 'Message must be at least 10 characters long';
  END IF;
  
  -- Validate category
  IF p_category NOT IN ('general', 'technical', 'billing', 'account', 'property', 'vendor', 'urgent') THEN
    p_category := 'general';
  END IF;
  
  -- Validate priority
  IF p_priority NOT IN ('low', 'medium', 'high', 'urgent') THEN
    p_priority := 'medium';
  END IF;
  
  -- Generate sequence number (simple approach)
  SELECT COALESCE(MAX(CAST(RIGHT(ticket_number, 4) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM customer_support_tickets
  WHERE ticket_number LIKE 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-%';
  
  -- Generate unique ticket number
  ticket_number := 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(sequence_num::text, 4, '0');
  
  -- Create the ticket
  INSERT INTO customer_support_tickets (
    customer_id,
    ticket_number,
    customer_name,
    customer_email,
    subject,
    message,
    category,
    priority,
    status
  ) VALUES (
    auth.uid(), -- Will be NULL for anonymous users
    ticket_number,
    trim(p_customer_name),
    lower(trim(p_customer_email)),
    trim(p_subject),
    trim(p_message),
    p_category,
    p_priority,
    'open'
  ) RETURNING id INTO ticket_id;
  
  -- Log the ticket creation for security monitoring
  PERFORM log_security_event(
    auth.uid(),
    'support_ticket_created',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'ticket_id', ticket_id,
      'ticket_number', ticket_number,
      'category', p_category,
      'priority', p_priority
    ),
    CASE 
      WHEN p_priority = 'urgent' THEN 50
      WHEN p_priority = 'high' THEN 30
      ELSE 10
    END
  );
  
  RETURN ticket_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error attempt
    PERFORM log_security_event(
      auth.uid(),
      'support_ticket_creation_failed',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'error', SQLERRM,
        'customer_email', p_customer_email
      ),
      60
    );
    RAISE;
END;
$$;

-- Create a secure function for customers to add responses to their tickets
CREATE OR REPLACE FUNCTION public.add_customer_response_secure(
  p_ticket_id uuid,
  p_customer_response text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ticket_owner uuid;
BEGIN
  -- Validate input
  IF p_customer_response IS NULL OR LENGTH(trim(p_customer_response)) < 5 THEN
    RAISE EXCEPTION 'Response must be at least 5 characters long';
  END IF;
  
  -- Check if user owns this ticket
  SELECT customer_id INTO ticket_owner
  FROM customer_support_tickets
  WHERE id = p_ticket_id;
  
  IF ticket_owner IS NULL THEN
    RAISE EXCEPTION 'Ticket not found';
  END IF;
  
  IF ticket_owner != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You can only respond to your own tickets';
  END IF;
  
  -- Update the ticket with customer response
  UPDATE customer_support_tickets
  SET 
    customer_response = trim(p_customer_response),
    updated_at = now()
  WHERE id = p_ticket_id;
  
  -- Log the response for security monitoring
  PERFORM log_security_event(
    auth.uid(),
    'customer_response_added',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('ticket_id', p_ticket_id),
    10
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error attempt
    PERFORM log_security_event(
      auth.uid(),
      'customer_response_failed',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'ticket_id', p_ticket_id,
        'error', SQLERRM
      ),
      40
    );
    RAISE;
END;
$$;