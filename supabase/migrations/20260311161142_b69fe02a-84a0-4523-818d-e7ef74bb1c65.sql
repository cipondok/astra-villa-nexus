-- Drop existing functions first to avoid ambiguity
DROP FUNCTION IF EXISTS public.encrypt_api_key(TEXT);
DROP FUNCTION IF EXISTS public.decrypt_api_key(TEXT);

-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Secure encryption function for API keys using Supabase Vault
CREATE OR REPLACE FUNCTION public.encrypt_api_key(plain_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  enc_key TEXT;
BEGIN
  IF plain_key IS NULL OR plain_key = '' THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    SELECT decrypted_secret INTO enc_key
    FROM vault.decrypted_secrets
    WHERE name = 'api_key_encryption_key'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    enc_key := NULL;
  END;
  
  IF enc_key IS NULL THEN
    RETURN 'plain:' || plain_key;
  END IF;
  
  RETURN 'enc:' || encode(pgp_sym_encrypt(plain_key, enc_key)::bytea, 'base64');
END;
$$;

-- Secure decryption function
CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  enc_key TEXT;
BEGIN
  IF encrypted_key IS NULL THEN RETURN NULL; END IF;
  
  IF encrypted_key LIKE 'plain:%' THEN
    RETURN substring(encrypted_key FROM 7);
  END IF;
  
  IF encrypted_key LIKE 'enc:%' THEN
    BEGIN
      SELECT decrypted_secret INTO enc_key
      FROM vault.decrypted_secrets
      WHERE name = 'api_key_encryption_key' LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Vault encryption key not available';
    END;
    IF enc_key IS NULL THEN
      RAISE EXCEPTION 'Vault encryption key not configured';
    END IF;
    RETURN pgp_sym_decrypt(decode(substring(encrypted_key FROM 5), 'base64'), enc_key);
  END IF;
  
  RETURN encrypted_key;
END;
$$;

-- Restrict access
REVOKE ALL ON FUNCTION public.encrypt_api_key(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.encrypt_api_key(TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.decrypt_api_key(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrypt_api_key(TEXT) TO authenticated;

COMMENT ON FUNCTION public.encrypt_api_key(TEXT) IS 'Encrypts API keys via pgp_sym_encrypt with Vault key (api_key_encryption_key). Falls back to plain: prefix if vault not configured.';
COMMENT ON FUNCTION public.decrypt_api_key(TEXT) IS 'Decrypts API keys from encrypt_api_key(). Handles enc:, plain:, and legacy values.';