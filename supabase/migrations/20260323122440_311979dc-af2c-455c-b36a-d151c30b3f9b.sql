
-- Investor Reviews (verified post-deal)
CREATE TABLE public.investor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT NOT NULL,
  investor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_id UUID,
  rating_transaction INTEGER CHECK (rating_transaction BETWEEN 1 AND 5),
  rating_agent INTEGER CHECK (rating_agent BETWEEN 1 AND 5),
  rating_platform INTEGER CHECK (rating_platform BETWEEN 1 AND 5),
  overall_score NUMERIC(2,1),
  review_text TEXT,
  verification_status TEXT DEFAULT 'pending',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.investor_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read published reviews" ON public.investor_reviews FOR SELECT USING (is_published = true OR investor_user_id = auth.uid());
CREATE POLICY "Users create own reviews" ON public.investor_reviews FOR INSERT WITH CHECK (investor_user_id = auth.uid());
CREATE POLICY "Users update own reviews" ON public.investor_reviews FOR UPDATE USING (investor_user_id = auth.uid());

-- Deal Success Highlights (marketing assets)
CREATE TABLE public.deal_success_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID,
  city TEXT,
  investment_return_projection NUMERIC,
  city_growth_context TEXT,
  anonymized_investor_profile JSONB,
  highlight_summary TEXT,
  spotlight_title TEXT,
  campaign_snippet TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.deal_success_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published highlights" ON public.deal_success_highlights FOR SELECT USING (is_published = true);

-- Referral Rewards
CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  new_investor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reward_type TEXT DEFAULT 'wallet_credit',
  reward_amount NUMERIC DEFAULT 0,
  reward_status TEXT DEFAULT 'pending',
  milestone_trigger TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  awarded_at TIMESTAMPTZ
);
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own rewards" ON public.referral_rewards FOR SELECT USING (referrer_user_id = auth.uid());

-- Retention Actions
CREATE TABLE public.retention_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trigger_condition TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_content TEXT,
  scheduled_time TIMESTAMPTZ DEFAULT now(),
  executed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.retention_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own retention" ON public.retention_actions FOR SELECT USING (user_id = auth.uid());

-- Referral Growth Metrics
CREATE TABLE public.referral_growth_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  referral_signup_rate NUMERIC DEFAULT 0,
  referral_funding_rate NUMERIC DEFAULT 0,
  average_referral_ltv NUMERIC DEFAULT 0,
  viral_coefficient NUMERIC DEFAULT 0,
  top_referrers JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.referral_growth_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read metrics" ON public.referral_growth_metrics FOR SELECT TO authenticated USING (true);
