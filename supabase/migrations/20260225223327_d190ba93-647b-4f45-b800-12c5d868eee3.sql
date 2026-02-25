
-- Create tenant_verifications table
CREATE TABLE public.tenant_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL DEFAULT 'identity',
  status TEXT NOT NULL DEFAULT 'pending',
  full_name TEXT NOT NULL,
  id_type TEXT NOT NULL DEFAULT 'ktp',
  id_number TEXT NOT NULL,
  id_document_url TEXT,
  selfie_url TEXT,
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own verifications
CREATE POLICY "Users can view own verifications"
  ON public.tenant_verifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own verifications"
  ON public.tenant_verifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Owners can view verifications for tenants who have bookings on their properties
CREATE POLICY "Owners can view tenant verifications"
  ON public.tenant_verifications FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT rb.customer_id FROM rental_bookings rb
    JOIN properties p ON p.id = rb.property_id
    WHERE p.owner_id = auth.uid()
  ));

-- Owners can update verification status
CREATE POLICY "Owners can update tenant verifications"
  ON public.tenant_verifications FOR UPDATE TO authenticated
  USING (user_id IN (
    SELECT rb.customer_id FROM rental_bookings rb
    JOIN properties p ON p.id = rb.property_id
    WHERE p.owner_id = auth.uid()
  ));

-- Updated_at trigger
CREATE TRIGGER tenant_verifications_updated_at
  BEFORE UPDATE ON public.tenant_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_requests_updated_at();

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);

-- Storage policies
CREATE POLICY "Users can upload own verification docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'verification-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own verification docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'verification-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Owners can view tenant verification docs (for tenants with bookings on their properties)
CREATE POLICY "Owners can view tenant verification docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'verification-docs' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT rb.customer_id FROM rental_bookings rb
      JOIN properties p ON p.id = rb.property_id
      WHERE p.owner_id = auth.uid()
    )
  );
