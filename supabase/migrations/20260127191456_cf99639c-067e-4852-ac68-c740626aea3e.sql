-- Create enum for verification levels
CREATE TYPE public.verification_level AS ENUM ('basic', 'enhanced', 'professional', 'premium');

-- Create enum for badge tiers
CREATE TYPE public.badge_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');

-- Create user verification status table
CREATE TABLE public.user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_level verification_level DEFAULT 'basic',
  badge_tier badge_tier DEFAULT 'bronze',
  
  -- Level 1: Basic
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  basic_completed_at TIMESTAMPTZ,
  
  -- Level 2: Enhanced
  social_media_linked JSONB DEFAULT '[]'::jsonb,
  id_document_uploaded BOOLEAN DEFAULT false,
  id_document_verified BOOLEAN DEFAULT false,
  enhanced_completed_at TIMESTAMPTZ,
  
  -- Level 3: Professional
  license_number TEXT,
  license_verified BOOLEAN DEFAULT false,
  bank_details_added BOOLEAN DEFAULT false,
  bank_details_verified BOOLEAN DEFAULT false,
  professional_completed_at TIMESTAMPTZ,
  
  -- Level 4: Premium
  video_verification_completed BOOLEAN DEFAULT false,
  video_verification_url TEXT,
  references_count INTEGER DEFAULT 0,
  references_verified INTEGER DEFAULT 0,
  premium_completed_at TIMESTAMPTZ,
  
  -- Trust score (calculated)
  trust_score INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create verification documents table
CREATE TABLE public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'id_card', 'license', 'bank_statement', 'reference_letter'
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create verification references table
CREATE TABLE public.verification_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reference_name TEXT NOT NULL,
  reference_email TEXT NOT NULL,
  reference_phone TEXT,
  relationship TEXT NOT NULL, -- 'colleague', 'client', 'employer', 'business_partner'
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'verified', 'rejected'
  verification_code TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_references ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_verifications
CREATE POLICY "Users can view their own verification status"
ON public.user_verifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification"
ON public.user_verifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification"
ON public.user_verifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Public read for badge display (only shows level and badge, not sensitive data)
CREATE POLICY "Anyone can view public verification badges"
ON public.user_verifications FOR SELECT
TO anon
USING (true);

-- RLS Policies for verification_documents
CREATE POLICY "Users can view their own documents"
ON public.verification_documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents"
ON public.verification_documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Block anonymous access to documents"
ON public.verification_documents FOR SELECT
TO anon
USING (false);

-- RLS Policies for verification_references
CREATE POLICY "Users can view their own references"
ON public.verification_references FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own references"
ON public.verification_references FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Block anonymous access to references"
ON public.verification_references FOR SELECT
TO anon
USING (false);

-- Function to calculate trust score and update badge
CREATE OR REPLACE FUNCTION public.calculate_trust_score()
RETURNS TRIGGER AS $$
DECLARE
  new_score INTEGER := 0;
  new_level verification_level := 'basic';
  new_badge badge_tier := 'bronze';
BEGIN
  -- Level 1 points (max 25)
  IF NEW.email_verified THEN new_score := new_score + 10; END IF;
  IF NEW.phone_verified THEN new_score := new_score + 15; END IF;
  
  -- Level 2 points (max 25)
  IF jsonb_array_length(NEW.social_media_linked) > 0 THEN 
    new_score := new_score + (jsonb_array_length(NEW.social_media_linked) * 5);
  END IF;
  IF NEW.id_document_verified THEN new_score := new_score + 15; END IF;
  
  -- Level 3 points (max 25)
  IF NEW.license_verified THEN new_score := new_score + 15; END IF;
  IF NEW.bank_details_verified THEN new_score := new_score + 10; END IF;
  
  -- Level 4 points (max 25)
  IF NEW.video_verification_completed THEN new_score := new_score + 15; END IF;
  IF NEW.references_verified >= 2 THEN new_score := new_score + 10; END IF;
  
  -- Cap at 100
  IF new_score > 100 THEN new_score := 100; END IF;
  
  -- Determine level
  IF NEW.video_verification_completed AND NEW.references_verified >= 2 THEN
    new_level := 'premium';
  ELSIF NEW.license_verified OR NEW.bank_details_verified THEN
    new_level := 'professional';
  ELSIF NEW.id_document_verified OR jsonb_array_length(NEW.social_media_linked) > 0 THEN
    new_level := 'enhanced';
  ELSE
    new_level := 'basic';
  END IF;
  
  -- Determine badge tier
  IF new_score >= 90 THEN
    new_badge := 'diamond';
  ELSIF new_score >= 75 THEN
    new_badge := 'platinum';
  ELSIF new_score >= 50 THEN
    new_badge := 'gold';
  ELSIF new_score >= 25 THEN
    new_badge := 'silver';
  ELSE
    new_badge := 'bronze';
  END IF;
  
  NEW.trust_score := new_score;
  NEW.current_level := new_level;
  NEW.badge_tier := new_badge;
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER update_trust_score
BEFORE INSERT OR UPDATE ON public.user_verifications
FOR EACH ROW
EXECUTE FUNCTION public.calculate_trust_score();

-- Create indexes
CREATE INDEX idx_user_verifications_user_id ON public.user_verifications(user_id);
CREATE INDEX idx_user_verifications_badge ON public.user_verifications(badge_tier);
CREATE INDEX idx_verification_documents_user_id ON public.verification_documents(user_id);
CREATE INDEX idx_verification_references_user_id ON public.verification_references(user_id);