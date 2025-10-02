-- Create OTP codes table
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL, -- 'mfa', 'email_verification', 'password_reset'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT
);

-- Create MFA settings table
CREATE TABLE IF NOT EXISTS public.mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  method TEXT DEFAULT 'email', -- 'email', 'totp', 'sms'
  backup_codes TEXT[], -- Encrypted backup codes
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user verification status table
CREATE TABLE IF NOT EXISTS public.user_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMP WITH TIME ZONE,
  identity_verified BOOLEAN DEFAULT false,
  identity_verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verification ENABLE ROW LEVEL SECURITY;

-- OTP codes policies
CREATE POLICY "Users can view their own OTP codes"
ON public.otp_codes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert OTP codes"
ON public.otp_codes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "System can update OTP codes"
ON public.otp_codes FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- MFA settings policies
CREATE POLICY "Users can view their own MFA settings"
ON public.mfa_settings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own MFA settings"
ON public.mfa_settings FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User verification policies
CREATE POLICY "Users can view their own verification status"
ON public.user_verification FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all verifications"
ON public.user_verification FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create indexes
CREATE INDEX idx_otp_codes_user_id ON public.otp_codes(user_id);
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);
CREATE INDEX idx_otp_codes_is_used ON public.otp_codes(is_used);
CREATE INDEX idx_mfa_settings_user_id ON public.mfa_settings(user_id);
CREATE INDEX idx_user_verification_user_id ON public.user_verification(user_id);

-- Function to clean expired OTP codes
CREATE OR REPLACE FUNCTION clean_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < now() OR is_used = true;
END;
$$;

-- Function to generate random OTP
CREATE OR REPLACE FUNCTION generate_otp()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;