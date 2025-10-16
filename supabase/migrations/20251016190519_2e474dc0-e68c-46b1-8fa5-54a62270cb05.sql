-- Create error_logs table for capturing all application errors
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_page TEXT NOT NULL,
  user_id UUID,
  user_email TEXT,
  page_url TEXT,
  user_agent TEXT,
  component_name TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'new',
  metadata JSONB DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Admin can see all errors
CREATE POLICY "Admins can view all error logs"
  ON public.error_logs
  FOR SELECT
  USING (check_admin_access());

-- Admin can update error status
CREATE POLICY "Admins can update error logs"
  ON public.error_logs
  FOR UPDATE
  USING (check_admin_access());

-- System can insert errors (anyone can log errors for monitoring)
CREATE POLICY "System can insert error logs"
  ON public.error_logs
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_status ON public.error_logs(status);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);