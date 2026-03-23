
-- Signup Conversion Events
CREATE TABLE public.signup_conversion_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trigger_source TEXT NOT NULL DEFAULT 'direct',
  device_type TEXT DEFAULT 'desktop',
  geo_region TEXT,
  signup_success_flag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Signup AB Test Metrics
CREATE TABLE public.signup_ab_test_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT 'control',
  impressions INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  avg_time_to_signup_seconds INTEGER,
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.signup_conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signup_ab_test_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own signup events" ON public.signup_conversion_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anon can insert signup events" ON public.signup_conversion_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin read signup events" ON public.signup_conversion_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin full access on signup_ab_test_metrics" ON public.signup_ab_test_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);
