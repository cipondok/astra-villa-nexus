-- Create login attempt tracking table
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false,
  user_agent TEXT,
  device_fingerprint TEXT,
  geolocation JSONB DEFAULT '{}',
  risk_score INTEGER DEFAULT 0,
  blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON public.login_attempts(ip_address, attempt_time);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON public.login_attempts(email, attempt_time);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_time ON public.login_attempts(user_id, attempt_time);

-- Create account lockout table
CREATE TABLE IF NOT EXISTS public.account_lockouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_at TIMESTAMP WITH TIME ZONE NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_by_ip INET,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for lockout checks
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email_active ON public.account_lockouts(email, is_active);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_unlock_time ON public.account_lockouts(unlock_at, is_active);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for login_attempts
CREATE POLICY "Admins can view all login attempts" ON public.login_attempts
  FOR SELECT USING (check_admin_access());

CREATE POLICY "System can insert login attempts" ON public.login_attempts
  FOR INSERT WITH CHECK (true);

-- RLS policies for account_lockouts
CREATE POLICY "Admins can manage account lockouts" ON public.account_lockouts
  FOR ALL USING (check_admin_access());

CREATE POLICY "Users can view their own lockouts" ON public.account_lockouts
  FOR SELECT USING (auth.uid() = user_id);

-- Function to check if IP is rate limited
CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(p_ip_address INET)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  failed_attempts_count INTEGER;
BEGIN
  -- Count failed attempts from this IP in the last hour
  SELECT COUNT(*) INTO failed_attempts_count
  FROM public.login_attempts
  WHERE ip_address = p_ip_address
    AND success = false
    AND attempt_time > (now() - INTERVAL '1 hour');
  
  -- Return true if rate limit exceeded (5 attempts per hour)
  RETURN failed_attempts_count >= 5;
END;
$$;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION public.check_account_lockout(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_locked BOOLEAN := false;
BEGIN
  -- Check if account has active lockout
  SELECT EXISTS(
    SELECT 1 FROM public.account_lockouts
    WHERE email = p_email
      AND is_active = true
      AND unlock_at > now()
  ) INTO is_locked;
  
  RETURN is_locked;
END;
$$;

-- Function to create account lockout
CREATE OR REPLACE FUNCTION public.create_account_lockout(
  p_email TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_duration_minutes INTEGER DEFAULT 60
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lockout_id UUID;
  failed_count INTEGER;
BEGIN
  -- Count recent failed attempts
  SELECT COUNT(*) INTO failed_count
  FROM public.login_attempts
  WHERE email = p_email
    AND success = false
    AND attempt_time > (now() - INTERVAL '1 hour');
  
  -- Create lockout record
  INSERT INTO public.account_lockouts (
    user_id, email, unlock_at, failed_attempts, locked_by_ip
  ) VALUES (
    p_user_id, p_email, now() + (p_duration_minutes || ' minutes')::INTERVAL, 
    failed_count, p_ip_address
  ) RETURNING id INTO lockout_id;
  
  RETURN lockout_id;
END;
$$;