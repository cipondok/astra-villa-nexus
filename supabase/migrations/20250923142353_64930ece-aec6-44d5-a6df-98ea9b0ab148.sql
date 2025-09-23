-- Secure identity verification documents and KYC data

-- Create vendor_verification_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vendor_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('ktp', 'npwp', 'siup', 'situ', 'tdp', 'akta_pendirian', 'sk_kemenkumham', 'nib', 'passport', 'driving_license')),
  document_number TEXT NOT NULL,
  document_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  expiry_date DATE,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor_kyc_verification table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vendor_kyc_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  kyc_level TEXT NOT NULL DEFAULT 'basic' CHECK (kyc_level IN ('basic', 'enhanced', 'premium')),
  face_verification_url TEXT,
  face_verification_status TEXT DEFAULT 'pending' CHECK (face_verification_status IN ('pending', 'verified', 'failed', 'expired')),
  identity_score NUMERIC(3,2),
  liveness_score NUMERIC(3,2),
  document_authenticity_score NUMERIC(3,2),
  overall_verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (overall_verification_status IN ('pending', 'verified', 'rejected', 'under_review')),
  verification_attempts INTEGER DEFAULT 0,
  last_verification_attempt TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reasons JSONB DEFAULT '[]',
  verification_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all identity verification tables
ALTER TABLE public.vendor_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_kyc_verification ENABLE ROW LEVEL SECURITY;

-- Create function to mask sensitive document numbers
CREATE OR REPLACE FUNCTION public.mask_document_number(doc_number TEXT)
RETURNS TEXT
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only show first 2 and last 2 characters, mask the rest
  IF length(doc_number) >= 6 THEN
    RETURN left(doc_number, 2) || repeat('*', length(doc_number) - 4) || right(doc_number, 2);
  ELSE
    RETURN repeat('*', length(doc_number));
  END IF;
END;
$$;

-- Create function to log identity verification access
CREATE OR REPLACE FUNCTION public.log_identity_verification_access(
  table_name TEXT,
  operation TEXT,
  record_id UUID,
  vendor_id UUID,
  user_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.user_security_logs (
    user_id, 
    event_type, 
    ip_address,
    metadata
  ) VALUES (
    user_id,
    'identity_verification_access',
    inet_client_addr(),
    jsonb_build_object(
      'table', table_name,
      'operation', operation,
      'record_id', record_id,
      'target_vendor_id', vendor_id,
      'timestamp', now(),
      'sensitive_data_accessed', true
    )
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Block all direct access to verification docs" ON public.vendor_verification_documents;
DROP POLICY IF EXISTS "Super admin only access to verification docs" ON public.vendor_verification_documents;
DROP POLICY IF EXISTS "Block all direct access to KYC verification" ON public.vendor_kyc_verification;
DROP POLICY IF EXISTS "Super admin only access to KYC verification" ON public.vendor_kyc_verification;

-- Ultra-restrictive RLS policies for vendor_verification_documents
CREATE POLICY "Block all direct access to verification docs"
ON public.vendor_verification_documents
FOR ALL
USING (false)
WITH CHECK (false);

CREATE POLICY "Super admin only access to verification docs"
ON public.vendor_verification_documents
FOR ALL
USING (
  check_super_admin_email() 
  AND log_identity_verification_access('vendor_verification_documents', 'ACCESS', id, vendor_id) IS NOT NULL
)
WITH CHECK (
  check_super_admin_email()
);

-- Ultra-restrictive RLS policies for vendor_kyc_verification
CREATE POLICY "Block all direct access to KYC verification"
ON public.vendor_kyc_verification
FOR ALL
USING (false)
WITH CHECK (false);

CREATE POLICY "Super admin only access to KYC verification"
ON public.vendor_kyc_verification
FOR ALL
USING (
  check_super_admin_email() 
  AND log_identity_verification_access('vendor_kyc_verification', 'ACCESS', id, vendor_id) IS NOT NULL
)
WITH CHECK (
  check_super_admin_email()
);

-- Create secure function to get masked verification document summary (admin only)
CREATE OR REPLACE FUNCTION public.get_vendor_verification_summary(p_vendor_id UUID)
RETURNS TABLE(
  document_count INTEGER,
  verified_documents INTEGER,
  pending_documents INTEGER,
  rejected_documents INTEGER,
  kyc_status TEXT,
  kyc_level TEXT,
  overall_score NUMERIC
)
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can access verification summaries
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Insufficient permissions to access verification data';
  END IF;

  -- Log the access
  PERFORM log_identity_verification_access('verification_summary', 'SUMMARY_ACCESS', NULL, p_vendor_id);

  RETURN QUERY
  SELECT 
    COALESCE((SELECT COUNT(*)::INTEGER FROM vendor_verification_documents WHERE vendor_id = p_vendor_id), 0) as document_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM vendor_verification_documents WHERE vendor_id = p_vendor_id AND verification_status = 'verified'), 0) as verified_documents,
    COALESCE((SELECT COUNT(*)::INTEGER FROM vendor_verification_documents WHERE vendor_id = p_vendor_id AND verification_status = 'pending'), 0) as pending_documents,
    COALESCE((SELECT COUNT(*)::INTEGER FROM vendor_verification_documents WHERE vendor_id = p_vendor_id AND verification_status = 'rejected'), 0) as rejected_documents,
    COALESCE((SELECT overall_verification_status FROM vendor_kyc_verification WHERE vendor_id = p_vendor_id ORDER BY created_at DESC LIMIT 1), 'not_started') as kyc_status,
    COALESCE((SELECT kyc_level FROM vendor_kyc_verification WHERE vendor_id = p_vendor_id ORDER BY created_at DESC LIMIT 1), 'none') as kyc_level,
    COALESCE((SELECT (identity_score + liveness_score + document_authenticity_score) / 3 FROM vendor_kyc_verification WHERE vendor_id = p_vendor_id ORDER BY created_at DESC LIMIT 1), 0.00) as overall_score;
