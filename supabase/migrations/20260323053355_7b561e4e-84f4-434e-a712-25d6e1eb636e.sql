
-- Investor Segment Profiles
CREATE TABLE public.investor_segment_profiles (
  segment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name TEXT NOT NULL,
  motivation_type TEXT NOT NULL,
  typical_budget_min NUMERIC DEFAULT 0,
  typical_budget_max NUMERIC DEFAULT 0,
  preferred_cities TEXT[] DEFAULT '{}',
  risk_tolerance_level TEXT DEFAULT 'moderate',
  messaging_pillars JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Investor Nurture Sequences
CREATE TABLE public.investor_nurture_sequences (
  sequence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES public.investor_segment_profiles(segment_id),
  stage TEXT NOT NULL DEFAULT 'new_signup',
  message_type TEXT NOT NULL DEFAULT 'email',
  message_content TEXT,
  trigger_reason TEXT,
  action_status TEXT DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign Conversion Metrics
CREATE TABLE public.campaign_conversion_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_channel TEXT NOT NULL,
  experiment_type TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  wallet_funded INTEGER DEFAULT 0,
  escrow_initiated INTEGER DEFAULT 0,
  cost_spent NUMERIC DEFAULT 0,
  cost_per_acquisition NUMERIC DEFAULT 0,
  roi_estimate NUMERIC DEFAULT 0,
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Investor Geo Growth Metrics
CREATE TABLE public.investor_geo_growth_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  campaign_source TEXT,
  click_rate NUMERIC DEFAULT 0,
  signup_conversion_rate NUMERIC DEFAULT 0,
  funding_rate NUMERIC DEFAULT 0,
  avg_deposit_amount NUMERIC DEFAULT 0,
  total_investors INTEGER DEFAULT 0,
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.investor_segment_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_nurture_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_conversion_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_geo_growth_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on investor_segment_profiles" ON public.investor_segment_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on investor_nurture_sequences" ON public.investor_nurture_sequences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on campaign_conversion_metrics" ON public.campaign_conversion_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on investor_geo_growth_metrics" ON public.investor_geo_growth_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);
