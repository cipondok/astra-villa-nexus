
-- Transaction Documents: core table for all property transaction documents
CREATE TABLE public.transaction_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Context references
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  offer_id uuid DEFAULT NULL,
  booking_id uuid DEFAULT NULL,
  legal_request_id uuid REFERENCES public.legal_service_requests(id) ON DELETE SET NULL,
  -- Document info
  document_number text NOT NULL DEFAULT ('DOC-' || substr(gen_random_uuid()::text, 1, 8)),
  document_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  mime_type text DEFAULT 'application/pdf',
  -- Ownership
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Signing workflow
  status text NOT NULL DEFAULT 'draft',
  requires_signature boolean NOT NULL DEFAULT false,
  signature_order jsonb DEFAULT '[]'::jsonb,
  current_signer_index int DEFAULT 0,
  expires_at timestamptz,
  completed_at timestamptz,
  -- Metadata
  version int NOT NULL DEFAULT 1,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.transaction_documents.document_type IS 'booking_form | offer_agreement | rental_contract | reservation_form | shm | ajb | ppjb | power_of_attorney | other';
COMMENT ON COLUMN public.transaction_documents.status IS 'draft | pending_review | awaiting_signatures | partially_signed | completed | expired | cancelled';
COMMENT ON COLUMN public.transaction_documents.signature_order IS 'JSON array of {user_id, role, order} defining signing sequence';

-- Document Signatures: individual signature records
CREATE TABLE public.document_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.transaction_documents(id) ON DELETE CASCADE,
  signer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signer_role text NOT NULL DEFAULT 'buyer',
  signer_name text,
  signer_email text,
  -- Signature data
  status text NOT NULL DEFAULT 'pending',
  signature_data text,
  signature_image_url text,
  signed_at timestamptz,
  ip_address text,
  user_agent text,
  -- Order in signing flow
  sign_order int NOT NULL DEFAULT 0,
  -- Security
  verification_code text DEFAULT substr(gen_random_uuid()::text, 1, 6),
  verified_at timestamptz,
  -- Metadata
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, signer_id)
);

COMMENT ON COLUMN public.document_signatures.signer_role IS 'buyer | seller | agent | developer | legal_consultant | notary | witness';
COMMENT ON COLUMN public.document_signatures.status IS 'pending | viewed | signed | rejected | expired';

-- Document Audit Trail
CREATE TABLE public.document_audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.transaction_documents(id) ON DELETE CASCADE,
  action text NOT NULL,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performer_name text,
  ip_address text,
  user_agent text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transaction_docs_uploaded_by ON public.transaction_documents(uploaded_by);
CREATE INDEX idx_transaction_docs_property ON public.transaction_documents(property_id);
CREATE INDEX idx_transaction_docs_status ON public.transaction_documents(status);
CREATE INDEX idx_transaction_docs_type ON public.transaction_documents(document_type);
CREATE INDEX idx_doc_signatures_document ON public.document_signatures(document_id);
CREATE INDEX idx_doc_signatures_signer ON public.document_signatures(signer_id);
CREATE INDEX idx_doc_audit_document ON public.document_audit_trail(document_id);

-- RLS
ALTER TABLE public.transaction_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_audit_trail ENABLE ROW LEVEL SECURITY;

-- Users can see documents they uploaded or are signers on
CREATE POLICY "Users can view own documents" ON public.transaction_documents
  FOR SELECT TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR id IN (SELECT document_id FROM public.document_signatures WHERE signer_id = auth.uid())
  );

CREATE POLICY "Users can insert own documents" ON public.transaction_documents
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Uploaders can update own documents" ON public.transaction_documents
  FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid());

-- Signature policies
CREATE POLICY "Signers can view their signatures" ON public.document_signatures
  FOR SELECT TO authenticated
  USING (
    signer_id = auth.uid()
    OR document_id IN (SELECT id FROM public.transaction_documents WHERE uploaded_by = auth.uid())
  );

CREATE POLICY "Document owners can create signature requests" ON public.document_signatures
  FOR INSERT TO authenticated
  WITH CHECK (
    document_id IN (SELECT id FROM public.transaction_documents WHERE uploaded_by = auth.uid())
  );

CREATE POLICY "Signers can update their own signatures" ON public.document_signatures
  FOR UPDATE TO authenticated
  USING (signer_id = auth.uid());

-- Audit trail: readable by document participants
CREATE POLICY "Participants can view audit trail" ON public.document_audit_trail
  FOR SELECT TO authenticated
  USING (
    document_id IN (
      SELECT id FROM public.transaction_documents WHERE uploaded_by = auth.uid()
      UNION
      SELECT document_id FROM public.document_signatures WHERE signer_id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit entries" ON public.document_audit_trail
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Storage bucket for transaction documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('transaction-documents', 'transaction-documents', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: authenticated users can upload to their own folder
CREATE POLICY "Users can upload own docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'transaction-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'transaction-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Also allow signers to read docs shared with them via document_signatures
CREATE POLICY "Signers can read shared docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'transaction-documents'
    AND EXISTS (
      SELECT 1 FROM public.transaction_documents td
      JOIN public.document_signatures ds ON ds.document_id = td.id
      WHERE ds.signer_id = auth.uid()
      AND td.file_url LIKE '%' || name || '%'
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_transaction_document_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transaction_documents_updated
  BEFORE UPDATE ON public.transaction_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_transaction_document_timestamp();

CREATE TRIGGER trg_document_signatures_updated
  BEFORE UPDATE ON public.document_signatures
  FOR EACH ROW EXECUTE FUNCTION public.update_transaction_document_timestamp();
