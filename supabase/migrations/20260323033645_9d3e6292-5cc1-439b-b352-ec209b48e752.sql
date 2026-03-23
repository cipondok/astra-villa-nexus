
-- Investor Growth Events (funnel tracking)
CREATE TABLE public.investor_growth_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  funnel_stage TEXT NOT NULL CHECK (funnel_stage IN ('visit','signup','verify','wallet_view','wallet_funded','escrow_started','repeat_investment')),
  source_channel TEXT DEFAULT 'direct',
  campaign_tag TEXT,
  geo_country TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_growth_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read growth events" ON public.investor_growth_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "System inserts growth events" ON public.investor_growth_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_growth_events_user ON public.investor_growth_events(user_id);
CREATE INDEX idx_growth_events_stage ON public.investor_growth_events(funnel_stage);
CREATE INDEX idx_growth_events_created ON public.investor_growth_events(created_at DESC);

-- Investor Growth Actions (nudging automation)
CREATE TABLE public.investor_growth_actions (
  action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('email_nudge','push_prompt','deal_recommendation','wallet_bonus_offer','advisor_call')),
  trigger_reason TEXT,
  action_status TEXT DEFAULT 'pending' CHECK (action_status IN ('pending','sent','clicked','converted','expired')),
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_growth_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage growth actions" ON public.investor_growth_actions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Investor Deal Feed (personalized property recommendations)
CREATE TABLE public.investor_deal_feed (
  feed_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID,
  ranking_score NUMERIC DEFAULT 0,
  recommendation_reason TEXT,
  displayed_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_deal_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own feed" ON public.investor_deal_feed FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System manages feed" ON public.investor_deal_feed FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Growth Experiment Metrics
CREATE TABLE public.growth_experiment_metrics (
  experiment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT NOT NULL,
  experiment_type TEXT DEFAULT 'ab_test',
  variant TEXT DEFAULT 'control',
  impressions INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  revenue_impact NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.growth_experiment_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage experiments" ON public.growth_experiment_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Investor Referrals
CREATE TABLE public.investor_referrals (
  referral_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  referral_reward_type TEXT DEFAULT 'wallet_credit',
  reward_amount NUMERIC DEFAULT 0,
  activation_status TEXT DEFAULT 'pending' CHECK (activation_status IN ('pending','signed_up','verified','wallet_funded','invested','reward_settled')),
  reward_settled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own referrals" ON public.investor_referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);
CREATE POLICY "System manages referrals" ON public.investor_referrals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_referrals_referrer ON public.investor_referrals(referrer_user_id);
