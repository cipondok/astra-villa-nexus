-- Create error logs table for tracking 404s and other errors
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL DEFAULT '404',
  error_page TEXT NOT NULL,
  user_ip INET,
  user_agent TEXT,
  referrer_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all error logs"
ON public.error_logs
FOR SELECT
USING (check_admin_access());

CREATE POLICY "Anyone can create error logs"
ON public.error_logs
FOR INSERT
WITH CHECK (true);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.error_logs;

-- Create function to log errors
CREATE OR REPLACE FUNCTION public.log_page_error(
  p_error_type TEXT DEFAULT '404',
  p_error_page TEXT DEFAULT '',
  p_user_ip INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.error_logs (
    error_type,
    error_page,
    user_ip,
    user_agent,
    referrer_url,
    user_id,
    metadata
  ) VALUES (
    p_error_type,
    p_error_page,
    p_user_ip,
    p_user_agent,
    p_referrer_url,
    auth.uid(),
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;