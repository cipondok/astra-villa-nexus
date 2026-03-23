
-- Supply Growth Events: track listing lifecycle & agent productivity
CREATE TABLE public.supply_growth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_id UUID,
  funnel_stage TEXT NOT NULL CHECK (funnel_stage IN ('lead_contacted','listing_started','media_uploaded','verification_pending','listing_live','first_inquiry','escrow_started','sold_or_rented')),
  source_channel TEXT CHECK (source_channel IN ('cold_outreach','referral','inbound','developer_partner','broker_network')),
  city TEXT,
  property_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Listing Quality Signals
CREATE TABLE public.listing_quality_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  image_quality_score NUMERIC DEFAULT 0,
  description_completeness_score NUMERIC DEFAULT 0,
  price_fairness_score NUMERIC DEFAULT 0,
  market_demand_alignment NUMERIC DEFAULT 0,
  verification_status TEXT DEFAULT 'pending',
  quality_score NUMERIC DEFAULT 0,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supply Growth Actions (nudges)
CREATE TABLE public.supply_growth_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('upload_media_prompt','price_adjustment_suggestion','listing_boost_offer','training_invite','territory_expansion_prompt')),
  trigger_reason TEXT,
  action_status TEXT DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supply Zone Metrics
CREATE TABLE public.supply_zone_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  active_listing_count INTEGER DEFAULT 0,
  investor_demand_index NUMERIC DEFAULT 0,
  supply_gap_score NUMERIC DEFAULT 0,
  avg_listing_quality NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seller Conversion Metrics
CREATE TABLE public.seller_conversion_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  view_to_inquiry_rate NUMERIC DEFAULT 0,
  inquiry_to_visit_rate NUMERIC DEFAULT 0,
  visit_to_escrow_rate NUMERIC DEFAULT 0,
  escrow_to_close_rate NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supply Growth Feature Dataset (AI pipeline readiness)
CREATE TABLE public.supply_growth_feature_dataset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  property_type TEXT,
  demand_score NUMERIC DEFAULT 0,
  supply_score NUMERIC DEFAULT 0,
  gap_score NUMERIC DEFAULT 0,
  agent_density NUMERIC DEFAULT 0,
  listing_quality_avg NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supply_growth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_quality_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_growth_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_zone_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_conversion_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_growth_feature_dataset ENABLE ROW LEVEL SECURITY;

-- Admin read policies
CREATE POLICY "Authenticated users can read supply_growth_events" ON public.supply_growth_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read listing_quality_signals" ON public.listing_quality_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read supply_growth_actions" ON public.supply_growth_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read supply_zone_metrics" ON public.supply_zone_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read seller_conversion_metrics" ON public.seller_conversion_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read supply_growth_feature_dataset" ON public.supply_growth_feature_dataset FOR SELECT TO authenticated USING (true);

-- Service role insert policies
CREATE POLICY "Service can insert supply_growth_events" ON public.supply_growth_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert listing_quality_signals" ON public.listing_quality_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert supply_growth_actions" ON public.supply_growth_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert supply_zone_metrics" ON public.supply_zone_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert seller_conversion_metrics" ON public.seller_conversion_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert supply_growth_feature_dataset" ON public.supply_growth_feature_dataset FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_supply_growth_events_agent ON public.supply_growth_events(agent_user_id);
CREATE INDEX idx_supply_growth_events_stage ON public.supply_growth_events(funnel_stage);
CREATE INDEX idx_supply_growth_events_city ON public.supply_growth_events(city);
CREATE INDEX idx_listing_quality_property ON public.listing_quality_signals(property_id);
CREATE INDEX idx_supply_zone_city ON public.supply_zone_metrics(city);
CREATE INDEX idx_seller_conversion_property ON public.seller_conversion_metrics(property_id);
