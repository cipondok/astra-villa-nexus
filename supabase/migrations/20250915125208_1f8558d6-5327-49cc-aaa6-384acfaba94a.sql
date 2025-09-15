-- Add encryption functions and update api_settings security
-- First, create encryption functions for API keys
CREATE OR REPLACE FUNCTION public.encrypt_api_key(api_key text, key_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  encrypted_key text;
BEGIN
  -- Use pgcrypto extension for encryption (assuming it's available)
  -- In production, you should use a proper key management system
  encrypted_key := encode(
    encrypt(
      api_key::bytea, 
      encode(digest(key_name || current_setting('app.encryption_secret', true), 'sha256'), 'hex')::bytea,
      'aes'
    ), 
    'base64'
  );
  
  RETURN encrypted_key;
EXCEPTION
  WHEN OTHERS THEN
    -- If encryption fails, log the error securely without exposing the key
    PERFORM log_security_event(
      auth.uid(),
      'api_key_encryption_failed',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object('key_name', key_name, 'error', 'encryption_failed'),
      80
    );
    RAISE EXCEPTION 'Failed to encrypt API key';
END;
$$;

-- Create decryption function
CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key text, key_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  decrypted_key text;
BEGIN
  -- Only allow admins to decrypt
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can decrypt API keys';
  END IF;
  
  -- Log the decryption access
  PERFORM log_security_event(
    auth.uid(),
    'api_key_decryption_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('key_name', key_name),
    50
  );
  
  decrypted_key := convert_from(
    decrypt(
      decode(encrypted_key, 'base64'),
      encode(digest(key_name || current_setting('app.encryption_secret', true), 'sha256'), 'hex')::bytea,
      'aes'
    ),
    'UTF8'
  );
  
  RETURN decrypted_key;
EXCEPTION
  WHEN OTHERS THEN
    -- Log decryption failure
    PERFORM log_security_event(
      auth.uid(),
      'api_key_decryption_failed',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object('key_name', key_name, 'error', 'decryption_failed'),
      90
    );
    RAISE EXCEPTION 'Failed to decrypt API key';
END;
$$;

-- Create secure API key viewing function that masks keys
CREATE OR REPLACE FUNCTION public.get_masked_api_settings()
RETURNS TABLE(
  id uuid,
  api_name text,
  api_key_masked text,
  api_endpoint text,
  description text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can access this function
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Access denied: Administrator privileges required';
  END IF;
  
  -- Log the access
  PERFORM log_security_event(
    auth.uid(),
    'masked_api_settings_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('timestamp', now()),
    30
  );
  
  RETURN QUERY
  SELECT 
    a.id,
    a.api_name,
    CASE 
      WHEN a.api_key IS NOT NULL AND length(a.api_key) > 8 THEN
        left(a.api_key, 4) || repeat('*', length(a.api_key) - 8) || right(a.api_key, 4)
      ELSE
        repeat('*', 12)
    END as api_key_masked,
    a.api_endpoint,
    a.description,
    a.is_active,
    a.created_at,
    a.updated_at
  FROM api_settings a
  ORDER BY a.created_at DESC;
END;
$$;

-- Create secure insert function for API settings
CREATE OR REPLACE FUNCTION public.insert_api_setting_secure(
  p_api_name text,
  p_api_key text,
  p_api_endpoint text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_is_active boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  setting_id uuid;
  encrypted_key text;
BEGIN
  -- Only admins can create API settings
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Access denied: Administrator privileges required';
  END IF;
  
  -- Validate inputs
  IF p_api_name IS NULL OR length(trim(p_api_name)) = 0 THEN
    RAISE EXCEPTION 'API name is required';
  END IF;
  
  IF p_api_key IS NULL OR length(trim(p_api_key)) < 8 THEN
    RAISE EXCEPTION 'API key must be at least 8 characters';
  END IF;
  
  -- Encrypt the API key
  encrypted_key := encrypt_api_key(p_api_key, p_api_name);
  
  -- Insert the setting
  INSERT INTO api_settings (
    api_name,
    api_key,
    api_endpoint,
    description,
    is_active,
    created_by
  ) VALUES (
    trim(p_api_name),
    encrypted_key,
    p_api_endpoint,
    p_description,
    p_is_active,
    auth.uid()
  ) RETURNING id INTO setting_id;
  
  -- Log the creation
  PERFORM log_security_event(
    auth.uid(),
    'api_setting_created',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'setting_id', setting_id,
      'api_name', p_api_name,
      'has_endpoint', (p_api_endpoint IS NOT NULL)
    ),
    40
  );
  
  RETURN setting_id;
END;
$$;

-- Update existing RLS policies to be more restrictive
DROP POLICY IF EXISTS "Deny anonymous access to API settings" ON public.api_settings;
DROP POLICY IF EXISTS "Only admins can delete API settings" ON public.api_settings;  
DROP POLICY IF EXISTS "Only admins can insert API settings" ON public.api_settings;
DROP POLICY IF EXISTS "Only admins can update API settings" ON public.api_settings;
DROP POLICY IF EXISTS "Only admins can view API settings" ON public.api_settings;

-- Create new, stricter policies
CREATE POLICY "Completely block direct access to api_settings"
ON public.api_settings
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Create policy that only allows access through security definer functions
CREATE POLICY "Allow function-based access only"
ON public.api_settings
FOR ALL
TO authenticated
USING (
  -- This policy will only be bypassed by SECURITY DEFINER functions
  current_setting('role') = 'service_role' OR 
  check_super_admin_email()
)
WITH CHECK (
  current_setting('role') = 'service_role' OR 
  check_super_admin_email()
);

-- Add trigger to audit any direct access attempts
CREATE OR REPLACE FUNCTION public.audit_api_settings_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log any access attempt to API settings
  PERFORM log_security_event(
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'api_settings_direct_access_attempt',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'timestamp', now(),
      'current_role', current_setting('role'),
      'bypassed_rls', (current_setting('row_security') = 'off')
    ),
    95 -- Very high risk score
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create audit triggers
DROP TRIGGER IF EXISTS audit_api_settings_access_trigger ON public.api_settings;
CREATE TRIGGER audit_api_settings_access_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON public.api_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_api_settings_access();

-- Add comments for documentation
COMMENT ON TABLE public.api_settings IS 'Stores encrypted API keys and settings. Direct access is blocked - use security definer functions only.';
COMMENT ON COLUMN public.api_settings.api_key IS 'Encrypted API key. Use decrypt_api_key() function to retrieve plain text (admin only).';
COMMENT ON FUNCTION public.get_masked_api_settings() IS 'Returns API settings with masked keys for admin dashboard display.';
COMMENT ON FUNCTION public.insert_api_setting_secure(text, text, text, text, boolean) IS 'Securely inserts API settings with encryption and audit logging.';