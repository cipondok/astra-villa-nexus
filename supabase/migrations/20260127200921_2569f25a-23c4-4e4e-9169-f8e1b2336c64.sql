-- Enhanced KYC Verification table
CREATE TABLE public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('basic', 'standard', 'enhanced')),
  
  -- Document details
  document_type TEXT CHECK (document_type IN ('ktp', 'passport', 'sim', 'kitas')),
  document_number TEXT,
  document_expiry DATE,
  document_image_url TEXT,
  
  -- Selfie/Liveness
  selfie_image_url TEXT,
  liveness_score NUMERIC CHECK (liveness_score >= 0 AND liveness_score <= 100),
  liveness_passed BOOLEAN DEFAULT false,
  
  -- Face matching
  face_match_score NUMERIC CHECK (face_match_score >= 0 AND face_match_score <= 100),
  face_match_passed BOOLEAN DEFAULT false,
  
  -- OCR extracted data
  extracted_data JSONB DEFAULT '{}'::jsonb,
  
  -- Verification status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'rejected', 'expired', 'manual_review')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- API response
  provider TEXT DEFAULT 'internal',
  provider_reference_id TEXT,
  provider_response JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '1 year'),
  
  -- Ensure one active verification per user per type
  CONSTRAINT unique_active_verification UNIQUE (user_id, verification_type, status)
);

-- Enable RLS
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verifications
CREATE POLICY "Users can view own KYC verifications" 
ON public.kyc_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own verifications
CREATE POLICY "Users can create own KYC verifications" 
ON public.kyc_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Only admins can update verifications (via RPC)
CREATE POLICY "Service role can update verifications" 
ON public.kyc_verifications 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = reviewed_by);

-- Create indexes
CREATE INDEX idx_kyc_user_id ON public.kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON public.kyc_verifications(status);
CREATE INDEX idx_kyc_created_at ON public.kyc_verifications(created_at DESC);

-- Update trigger
CREATE TRIGGER update_kyc_verifications_updated_at
BEFORE UPDATE ON public.kyc_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get user's KYC level
CREATE OR REPLACE FUNCTION public.get_user_kyc_level(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_level TEXT := 'none';
BEGIN
  SELECT verification_type INTO v_level
  FROM public.kyc_verifications
  WHERE user_id = p_user_id 
    AND status = 'verified'
  ORDER BY 
    CASE verification_type 
      WHEN 'enhanced' THEN 3 
      WHEN 'standard' THEN 2 
      WHEN 'basic' THEN 1 
    END DESC
  LIMIT 1;
  
  RETURN COALESCE(v_level, 'none');
END;
$$;