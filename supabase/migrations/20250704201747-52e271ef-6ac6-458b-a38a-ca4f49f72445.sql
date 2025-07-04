-- Create vendor verification status enum
CREATE TYPE vendor_verification_status AS ENUM (
  'unverified',
  'pending_review',
  'documents_submitted',
  'under_verification',
  'verified',
  'rejected',
  'suspended'
);

-- Create Indonesian document types enum
CREATE TYPE indonesian_document_type AS ENUM (
  'ktp',
  'npwp',
  'siup',
  'skdp',
  'skt',
  'iujk',
  'bpjs_ketenagakerjaan',
  'bpjs_kesehatan',
  'akta_notaris',
  'tdp',
  'domisili_usaha',
  'izin_gangguan'
);

-- Create vendor verification documents table
CREATE TABLE IF NOT EXISTS public.vendor_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type indonesian_document_type NOT NULL,
  document_number VARCHAR(100),
  document_url TEXT,
  verification_status VARCHAR(20) DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  expiry_date DATE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vendor KYC status table
CREATE TABLE IF NOT EXISTS public.vendor_kyc_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  verification_level VARCHAR(20) DEFAULT 'basic',
  kyc_status vendor_verification_status DEFAULT 'unverified',
  documents_required JSONB DEFAULT '[]',
  documents_submitted JSONB DEFAULT '[]',
  documents_verified JSONB DEFAULT '[]',
  compliance_score INTEGER DEFAULT 0,
  risk_assessment JSONB DEFAULT '{}',
  verification_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  next_review_date DATE,
  access_level VARCHAR(20) DEFAULT 'limited',
  payment_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vendor access permissions table
CREATE TABLE IF NOT EXISTS public.vendor_access_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type VARCHAR(50) NOT NULL,
  is_granted BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vendor_id, permission_type)
);

-- Enable RLS on all new tables
ALTER TABLE public.vendor_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_kyc_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_access_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor verification documents
CREATE POLICY "Vendors can view their own verification documents"
ON public.vendor_verification_documents FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can upload their own verification documents"
ON public.vendor_verification_documents FOR INSERT
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own verification documents"
ON public.vendor_verification_documents FOR UPDATE
USING (vendor_id = auth.uid());

CREATE POLICY "Admins can manage all verification documents"
ON public.vendor_verification_documents FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for vendor KYC status
CREATE POLICY "Vendors can view their own KYC status"
ON public.vendor_kyc_status FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "Admins can manage all KYC status"
ON public.vendor_kyc_status FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for vendor access permissions
CREATE POLICY "Vendors can view their own access permissions"
ON public.vendor_access_permissions FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "Admins can manage all access permissions"
ON public.vendor_access_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_verification_documents_updated_at
  BEFORE UPDATE ON vendor_verification_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_kyc_status_updated_at
  BEFORE UPDATE ON vendor_kyc_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_access_permissions_updated_at
  BEFORE UPDATE ON vendor_access_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_vendor_verification_documents_vendor_id ON vendor_verification_documents(vendor_id);
CREATE INDEX idx_vendor_verification_documents_type ON vendor_verification_documents(document_type);
CREATE INDEX idx_vendor_verification_documents_status ON vendor_verification_documents(verification_status);
CREATE INDEX idx_vendor_kyc_status_vendor_id ON vendor_kyc_status(vendor_id);
CREATE INDEX idx_vendor_kyc_status_status ON vendor_kyc_status(kyc_status);
CREATE INDEX idx_vendor_access_permissions_vendor_id ON vendor_access_permissions(vendor_id);
CREATE INDEX idx_vendor_access_permissions_type ON vendor_access_permissions(permission_type);