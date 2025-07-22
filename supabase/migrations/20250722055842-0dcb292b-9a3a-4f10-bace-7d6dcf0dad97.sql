-- Create login attempts tracking table
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID,
  device_fingerprint TEXT,
  location_data JSONB DEFAULT '{}',
  blocked_by_rate_limit BOOLEAN DEFAULT false
);

-- Create account lockouts table
CREATE TABLE IF NOT EXISTS public.account_lockouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_at TIMESTAMP WITH TIME ZONE NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_by_ip INET,
  is_active BOOLEAN NOT NULL DEFAULT true,
  unlocked_by UUID,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user security logs table
CREATE TABLE IF NOT EXISTS public.user_security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  location_data JSONB DEFAULT '{}',
  risk_score INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for login_attempts
CREATE POLICY "Admins can view all login attempts" 
ON public.login_attempts 
FOR SELECT 
TO authenticated 
USING (check_admin_access());

CREATE POLICY "System can manage login attempts" 
ON public.login_attempts 
FOR ALL 
TO authenticated 
USING (true);

-- RLS Policies for account_lockouts
CREATE POLICY "Admins can manage lockouts" 
ON public.account_lockouts 
FOR ALL 
TO authenticated 
USING (check_admin_access());

CREATE POLICY "Users can view their own lockouts" 
ON public.account_lockouts 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- RLS Policies for user_security_logs
CREATE POLICY "Admins can view all security logs" 
ON public.user_security_logs 
FOR SELECT 
TO authenticated 
USING (check_admin_access());

CREATE POLICY "Users can view their own security logs" 
ON public.user_security_logs 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "System can create security logs" 
ON public.user_security_logs 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON public.login_attempts(email, attempt_time DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON public.login_attempts(ip_address, attempt_time DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON public.login_attempts(success, attempt_time DESC);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON public.account_lockouts(email, is_active);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_unlock_time ON public.account_lockouts(unlock_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_security_logs_user_time ON public.user_security_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_risk_score ON public.user_security_logs(risk_score DESC, created_at DESC);

-- Update existing functions to work with new tables (they should already exist)
-- The functions check_ip_rate_limit, check_account_lockout, create_account_lockout, and log_security_event 
-- are already defined and should work with these tables