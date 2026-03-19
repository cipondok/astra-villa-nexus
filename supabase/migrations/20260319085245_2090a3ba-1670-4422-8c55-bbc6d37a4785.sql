
-- Behavioral events table for tracking user interactions
-- (views, clicks, saves, shares, dismissals) separately from AI signals
CREATE TABLE public.behavioral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_behavioral_events_user ON public.behavioral_events (user_id, created_at DESC);
CREATE INDEX idx_behavioral_events_property ON public.behavioral_events (property_id, event_type);
CREATE INDEX idx_behavioral_events_type_time ON public.behavioral_events (event_type, created_at DESC);

-- RLS
ALTER TABLE public.behavioral_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own events"
  ON public.behavioral_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own events
CREATE POLICY "Users can read own events"
  ON public.behavioral_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service role / admin can read all (via security definer functions)
