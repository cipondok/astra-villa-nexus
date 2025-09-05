-- Fix vendor_applications table security vulnerabilities
-- Drop existing overly broad policies and create more specific ones

-- Drop the overly broad policy that allows ALL operations
DROP POLICY IF EXISTS "Vendors can create and update their applications" ON public.vendor_applications;

-- Create specific policies for each operation type
CREATE POLICY "Vendors can insert their own applications"
ON public.vendor_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own applications"
ON public.vendor_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND application_status IN ('draft', 'pending'))
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can view their own applications"
ON public.vendor_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to applications"
ON public.vendor_applications
FOR ALL
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Ensure no public access to sensitive data
CREATE POLICY "Block all anonymous access to vendor applications"
ON public.vendor_applications
FOR ALL
TO anon
USING (false);

-- Create audit function for sensitive data modifications
CREATE OR REPLACE FUNCTION public.audit_vendor_application_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log changes to sensitive vendor application data
  IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
    PERFORM log_security_event(
      auth.uid(),
      'vendor_application_' || lower(TG_OP),
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'application_id', COALESCE(NEW.id, OLD.id),
        'operation', TG_OP,
        'business_name', COALESCE(NEW.business_name, OLD.business_name),
        'has_sensitive_data', (
          COALESCE(NEW.business_registration_number, OLD.business_registration_number) IS NOT NULL OR
          COALESCE(NEW.tax_id, OLD.tax_id) IS NOT NULL OR
          COALESCE(NEW.bank_details, OLD.bank_details) IS NOT NULL OR
          COALESCE(NEW.license_info, OLD.license_info) IS NOT NULL
        )
      ),
      CASE WHEN check_admin_access() THEN 20 ELSE 40 END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging on modifications
DROP TRIGGER IF EXISTS audit_vendor_application_changes_trigger ON public.vendor_applications;
CREATE TRIGGER audit_vendor_application_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_applications
  FOR EACH ROW EXECUTE FUNCTION public.audit_vendor_application_changes();

-- Create secure function for admin access to vendor applications
CREATE OR REPLACE FUNCTION public.get_vendor_application_secure(app_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid, 
  business_name character varying,
  business_type character varying,
  application_status character varying,
  submitted_at timestamp with time zone,
  created_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can access full application details
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Insufficient permissions to access vendor application details';
  END IF;

  -- Log admin access to sensitive data
  PERFORM log_security_event(
    auth.uid(),
    'admin_vendor_application_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('application_id', app_id),
    30
  );

  RETURN QUERY
  SELECT 
    va.id,
    va.user_id,
    va.business_name,
    va.business_type,
    va.application_status,
    va.submitted_at,
    va.created_at
  FROM public.vendor_applications va
  WHERE va.id = app_id;
END;
$$;