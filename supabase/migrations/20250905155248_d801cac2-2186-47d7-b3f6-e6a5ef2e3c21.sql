-- Fix vendor_applications table security vulnerabilities
-- Drop ALL existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.vendor_applications;
DROP POLICY IF EXISTS "Deny public access to vendor applications" ON public.vendor_applications;
DROP POLICY IF EXISTS "Vendors can create and update their applications" ON public.vendor_applications;
DROP POLICY IF EXISTS "Vendors can view their own applications" ON public.vendor_applications;
DROP POLICY IF EXISTS "Block all anonymous access to vendor applications" ON public.vendor_applications;

-- Create new secure, specific policies
CREATE POLICY "vendor_applications_vendor_insert"
ON public.vendor_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vendor_applications_vendor_update"
ON public.vendor_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND application_status IN ('draft', 'pending'))
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vendor_applications_vendor_select" 
ON public.vendor_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "vendor_applications_admin_full_access"
ON public.vendor_applications
FOR ALL
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Block all anonymous access completely
CREATE POLICY "vendor_applications_block_anon"
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