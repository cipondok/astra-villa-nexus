
-- Add user levels table
CREATE TABLE IF NOT EXISTS public.user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  privileges JSONB DEFAULT '{}',
  max_properties INTEGER DEFAULT 10,
  max_listings INTEGER DEFAULT 5,
  can_feature_listings BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default user levels
INSERT INTO public.user_levels (name, description, privileges, max_properties, max_listings, can_feature_listings, priority_support)
VALUES 
  ('Basic', 'Basic user level with limited features', '{"basic_access": true}', 5, 2, false, false),
  ('Premium', 'Premium user level with enhanced features', '{"basic_access": true, "premium_features": true}', 20, 10, true, false),
  ('VIP', 'VIP user level with all features', '{"basic_access": true, "premium_features": true, "vip_features": true}', 100, 50, true, true)
ON CONFLICT (name) DO NOTHING;

-- Add user_level_id to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_level_id UUID REFERENCES public.user_levels(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_by UUID;

-- Create user security logs table for IP and device tracking
CREATE TABLE IF NOT EXISTS public.user_security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'failed_login', 'suspicious_activity'
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  location_data JSONB,
  risk_score INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user sessions tracking table
CREATE TABLE IF NOT EXISTS public.user_session_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_session_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_levels (admin only)
CREATE POLICY "Admin can manage user levels" ON public.user_levels
  FOR ALL USING (check_admin_access());

-- RLS Policies for user_security_logs (admin only)
CREATE POLICY "Admin can view security logs" ON public.user_security_logs
  FOR SELECT USING (check_admin_access());

CREATE POLICY "System can insert security logs" ON public.user_security_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_session_tracking (admin only for viewing all, users can view own)
CREATE POLICY "Admin can view all sessions" ON public.user_session_tracking
  FOR SELECT USING (check_admin_access());

CREATE POLICY "Users can view own sessions" ON public.user_session_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions" ON public.user_session_tracking
  FOR ALL WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_fingerprint TEXT DEFAULT NULL,
  p_location_data JSONB DEFAULT NULL,
  p_risk_score INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.user_security_logs (
    user_id, event_type, ip_address, user_agent, device_fingerprint, 
    location_data, risk_score, is_flagged
  )
  VALUES (
    p_user_id, p_event_type, p_ip_address, p_user_agent, p_device_fingerprint,
    p_location_data, p_risk_score, p_risk_score > 70
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Update trigger for updated_at
CREATE OR REPLACE TRIGGER update_user_levels_updated_at
  BEFORE UPDATE ON public.user_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
