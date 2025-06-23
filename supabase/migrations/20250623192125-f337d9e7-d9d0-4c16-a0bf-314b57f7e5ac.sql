
-- Create user sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS public.user_device_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_fingerprint TEXT,
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  location_data JSONB DEFAULT '{}',
  login_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_device_sessions_user_id ON public.user_device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_device_sessions_token ON public.user_device_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_device_sessions_active ON public.user_device_sessions(is_active, expires_at);

-- Create login security alerts table
CREATE TABLE IF NOT EXISTS public.user_login_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('new_device', 'suspicious_login', 'multiple_sessions', 'session_expired')),
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  location_data JSONB DEFAULT '{}',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for alerts
CREATE INDEX IF NOT EXISTS idx_user_login_alerts_user_id ON public.user_login_alerts(user_id);

-- Enable RLS
ALTER TABLE public.user_device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_device_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_device_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.user_device_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_device_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.user_device_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_login_alerts
CREATE POLICY "Users can view their own alerts" ON public.user_login_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON public.user_login_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_device_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$;

-- Function to create login alert
CREATE OR REPLACE FUNCTION create_login_alert(
  p_user_id UUID,
  p_alert_type TEXT,
  p_device_info JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_location_data JSONB DEFAULT '{}',
  p_message TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.user_login_alerts (
    user_id, alert_type, device_info, ip_address, location_data, message
  ) VALUES (
    p_user_id, p_alert_type, p_device_info, p_ip_address, p_location_data, p_message
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;
