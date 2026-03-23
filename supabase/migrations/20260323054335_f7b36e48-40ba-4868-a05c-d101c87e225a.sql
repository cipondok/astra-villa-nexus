
-- Investor Behavior Events (intent tracking)
CREATE TABLE public.investor_behavior_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID,
  event_type TEXT NOT NULL DEFAULT 'listing_view',
  session_duration_seconds INTEGER,
  intent_level TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_behavior_events_user ON public.investor_behavior_events(user_id);
CREATE INDEX idx_behavior_events_property ON public.investor_behavior_events(property_id);

-- Inquiry Followup Actions
CREATE TABLE public.inquiry_followup_actions (
  followup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID,
  action_type TEXT NOT NULL DEFAULT 'reminder',
  trigger_reason TEXT,
  action_status TEXT DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.investor_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_followup_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own behavior events" ON public.investor_behavior_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own behavior events" ON public.investor_behavior_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin read all behavior events" ON public.investor_behavior_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users read own followups" ON public.inquiry_followup_actions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin full access followups" ON public.inquiry_followup_actions FOR ALL TO authenticated USING (true) WITH CHECK (true);
