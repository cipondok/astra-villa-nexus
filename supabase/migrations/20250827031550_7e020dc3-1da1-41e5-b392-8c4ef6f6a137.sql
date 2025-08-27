-- Fix Customer Support Tickets Security Issues
-- Drop existing potentially conflicting policies
DROP POLICY IF EXISTS "Anyone can create tickets" ON customer_support_tickets;
DROP POLICY IF EXISTS "CS agents can manage all tickets" ON customer_support_tickets;
DROP POLICY IF EXISTS "Users can only view their own support tickets" ON customer_support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON customer_support_tickets;

-- Create secure and comprehensive RLS policies for customer_support_tickets

-- 1. Allow authenticated users and anonymous users to create tickets
-- (Anonymous for public contact forms, authenticated for logged-in users)
CREATE POLICY "Allow ticket creation for authenticated and anonymous users"
ON customer_support_tickets
FOR INSERT
WITH CHECK (true);

-- 2. Customers can only view their own tickets
CREATE POLICY "Customers can view their own tickets only"
ON customer_support_tickets
FOR SELECT
USING (
  auth.uid() = customer_id OR
  is_authorized_support_user() OR
  auth.uid() = assigned_to
);

-- 3. Only customers can update their own customer response field
CREATE POLICY "Customers can update their own response"
ON customer_support_tickets
FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (
  auth.uid() = customer_id AND
  -- Only allow updating customer_response field
  OLD.customer_id = NEW.customer_id AND
  OLD.ticket_number = NEW.ticket_number AND
  OLD.customer_name = NEW.customer_name AND
  OLD.customer_email = NEW.customer_email AND
  OLD.subject = NEW.subject AND
  OLD.message = NEW.message AND
  OLD.category = NEW.category AND
  OLD.assigned_to = NEW.assigned_to AND
  OLD.status = NEW.status AND
  OLD.priority = NEW.priority
);

-- 4. Support staff and admins can manage all tickets
CREATE POLICY "Support staff can manage all tickets"
ON customer_support_tickets
FOR ALL
USING (is_authorized_support_user())
WITH CHECK (is_authorized_support_user());

-- 5. Assigned agents can view and update their assigned tickets
CREATE POLICY "Assigned agents can manage their tickets"
ON customer_support_tickets
FOR ALL
USING (
  auth.uid() = assigned_to OR
  is_authorized_support_user()
)
WITH CHECK (
  auth.uid() = assigned_to OR
  is_authorized_support_user()
);

-- 6. Prevent unauthorized deletion - only admins and support staff
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
  
  -- Generate unique ticket number
  ticket_number := 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(nextval('ticket_sequence')::text, 4, '0');
  
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

-- Create sequence for ticket numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS ticket_sequence START 1;