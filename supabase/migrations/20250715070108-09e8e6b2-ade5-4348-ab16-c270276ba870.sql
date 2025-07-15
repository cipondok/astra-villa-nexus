-- Create vendor document verifications table
CREATE TABLE public.vendor_document_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('ktp', 'npwp', 'siup', 'niu', 'skk', 'siuk')),
  document_number TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
  verification_details JSONB,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, document_type)
);

-- Enable Row Level Security
ALTER TABLE public.vendor_document_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor document verifications
CREATE POLICY "Vendors can view their own document verifications" 
ON public.vendor_document_verifications 
FOR SELECT 
USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own document verifications" 
ON public.vendor_document_verifications 
FOR INSERT 
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Admins can manage all document verifications" 
ON public.vendor_document_verifications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can manage document verifications" 
ON public.vendor_document_verifications 
FOR ALL 
USING (true);

-- Add columns to vendor_business_profiles for document verification status
ALTER TABLE public.vendor_business_profiles 
ADD COLUMN IF NOT EXISTS ktp_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS npwp_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS siup_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS niu_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS skk_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS siuk_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bpjs_verification_complete BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX idx_vendor_document_verifications_vendor_id ON public.vendor_document_verifications(vendor_id);
CREATE INDEX idx_vendor_document_verifications_type ON public.vendor_document_verifications(document_type);
CREATE INDEX idx_vendor_document_verifications_status ON public.vendor_document_verifications(verification_status);

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_document_verifications_updated_at 
BEFORE UPDATE ON public.vendor_document_verifications 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();