END;
$$;

-- Create function to securely update verification status (admin only)
CREATE OR REPLACE FUNCTION public.update_verification_status(
  p_document_id UUID,
  p_status TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc_vendor_id UUID;
BEGIN
  -- Only admins can update verification status
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Insufficient permissions to update verification status';
  END IF;

  -- Validate status
  IF p_status NOT IN ('verified', 'rejected', 'pending') THEN
    RAISE EXCEPTION 'Invalid verification status';
  END IF;

  -- Get vendor_id for logging
  SELECT vendor_id INTO doc_vendor_id FROM vendor_verification_documents WHERE id = p_document_id;
  
  IF doc_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Document not found';
  END IF;

  -- Log the verification status change
  PERFORM log_identity_verification_access('vendor_verification_documents', 'STATUS_UPDATE', p_document_id, doc_vendor_id);

  -- Update the document
  UPDATE vendor_verification_documents 
  SET 
    verification_status = p_status,
    verified_by = auth.uid(),
    verified_at = CASE WHEN p_status = 'verified' THEN now() ELSE NULL END,
    rejection_reason = p_rejection_reason,
    updated_at = now()
  WHERE id = p_document_id;

  RETURN FOUND;
END;
$$;

-- Create audit triggers for identity verification tables
CREATE OR REPLACE FUNCTION public.audit_identity_verification_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all identity verification operations with high risk score
  PERFORM log_security_event(
    auth.uid(),
    'identity_verification_operation',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'vendor_id', COALESCE(NEW.vendor_id, OLD.vendor_id),
      'document_type', COALESCE(NEW.document_type, OLD.document_type),
      'verification_status', COALESCE(NEW.verification_status, OLD.verification_status, NEW.overall_verification_status, OLD.overall_verification_status),
      'highly_sensitive_pii', true
    ),
    90 -- Very high risk score for PII access
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add audit triggers to all identity verification tables
DROP TRIGGER IF EXISTS audit_vendor_verification_documents ON public.vendor_verification_documents;
CREATE TRIGGER audit_vendor_verification_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_identity_verification_access();

DROP TRIGGER IF EXISTS audit_vendor_kyc_verification ON public.vendor_kyc_verification;
CREATE TRIGGER audit_vendor_kyc_verification
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_kyc_verification
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_identity_verification_access();

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_identity_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_vendor_verification_documents_updated_at ON public.vendor_verification_documents;
CREATE TRIGGER update_vendor_verification_documents_updated_at
  BEFORE UPDATE ON public.vendor_verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_identity_verification_updated_at();

DROP TRIGGER IF EXISTS update_vendor_kyc_verification_updated_at ON public.vendor_kyc_verification;
CREATE TRIGGER update_vendor_kyc_verification_updated_at
  BEFORE UPDATE ON public.vendor_kyc_verification
  FOR EACH ROW
  EXECUTE FUNCTION public.update_identity_verification_updated_at();