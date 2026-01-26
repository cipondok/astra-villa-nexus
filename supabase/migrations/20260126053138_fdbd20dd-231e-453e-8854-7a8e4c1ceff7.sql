-- Fix Error-Level Security Issues: Profiles Access & BPJS Health Data
-- Issue 1: Consolidate admin profile access with mandatory audit logging
-- Issue 2: Add audit logging and data minimization for BPJS health data

-- ============================================================
-- PART 1: PROFILES TABLE - Consolidate Admin Access Policies
-- ============================================================

-- Drop the policy without audit logging
DROP POLICY IF EXISTS "admins_view_all_profiles_v2" ON public.profiles;

-- The strict_admins_full_access policy already exists with proper logging
-- Verify it handles all admin access cases (it already does)

-- Create audit logging function for BPJS/health data access (high risk score)
CREATE OR REPLACE FUNCTION public.log_health_data_access(
  p_accessed_user_id uuid,
  p_data_type text,
  p_action text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  INSERT INTO public.user_security_logs (
    user_id,
    event_type,
    event_description,
    risk_score,
    metadata,
    ip_address,
    user_agent
  )
  VALUES (
    auth.uid(),
    'health_data_access',
    format('%s accessed %s data for user %s', p_action, p_data_type, p_accessed_user_id),
    95, -- High risk score for health data
    jsonb_build_object(
      'accessed_user_id', p_accessed_user_id,
      'data_type', p_data_type,
      'action', p_action,
      'timestamp', now()
    ),
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$;

-- ============================================================
-- PART 2: BPJS VERIFICATIONS - Add Mandatory Audit Logging
-- ============================================================

-- Update existing policies to include audit logging
DROP POLICY IF EXISTS "Vendors can view their own BPJS verifications" ON public.bpjs_verifications;
DROP POLICY IF EXISTS "Admin can manage BPJS verifications" ON public.bpjs_verifications;

-- Policy for vendors to view their own BPJS verifications (with logging)
CREATE POLICY "Vendors can view their own BPJS verifications with logging"
ON public.bpjs_verifications
FOR SELECT
TO authenticated
USING (
  vendor_id = auth.uid() AND
  (SELECT log_health_data_access(vendor_id, 'bpjs_verification', 'SELECT')) IS NULL
);

-- Policy for admins to view BPJS verifications (with mandatory logging)
CREATE POLICY "Admins view BPJS with mandatory logging"
ON public.bpjs_verifications
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') AND
  (SELECT log_health_data_access(vendor_id, 'bpjs_verification', 'admin_SELECT')) IS NULL
);

-- Policy for admins to manage BPJS verifications (with logging)
CREATE POLICY "Admins manage BPJS with logging"
ON public.bpjs_verifications
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') AND
  (SELECT log_health_data_access(vendor_id, 'bpjs_verification', 'admin_MODIFY')) IS NULL
)
WITH CHECK (
  has_role(auth.uid(), 'admin') AND
  (SELECT log_health_data_access(vendor_id, 'bpjs_verification', 'admin_MODIFY')) IS NULL
);

-- ============================================================
-- PART 3: Create Sanitized View for BPJS Data (Data Minimization)
-- ============================================================

-- Create view that exposes only necessary BPJS fields
CREATE OR REPLACE VIEW public.bpjs_verifications_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  vendor_id,
  bpjs_type,
  verification_status,
  is_valid,
  expires_at,
  verified_at,
  created_at,
  updated_at,
  -- Only expose verification status, not complete response
  CASE 
    WHEN verification_response IS NOT NULL 
    THEN jsonb_build_object(
      'status', verification_response->>'status',
      'verified', verification_response->>'verified',
      'expiry_date', verification_response->>'expiry_date'
    )
    ELSE NULL
  END as verification_summary
  -- verification_number excluded for privacy
  -- full verification_response excluded
FROM public.bpjs_verifications;

-- Grant access to the safe view
GRANT SELECT ON public.bpjs_verifications_safe TO authenticated;

-- ============================================================
-- PART 4: Add Column-Level Comments for Compliance
-- ============================================================

COMMENT ON COLUMN public.bpjs_verifications.verification_response IS 
'Contains sensitive health/employment insurance data. Access logged via log_health_data_access(). Must comply with Indonesian UU PDP regulations. Use bpjs_verifications_safe view for routine operations.';

COMMENT ON COLUMN public.profiles.npwp_number IS
'Tax identification number - sensitive PII. Admin access logged via log_security_event().';

COMMENT ON COLUMN public.profiles.license_number IS
'Professional license - sensitive PII. Admin access logged via log_security_event().';

-- ============================================================
-- PART 5: Add Data Retention Policy (Auto-cleanup)
-- ============================================================

-- Function to cleanup old BPJS verification responses (data minimization)
CREATE OR REPLACE FUNCTION public.cleanup_old_bpjs_responses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Clear verification_response data older than 90 days
  UPDATE public.bpjs_verifications
  SET verification_response = jsonb_build_object(
    'status', verification_response->>'status',
    'archived', true,
    'archived_at', now()
  )
  WHERE created_at < now() - interval '90 days'
    AND verification_response IS NOT NULL
    AND verification_response->>'archived' IS NULL;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_bpjs_responses() IS 
'Data retention policy: Archives detailed BPJS verification responses after 90 days, keeping only status. Schedule via pg_cron or external scheduler.';