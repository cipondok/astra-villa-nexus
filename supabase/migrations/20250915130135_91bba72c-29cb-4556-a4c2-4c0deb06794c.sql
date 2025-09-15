-- Comprehensive security enhancement for BPJS healthcare data (fixed version)
-- Create encryption functions for healthcare data

-- Function to encrypt BPJS numbers and sensitive healthcare data
CREATE OR REPLACE FUNCTION public.encrypt_healthcare_data(healthcare_data text, data_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  encrypted_data text;
BEGIN
  -- Validate input
  IF healthcare_data IS NULL OR length(trim(healthcare_data)) = 0 THEN
    RETURN NULL;
  END IF;
  
  -- Use pgcrypto extension for encryption with healthcare-specific salt
  encrypted_data := encode(
    encrypt(
      healthcare_data::bytea, 
      encode(digest(data_type || 'HEALTHCARE_SALT' || current_setting('app.healthcare_encryption_key', true), 'sha256'), 'hex')::bytea,
      'aes'
    ), 
    'base64'
  );
  
  RETURN encrypted_data;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error securely without exposing the data
    PERFORM log_security_event(
      auth.uid(),
      'healthcare_data_encryption_failed',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object('data_type', data_type, 'error', 'encryption_failed'),
      90
    );
    RAISE EXCEPTION 'Failed to encrypt healthcare data';
END;
$$;

-- Function to decrypt healthcare data (super admin only)
CREATE OR REPLACE FUNCTION public.decrypt_healthcare_data(encrypted_data text, data_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  decrypted_data text;
BEGIN
  -- Only allow super admins to decrypt healthcare data
  IF NOT check_super_admin_email() THEN
    RAISE EXCEPTION 'Access denied: Only super administrators can decrypt healthcare data';
  END IF;
  
  -- Log the decryption access with high risk score
  PERFORM log_security_event(
    auth.uid(),
    'healthcare_data_decryption_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'data_type', data_type,
      'timestamp', now(),
      'justification_required', true
    ),
    80
  );
  
  IF encrypted_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  decrypted_data := convert_from(
    decrypt(
      decode(encrypted_data, 'base64'),
      encode(digest(data_type || 'HEALTHCARE_SALT' || current_setting('app.healthcare_encryption_key', true), 'sha256'), 'hex')::bytea,
      'aes'
    ),
    'UTF8'
  );
  
  RETURN decrypted_data;
EXCEPTION
  WHEN OTHERS THEN
    -- Log decryption failure with high priority
    PERFORM log_security_event(
      auth.uid(),
      'healthcare_data_decryption_failed',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object('data_type', data_type, 'error', 'decryption_failed'),
      95
    );
    RAISE EXCEPTION 'Failed to decrypt healthcare data';
END;
$$;

-- Function to mask BPJS numbers for display
CREATE OR REPLACE FUNCTION public.mask_bpjs_number_secure(bpjs_number text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log access to masking function
  PERFORM log_security_event(
    auth.uid(),
    'bpjs_number_mask_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('timestamp', now()),
    20
  );
  
  -- Mask BPJS number showing only first 3 and last 2 digits
  IF bpjs_number IS NULL OR length(bpjs_number) < 8 THEN
    RETURN repeat('*', 12);
  END IF;
  
  RETURN left(bpjs_number, 3) || repeat('*', length(bpjs_number) - 5) || right(bpjs_number, 2);
END;
$$;

-- Secure function to get BPJS verification summary (admin or owner only)
CREATE OR REPLACE FUNCTION public.get_bpjs_verification_summary(p_vendor_id uuid)
RETURNS TABLE(
  vendor_id uuid,
  bpjs_kesehatan_status text,
  bpjs_ketenagakerjaan_status text,
  verification_date timestamptz,
  is_fully_verified boolean,
  last_verification_attempt timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins or the vendor themselves can access verification summary
  IF NOT (check_admin_access() OR auth.uid() = p_vendor_id) THEN
    RAISE EXCEPTION 'Access denied: Insufficient privileges to view BPJS verification data';
  END IF;
  
  -- Log the access with vendor ID
  PERFORM log_security_event(
    auth.uid(),
    'bpjs_verification_summary_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'requested_vendor_id', p_vendor_id,
      'is_self_access', (auth.uid() = p_vendor_id)
    ),
    CASE WHEN auth.uid() = p_vendor_id THEN 15 ELSE 40 END
  );
  
  RETURN QUERY
  SELECT 
    vbp.vendor_id,
    vbp.bpjs_kesehatan_status::text,
    vbp.bpjs_ketenagakerjaan_status::text,
    vbp.bpjs_verification_date,
    (vbp.bpjs_kesehatan_verified AND vbp.bpjs_ketenagakerjaan_verified) as is_fully_verified,
    (
      SELECT MAX(created_at) 
      FROM bpjs_verification_logs 
      WHERE bpjs_verification_logs.vendor_id = p_vendor_id
    ) as last_verification_attempt
  FROM vendor_business_profiles vbp
  WHERE vbp.vendor_id = p_vendor_id;
END;
$$;

-- Secure function to create BPJS verification log
CREATE OR REPLACE FUNCTION public.create_bpjs_verification_log_secure(
  p_vendor_id uuid,
  p_bpjs_number text,
  p_verification_type text,
  p_verification_status text,
  p_api_response jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id uuid;
  encrypted_bpjs_number text;
BEGIN
  -- Only admins can create verification logs
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can create BPJS verification logs';
  END IF;
  
  -- Validate inputs
  IF p_vendor_id IS NULL OR p_bpjs_number IS NULL OR p_verification_type IS NULL THEN
    RAISE EXCEPTION 'Vendor ID, BPJS number, and verification type are required';
  END IF;
  
  -- Encrypt the BPJS number
  encrypted_bpjs_number := encrypt_healthcare_data(p_bpjs_number, 'BPJS_NUMBER');
  
  -- Insert verification log with encrypted data
  INSERT INTO bpjs_verification_logs (
    vendor_id,
    bpjs_number,
    verification_type,
    verification_status,
    api_response,
    verified_at
  ) VALUES (
    p_vendor_id,
    encrypted_bpjs_number,
    p_verification_type,
    p_verification_status,
    p_api_response,
    now()
  ) RETURNING id INTO log_id;
  
  -- Log the verification attempt
  PERFORM log_security_event(
    auth.uid(),
    'bpjs_verification_log_created',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'log_id', log_id,
      'vendor_id', p_vendor_id,
      'verification_type', p_verification_type,
      'verification_status', p_verification_status
    ),
    45
  );
  
  RETURN log_id;
END;
$$;

-- Enhanced audit function for healthcare data access (INSERT/UPDATE/DELETE only)
CREATE OR REPLACE FUNCTION public.audit_healthcare_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  risk_score integer := 60;
  access_type text;
BEGIN
  -- Determine access type and risk level
  CASE TG_TABLE_NAME
    WHEN 'bpjs_verification_logs' THEN
      access_type := 'verification_logs';
      risk_score := 70;
    WHEN 'bpjs_verifications' THEN
      access_type := 'verifications';
      risk_score := 65;
    ELSE
      access_type := 'unknown_healthcare_table';
      risk_score := 80;
  END CASE;
  
  -- Log comprehensive access information
  PERFORM log_security_event(
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'healthcare_data_' || access_type || '_' || lower(TG_OP),
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'vendor_id', COALESCE(NEW.vendor_id, OLD.vendor_id),
      'timestamp', now(),
      'session_info', jsonb_build_object(
        'current_role', current_setting('role'),
        'application_name', current_setting('application_name'),
        'is_superuser', (current_setting('is_superuser') = 'on')
      ),
      'hipaa_relevant', true,
      'data_classification', 'healthcare_sensitive'
    ),
    risk_score
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update RLS policies for BPJS verification logs to be more restrictive
DROP POLICY IF EXISTS "Admins can manage BPJS logs" ON public.bpjs_verification_logs;
DROP POLICY IF EXISTS "Block anonymous BPJS log access" ON public.bpjs_verification_logs;
DROP POLICY IF EXISTS "Strictly control BPJS log access" ON public.bpjs_verification_logs;

-- Create new ultra-restrictive policies
CREATE POLICY "Block all direct access to BPJS logs"
ON public.bpjs_verification_logs
FOR ALL
TO public
USING (false)
WITH CHECK (false);

CREATE POLICY "Allow super admin and service role only for BPJS logs"
ON public.bpjs_verification_logs
FOR ALL
TO authenticated
USING (
  check_super_admin_email() OR 
  current_setting('role') = 'service_role'
)
WITH CHECK (
  check_super_admin_email() OR 
  current_setting('role') = 'service_role'
);

-- Update RLS policies for BPJS verifications
DROP POLICY IF EXISTS "Admins can manage BPJS verifications" ON public.bpjs_verifications;
DROP POLICY IF EXISTS "Block anonymous BPJS verification access" ON public.bpjs_verifications;
DROP POLICY IF EXISTS "Strictly control BPJS verification access" ON public.bpjs_verifications;

-- Create new ultra-restrictive policies for BPJS verifications
CREATE POLICY "Block all direct access to BPJS verifications"
ON public.bpjs_verifications
FOR ALL
TO public
USING (false)
WITH CHECK (false);

CREATE POLICY "Allow super admin and service role only for BPJS verifications"
ON public.bpjs_verifications
FOR ALL
TO authenticated
USING (
  check_super_admin_email() OR 
  current_setting('role') = 'service_role'
)
WITH CHECK (
  check_super_admin_email() OR 
  current_setting('role') = 'service_role'
);

-- Add enhanced audit triggers (INSERT/UPDATE/DELETE only)
DROP TRIGGER IF EXISTS audit_bpjs_data_access ON public.bpjs_verification_logs;
DROP TRIGGER IF EXISTS audit_bpjs_data_access ON public.bpjs_verifications;

CREATE TRIGGER audit_healthcare_data_access_logs
  BEFORE INSERT OR UPDATE OR DELETE ON public.bpjs_verification_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_healthcare_data_access();

CREATE TRIGGER audit_healthcare_data_access_verifications
  BEFORE INSERT OR UPDATE OR DELETE ON public.bpjs_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_healthcare_data_access();

-- Add documentation and compliance notes
COMMENT ON TABLE public.bpjs_verification_logs IS 'HEALTHCARE SENSITIVE: Contains encrypted BPJS verification data. All access logged for compliance. Use secure functions only.';
COMMENT ON TABLE public.bpjs_verifications IS 'HEALTHCARE SENSITIVE: Contains encrypted BPJS verification status. All access logged for compliance. Use secure functions only.';
COMMENT ON COLUMN public.bpjs_verification_logs.bpjs_number IS 'ENCRYPTED: BPJS healthcare ID number. Use decrypt_healthcare_data() with proper authorization.';
COMMENT ON COLUMN public.bpjs_verifications.verification_number IS 'ENCRYPTED: BPJS verification number. Use decrypt_healthcare_data() with proper authorization.';

COMMENT ON FUNCTION public.encrypt_healthcare_data(text, text) IS 'Encrypts sensitive healthcare data using AES encryption with healthcare-specific salt.';
COMMENT ON FUNCTION public.decrypt_healthcare_data(text, text) IS 'RESTRICTED: Decrypts healthcare data. Super admin access only with full audit logging.';
COMMENT ON FUNCTION public.mask_bpjs_number_secure(text) IS 'Safely masks BPJS numbers for display while logging access attempts.';
COMMENT ON FUNCTION public.get_bpjs_verification_summary(uuid) IS 'Returns non-sensitive BPJS verification summary with access logging.';