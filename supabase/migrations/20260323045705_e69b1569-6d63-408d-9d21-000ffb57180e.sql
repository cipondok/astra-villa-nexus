
-- Wallet Funding Funnel Events
CREATE TABLE IF NOT EXISTS public.wallet_funding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stage text NOT NULL CHECK (stage IN ('wallet_viewed','funding_cta_clicked','payment_session_started','payment_completed','funding_failed')),
  device_type text,
  geo_country text,
  amount numeric,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_funding_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own funding events" ON public.wallet_funding_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own funding events" ON public.wallet_funding_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access funding events" ON public.wallet_funding_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_funding_events_user ON public.wallet_funding_events(user_id, created_at DESC);
CREATE INDEX idx_funding_events_stage ON public.wallet_funding_events(stage, created_at DESC);

-- Funding Nudge Actions
CREATE TABLE IF NOT EXISTS public.funding_nudge_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trigger_condition text NOT NULL,
  nudge_type text NOT NULL CHECK (nudge_type IN ('email_prompt','dashboard_alert','limited_offer','advisor_message','retry_reminder')),
  action_status text NOT NULL DEFAULT 'pending' CHECK (action_status IN ('pending','sent','dismissed','converted')),
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.funding_nudge_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own nudges" ON public.funding_nudge_actions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role full access nudges" ON public.funding_nudge_actions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Funding Experiment Metrics
CREATE TABLE IF NOT EXISTS public.funding_experiment_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name text NOT NULL,
  variant text NOT NULL DEFAULT 'control',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  converted boolean DEFAULT false,
  funding_amount numeric,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.funding_experiment_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages experiments" ON public.funding_experiment_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users view own experiments" ON public.funding_experiment_metrics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
