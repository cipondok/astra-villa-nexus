-- Behavior events table for conversion analytics
CREATE TABLE public.behavior_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL,
  element_id TEXT,
  flow_name TEXT,
  flow_step INTEGER,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.behavior_events ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert events
CREATE POLICY "Anyone can create behavior events"
ON public.behavior_events
FOR INSERT
WITH CHECK (true);

-- Users can view their own events
CREATE POLICY "Users can view own events"
ON public.behavior_events
FOR SELECT
USING (auth.uid() = user_id);

-- Admin analytics via security definer functions
CREATE OR REPLACE FUNCTION public.get_conversion_funnel(
  p_flow_name TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  flow_step INTEGER,
  event_type TEXT,
  total_events BIGINT,
  unique_sessions BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    be.flow_step,
    be.event_type,
    COUNT(*) as total_events,
    COUNT(DISTINCT be.session_id) as unique_sessions
  FROM public.behavior_events be
  WHERE be.flow_name = p_flow_name
    AND be.created_at > now() - (p_days || ' days')::interval
  GROUP BY be.flow_step, be.event_type
  ORDER BY be.flow_step, be.event_type;
$$;

CREATE OR REPLACE FUNCTION public.get_dropoff_rates(p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  flow_name TEXT,
  started BIGINT,
  completed BIGINT,
  abandoned BIGINT,
  completion_rate NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    be.flow_name,
    COUNT(DISTINCT CASE WHEN be.event_type = 'flow_start' THEN be.session_id END) as started,
    COUNT(DISTINCT CASE WHEN be.event_type = 'flow_complete' THEN be.session_id END) as completed,
    COUNT(DISTINCT CASE WHEN be.event_type = 'flow_abandon' THEN be.session_id END) as abandoned,
    CASE
      WHEN COUNT(DISTINCT CASE WHEN be.event_type = 'flow_start' THEN be.session_id END) > 0
      THEN ROUND(
        COUNT(DISTINCT CASE WHEN be.event_type = 'flow_complete' THEN be.session_id END)::numeric /
        COUNT(DISTINCT CASE WHEN be.event_type = 'flow_start' THEN be.session_id END)::numeric * 100, 1
      )
      ELSE 0
    END as completion_rate
  FROM public.behavior_events be
  WHERE be.flow_name IS NOT NULL
    AND be.created_at > now() - (p_days || ' days')::interval
  GROUP BY be.flow_name;
$$;

CREATE OR REPLACE FUNCTION public.get_cta_performance(p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  element_id TEXT,
  page_path TEXT,
  click_count BIGINT,
  unique_clickers BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    be.element_id,
    be.page_path,
    COUNT(*) as click_count,
    COUNT(DISTINCT be.session_id) as unique_clickers
  FROM public.behavior_events be
  WHERE be.event_type = 'cta_click'
    AND be.element_id IS NOT NULL
    AND be.created_at > now() - (p_days || ' days')::interval
  GROUP BY be.element_id, be.page_path
  ORDER BY click_count DESC
  LIMIT 50;
$$;

-- Indexes for query performance
CREATE INDEX idx_bevents_session ON public.behavior_events(session_id);
CREATE INDEX idx_bevents_flow ON public.behavior_events(flow_name, event_type);
CREATE INDEX idx_bevents_created ON public.behavior_events(created_at DESC);
CREATE INDEX idx_bevents_type ON public.behavior_events(event_type);
CREATE INDEX idx_bevents_user ON public.behavior_events(user_id) WHERE user_id IS NOT NULL;