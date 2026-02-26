
-- Create tenant_documents table (if not exists, skip)
CREATE TABLE IF NOT EXISTS public.tenant_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  document_type text NOT NULL DEFAULT 'other',
  file_url text NOT NULL,
  file_name text,
  verification_status text NOT NULL DEFAULT 'pending',
  verified_by uuid,
  verified_at timestamptz,
  rejection_reason text,
  expires_at date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_documents ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then recreate
DROP POLICY IF EXISTS "Tenants can view own documents" ON public.tenant_documents;
DROP POLICY IF EXISTS "Tenants can insert own documents" ON public.tenant_documents;
DROP POLICY IF EXISTS "Owners can view tenant documents" ON public.tenant_documents;
DROP POLICY IF EXISTS "Owners can verify tenant documents" ON public.tenant_documents;

CREATE POLICY "Tenants can view own documents"
  ON public.tenant_documents FOR SELECT TO authenticated
  USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can insert own documents"
  ON public.tenant_documents FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Owners can view tenant documents"
  ON public.tenant_documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = tenant_documents.property_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can verify tenant documents"
  ON public.tenant_documents FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = tenant_documents.property_id AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = tenant_documents.property_id AND p.owner_id = auth.uid()
    )
  );

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-documents', 'tenant-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop if exist)
DROP POLICY IF EXISTS "Tenants can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Tenants can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Owners can view tenant files" ON storage.objects;

CREATE POLICY "Tenants can upload documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tenant-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Tenants can view own files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'tenant-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can view tenant files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'tenant-documents');
