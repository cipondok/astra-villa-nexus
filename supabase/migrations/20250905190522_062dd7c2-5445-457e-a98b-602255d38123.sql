-- Fix search path security warning for the audit function
CREATE OR REPLACE FUNCTION public.audit_vendor_application_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;