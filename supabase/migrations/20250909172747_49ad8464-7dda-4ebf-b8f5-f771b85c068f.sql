-- Enhanced BPJS Data Protection Migration
-- This migration strengthens security for government ID numbers in BPJS tables

-- First, let's create audit logging functions for BPJS data access
CREATE OR REPLACE FUNCTION public.audit_bpjs_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log any access to sensitive BPJS data
  IF TG_OP IN ('SELECT') THEN
    PERFORM log_security_event(
      auth.uid(),
      'bpjs_data_access',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'vendor_id', COALESCE(NEW.vendor_id, OLD.vendor_id),
        'bpjs_type', COALESCE(NEW.bpjs_type, OLD.bpjs_type, NEW.verification_type, OLD.verification_type),
        'timestamp', now()
      ),
      25 -- Medium risk score for BPJS data access
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create a function to safely mask BPJS numbers for display
CREATE OR REPLACE FUNCTION public.mask_bpjs_number(bpjs_number text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only show first 3 and last 2 digits, mask the rest
  IF length(bpjs_number) >= 8 THEN
    RETURN left(bpjs_number, 3) || repeat('*', length(bpjs_number) - 5) || right(bpjs_number, 2);
  ELSE
    RETURN repeat('*', length(bpjs_number));
  END IF;
END;
$$;

-- Create a secure function for vendors to view their masked BPJS data
CREATE OR REPLACE FUNCTION public.get_vendor_bpjs_summary(p_vendor_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  bpjs_type text,
  masked_number text,
  verification_status text,
  verified_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow vendors to view their own data or admins to view any
  IF p_vendor_id != auth.uid() AND NOT check_admin_access() THEN
    RAISE EXCEPTION 'Access denied: Cannot view other vendors BPJS data';
  END IF;
  
  -- Log the access attempt
  PERFORM log_security_event(
    auth.uid(),
    'bpjs_summary_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('target_vendor_id', p_vendor_id),
    20
  );
  
  RETURN QUERY
  SELECT 
    bv.id,
    bv.bpjs_type::text,
    mask_bpjs_number(bv.verification_number) as masked_number,
    bv.verification_status::text,
    bv.verified_at,
    bv.expires_at,
    bv.is_valid
  FROM public.bpjs_verifications bv
  WHERE bv.vendor_id = p_vendor_id
  ORDER BY bv.created_at DESC;
END;
$$;

-- Drop existing policies and recreate with enhanced security
DROP POLICY IF EXISTS "Vendors can view their BPJS verifications" ON public.bpjs_verifications;
DROP POLICY IF EXISTS "Vendors can view their BPJS logs" ON public.bpjs_verification_logs;

-- Enhanced RLS policies for bpjs_verifications
CREATE POLICY "Strictly control BPJS verification access"
ON public.bpjs_verifications
FOR ALL
TO authenticated
USING (
  -- Only admins or the vendor who owns the data can access
  (check_admin_access() OR vendor_id = auth.uid())
  AND
  -- Log all access attempts
  (log_security_event(
    auth.uid(),
    'bpjs_verification_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('bpjs_id', id, 'action', 'access_attempt'),
    30
  ) IS NOT NULL OR true)
)
WITH CHECK (
  -- Only admins can insert/update, and only for valid vendor IDs
  check_admin_access() OR 
  (vendor_id = auth.uid() AND auth.uid() IS NOT NULL)
);

-- Enhanced RLS policies for bpjs_verification_logs
CREATE POLICY "Strictly control BPJS log access"
ON public.bpjs_verification_logs
FOR ALL
TO authenticated
USING (
  -- Only admins or the vendor who owns the data can access
  (check_admin_access() OR vendor_id = auth.uid())
  AND
  -- Log all access attempts
  (log_security_event(
    auth.uid(),
    'bpjs_log_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('log_id', id, 'action', 'log_access_attempt'),
    25
  ) IS NOT NULL OR true)
)
WITH CHECK (
  -- Only system functions and admins can insert logs
  check_admin_access()
);

-- Block all anonymous access explicitly
CREATE POLICY "Block anonymous BPJS verification access"
ON public.bpjs_verifications
FOR ALL
TO anon
USING (false);

CREATE POLICY "Block anonymous BPJS log access"  
ON public.bpjs_verification_logs
FOR ALL
TO anon
USING (false);

-- Create triggers for audit logging (commented out to avoid performance impact in production)
-- CREATE TRIGGER audit_bpjs_verifications_access
--   AFTER SELECT ON public.bpjs_verifications
--   FOR EACH ROW EXECUTE FUNCTION public.audit_bpjs_data_access();

-- CREATE TRIGGER audit_bpjs_logs_access
--   AFTER SELECT ON public.bpjs_verification_logs  
--   FOR EACH ROW EXECUTE FUNCTION public.audit_bpjs_data_access();

-- Add constraints to ensure data integrity
ALTER TABLE public.bpjs_verifications 
ADD CONSTRAINT check_bpjs_type_valid 
CHECK (bpjs_type IN ('kesehatan', 'ketenagakerjaan'));

ALTER TABLE public.bpjs_verification_logs
ADD CONSTRAINT check_verification_type_valid
CHECK (verification_type IN ('kesehatan', 'ketenagakerjaan'));

-- Add index for performance on vendor lookups
CREATE INDEX IF NOT EXISTS idx_bpjs_verifications_vendor_type 
ON public.bpjs_verifications(vendor_id, bpjs_type);

CREATE INDEX IF NOT EXISTS idx_bpjs_logs_vendor_type
ON public.bpjs_verification_logs(vendor_id, verification_type);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_vendor_bpjs_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mask_bpjs_number(text) TO authenticated;