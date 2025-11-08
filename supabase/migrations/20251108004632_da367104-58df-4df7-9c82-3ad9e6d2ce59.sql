-- Create security alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  location_data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX idx_security_alerts_created_at ON public.security_alerts(created_at DESC);
CREATE INDEX idx_security_alerts_is_read ON public.security_alerts(is_read);

-- Enable RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own security alerts"
ON public.security_alerts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.security_alerts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert security alerts"
ON public.security_alerts
FOR INSERT
WITH CHECK (true);

-- Add realtime support
ALTER TABLE public.security_alerts REPLICA IDENTITY FULL;

-- Create function to detect suspicious login patterns
CREATE OR REPLACE FUNCTION public.check_suspicious_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_login_count INTEGER;
  different_locations INTEGER;
  different_devices INTEGER;
BEGIN
  -- Count recent logins in last hour
  SELECT COUNT(*) INTO recent_login_count
  FROM user_login_alerts
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Alert if more than 5 login attempts in an hour
  IF recent_login_count > 5 THEN
    INSERT INTO security_alerts (
      user_id, alert_type, severity, title, description, metadata
    ) VALUES (
      NEW.user_id,
      'multiple_login_attempts',
      'high',
      'Multiple Login Attempts Detected',
      'We detected multiple login attempts from your account in the past hour.',
      jsonb_build_object('login_count', recent_login_count, 'time_window', '1 hour')
    );
  END IF;
  
  -- Check for logins from different locations
  SELECT COUNT(DISTINCT location_data->>'city') INTO different_locations
  FROM user_login_alerts
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours'
    AND location_data->>'city' IS NOT NULL;
  
  IF different_locations > 3 THEN
    INSERT INTO security_alerts (
      user_id, alert_type, severity, title, description, metadata, location_data
    ) VALUES (
      NEW.user_id,
      'unusual_location',
      'medium',
      'Login from Multiple Locations',
      'Your account was accessed from multiple different locations recently.',
      jsonb_build_object('location_count', different_locations),
      NEW.location_data
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for suspicious login detection
DROP TRIGGER IF EXISTS check_suspicious_login_trigger ON user_login_alerts;
CREATE TRIGGER check_suspicious_login_trigger
AFTER INSERT ON user_login_alerts
FOR EACH ROW
EXECUTE FUNCTION check_suspicious_login();