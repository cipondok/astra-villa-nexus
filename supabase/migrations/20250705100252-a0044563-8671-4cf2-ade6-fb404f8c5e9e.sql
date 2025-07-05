-- Create vendor KYC verification table
CREATE TABLE public.vendor_kyc_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ktp_number TEXT,
  mobile_number TEXT,
  whatsapp_number TEXT,
  ktp_image_url TEXT,
  face_verification_url TEXT,
  mobile_verified_at TIMESTAMPTZ,
  ktp_verified_at TIMESTAMPTZ,
  face_verified_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  overall_status TEXT DEFAULT 'pending' CHECK (overall_status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_kyc_verification ENABLE ROW LEVEL SECURITY;

-- Vendors can manage their own KYC
CREATE POLICY "Vendors can manage their KYC" ON public.vendor_kyc_verification
FOR ALL
USING (auth.uid() = vendor_id);

-- Admins can manage all KYC
CREATE POLICY "Admins can manage all KYC" ON public.vendor_kyc_verification
FOR ALL
USING (check_admin_access());

-- Create vendor earnings table
CREATE TABLE public.vendor_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  commission_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'IDR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed')),
  payout_method TEXT DEFAULT 'bank_transfer',
  bank_details JSONB DEFAULT '{}',
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for earnings
ALTER TABLE public.vendor_earnings ENABLE ROW LEVEL SECURITY;

-- Vendors can view their earnings
CREATE POLICY "Vendors can view their earnings" ON public.vendor_earnings
FOR SELECT
USING (auth.uid() = vendor_id);

-- Admins can manage all earnings
CREATE POLICY "Admins can manage earnings" ON public.vendor_earnings
FOR ALL
USING (check_admin_access());

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- KYC documents storage policies
CREATE POLICY "Vendors can upload their KYC documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'kyc-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vendors can view their KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'kyc-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage KYC documents" ON storage.objects
FOR ALL USING (
  bucket_id = 'kyc-documents' AND check_admin_access()
);

-- Add triggers for updated_at
CREATE TRIGGER update_vendor_kyc_verification_updated_at
  BEFORE UPDATE ON public.vendor_kyc_verification
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_earnings_updated_at
  BEFORE UPDATE ON public.vendor_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();