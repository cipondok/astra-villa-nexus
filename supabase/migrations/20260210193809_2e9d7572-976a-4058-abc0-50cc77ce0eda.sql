
-- Verification system settings per role
CREATE TABLE public.portal_verification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_type TEXT NOT NULL, -- 'user', 'agent', 'property_owner', 'vendor'
  step_order INTEGER NOT NULL DEFAULT 1,
  step_key TEXT NOT NULL, -- 'email_verification', 'phone_verification', 'id_upload', 'selfie', 'address_proof', 'license_upload', 'video_call', 'business_docs'
  step_label TEXT NOT NULL,
  step_description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_required BOOLEAN NOT NULL DEFAULT true,
  auto_approve BOOLEAN NOT NULL DEFAULT false,
  auto_approve_conditions JSONB DEFAULT '{}',
  tier_requirement TEXT DEFAULT 'basic', -- minimum tier needed
  documents_required TEXT[] DEFAULT '{}',
  expiry_days INTEGER DEFAULT NULL, -- how many days before re-verification
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_type, step_key)
);

-- Tier threshold requirements
CREATE TABLE public.portal_tier_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_name TEXT NOT NULL UNIQUE, -- 'verified', 'vip', 'gold', 'platinum', 'diamond'
  min_properties INTEGER DEFAULT 0,
  min_transactions INTEGER DEFAULT 0,
  min_listings INTEGER DEFAULT 0,
  min_rating NUMERIC(3,2) DEFAULT 0,
  min_account_age_days INTEGER DEFAULT 0,
  requires_verification BOOLEAN DEFAULT true,
  requires_subscription BOOLEAN DEFAULT false,
  auto_upgrade BOOLEAN DEFAULT false,
  custom_requirements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portal_verification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_tier_requirements ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can manage verification settings"
  ON public.portal_verification_settings
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage tier requirements"
  ON public.portal_tier_requirements
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow authenticated users to read settings (needed for frontend checks)
CREATE POLICY "Authenticated users can read verification settings"
  ON public.portal_verification_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read tier requirements"
  ON public.portal_tier_requirements
  FOR SELECT
  TO authenticated
  USING (true);

-- Seed default verification steps for each role
INSERT INTO public.portal_verification_settings (role_type, step_order, step_key, step_label, step_description, is_required, auto_approve) VALUES
-- Users
('user', 1, 'email_verification', 'Email Verification', 'Verify email address via confirmation link', true, true),
('user', 2, 'phone_verification', 'Phone Verification', 'Verify phone number via OTP', true, false),
('user', 3, 'id_upload', 'ID Document Upload', 'Upload KTP/Passport for identity verification', true, false),
('user', 4, 'selfie_verification', 'Selfie Verification', 'Take a selfie holding your ID document', false, false),
-- Agents
('agent', 1, 'email_verification', 'Email Verification', 'Verify email address', true, true),
('agent', 2, 'phone_verification', 'Phone Verification', 'Verify phone number via OTP', true, false),
('agent', 3, 'id_upload', 'ID Document Upload', 'Upload KTP/Passport', true, false),
('agent', 4, 'license_upload', 'Agent License Upload', 'Upload valid real estate agent license', true, false),
('agent', 5, 'business_docs', 'Business Documents', 'Upload business registration documents', false, false),
('agent', 6, 'video_call', 'Video Verification Call', 'Complete a live video verification session', false, false),
-- Property Owners
('property_owner', 1, 'email_verification', 'Email Verification', 'Verify email address', true, true),
('property_owner', 2, 'phone_verification', 'Phone Verification', 'Verify phone number via OTP', true, false),
('property_owner', 3, 'id_upload', 'ID Document Upload', 'Upload KTP/Passport', true, false),
('property_owner', 4, 'address_proof', 'Address Proof', 'Upload utility bill or address verification document', true, false),
('property_owner', 5, 'ownership_docs', 'Property Ownership Docs', 'Upload property ownership certificate (SHM/SHGB)', false, false),
-- Vendors
('vendor', 1, 'email_verification', 'Email Verification', 'Verify email address', true, true),
('vendor', 2, 'phone_verification', 'Phone Verification', 'Verify phone number via OTP', true, false),
('vendor', 3, 'id_upload', 'ID Document Upload', 'Upload KTP/Passport', true, false),
('vendor', 4, 'business_docs', 'Business Documents', 'Upload SIUP, NIB, or other business permits', true, false),
('vendor', 5, 'tax_docs', 'Tax Documents', 'Upload NPWP and tax registration', false, false),
('vendor', 6, 'portfolio', 'Portfolio/References', 'Upload work portfolio or client references', false, false);

-- Seed default tier requirements
INSERT INTO public.portal_tier_requirements (tier_name, min_properties, min_transactions, min_listings, min_rating, min_account_age_days, requires_verification, requires_subscription, auto_upgrade) VALUES
('verified', 0, 0, 0, 0, 0, true, false, false),
('vip', 0, 0, 1, 0, 30, true, true, false),
('gold', 5, 3, 5, 3.5, 90, true, true, false),
('platinum', 15, 10, 15, 4.0, 180, true, true, false),
('diamond', 30, 25, 30, 4.5, 365, true, true, false);

-- Update trigger
CREATE TRIGGER update_portal_verification_settings_updated_at
  BEFORE UPDATE ON public.portal_verification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portal_tier_requirements_updated_at
  BEFORE UPDATE ON public.portal_tier_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
