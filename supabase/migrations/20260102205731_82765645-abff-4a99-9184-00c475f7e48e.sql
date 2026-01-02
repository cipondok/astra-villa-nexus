-- Ensure KYC documents bucket is PRIVATE (critical security fix)
-- This fixes the public bucket exposure vulnerability

-- Update the bucket to be private if it exists
UPDATE storage.buckets 
SET public = false 
WHERE id = 'kyc-documents';

-- Ensure proper RLS policies exist for the bucket
-- Drop any overly permissive policies first
DROP POLICY IF EXISTS "KYC documents public access" ON storage.objects;
DROP POLICY IF EXISTS "Public KYC access" ON storage.objects;

-- Create secure policies if they don't exist
DO $$
BEGIN
  -- Policy: Only owners can view their own KYC documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'kyc_owner_select_secure' 
    AND tablename = 'objects'
  ) THEN
    CREATE POLICY "kyc_owner_select_secure" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'kyc-documents' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Policy: Only owners can upload their own KYC documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'kyc_owner_insert_secure' 
    AND tablename = 'objects'
  ) THEN
    CREATE POLICY "kyc_owner_insert_secure" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'kyc-documents' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Policy: Admins can view KYC documents with logging
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'kyc_admin_select_logged' 
    AND tablename = 'objects'
  ) THEN
    CREATE POLICY "kyc_admin_select_logged" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'kyc-documents' AND 
      check_admin_access() AND
      log_security_event(
        auth.uid(), 
        'kyc_document_access', 
        inet_client_addr(),
        NULL,
        NULL,
        jsonb_build_object('document_path', name),
        90
      ) IS NOT NULL
    );
  END IF;
END $$;