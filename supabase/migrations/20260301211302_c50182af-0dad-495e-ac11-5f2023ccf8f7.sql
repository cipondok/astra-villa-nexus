-- Create ai_usage_logs table for tracking AI generation usage
CREATE TABLE public.ai_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own ai usage logs"
  ON public.ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert own ai usage logs"
  ON public.ai_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for monthly usage lookups
CREATE INDEX idx_ai_usage_logs_user_month ON public.ai_usage_logs (user_id, created_at DESC);