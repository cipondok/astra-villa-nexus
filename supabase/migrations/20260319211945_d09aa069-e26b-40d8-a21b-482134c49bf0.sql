
-- =============================================
-- AUTONOMOUS VENDOR REVENUE FLYWHEEL ENGINE
-- Extends vendor_intelligence_scores, vendor_leads_pipeline
-- =============================================

-- 1. Vendor Revenue Metrics (AI-computed revenue intelligence)
CREATE TABLE IF NOT EXISTS public.vendor_revenue_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendor_business_profiles(id) ON DELETE CASCADE,
  revenue_potential_score integer DEFAULT 0 CHECK (revenue_potential_score BETWEEN 0 AND 100),
  vendor_roi_score integer DEFAULT 0 CHECK (vendor_roi_score BETWEEN 0 AND 100),
  premium_upgrade_propensity integer DEFAULT 0 CHECK (premium_upgrade_propensity BETWEEN 0 AND 100),
  district_growth_capture_score integer DEFAULT 0 CHECK (district_growth_capture_score BETWEEN 0 AND 100),
  total_platform_revenue numeric DEFAULT 0,
  total_leads_value numeric DEFAULT 0,
  lead_to_deal_ratio numeric DEFAULT 0,
  capacity_utilization_pct numeric DEFAULT 0,
  avg_deal_value numeric DEFAULT 0,
  monthly_revenue_trend jsonb DEFAULT '[]',
  scoring_inputs jsonb DEFAULT '{}',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (vendor_id)
);

ALTER TABLE public.vendor_revenue_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors read own revenue metrics"
ON public.vendor_revenue_metrics FOR SELECT TO authenticated
USING (vendor_id IN (SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()));

CREATE POLICY "Service role manages revenue metrics"
ON public.vendor_revenue_metrics FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_vrm_revenue ON public.vendor_revenue_metrics (revenue_potential_score DESC);
CREATE INDEX idx_vrm_upgrade ON public.vendor_revenue_metrics (premium_upgrade_propensity DESC);

-- 2. Vendor Premium Slots (monetization inventory)
CREATE TABLE IF NOT EXISTS public.vendor_premium_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendor_business_profiles(id) ON DELETE CASCADE,
  slot_type text NOT NULL CHECK (slot_type IN (
    'featured_listing', 'sponsored_search', 'priority_lead_routing',
    'district_spotlight', 'category_champion', 'homepage_banner'
  )),
  district text,
  segment_type text,
  service_category text,
  status text DEFAULT 'available' CHECK (status IN ('available', 'active', 'expired', 'cancelled')),
  price_monthly numeric NOT NULL DEFAULT 0,
  discount_pct numeric DEFAULT 0,
  activated_at timestamptz,
  expires_at timestamptz,
  auto_renew boolean DEFAULT false,
  performance_impressions integer DEFAULT 0,
  performance_clicks integer DEFAULT 0,
  performance_leads integer DEFAULT 0,
  performance_conversions integer DEFAULT 0,
  roi_multiplier numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.vendor_premium_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors read own premium slots"
ON public.vendor_premium_slots FOR SELECT TO authenticated
USING (vendor_id IN (SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()));

CREATE POLICY "Service role manages premium slots"
ON public.vendor_premium_slots FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_vps_active ON public.vendor_premium_slots (status, slot_type) WHERE status = 'active';
CREATE INDEX idx_vps_district ON public.vendor_premium_slots (district, slot_type) WHERE status = 'active';

-- 3. Vendor Upgrade Recommendations (AI upsell funnel)
CREATE TABLE IF NOT EXISTS public.vendor_upgrade_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendor_business_profiles(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN (
    'premium_listing', 'featured_boost', 'sponsored_routing',
    'subscription_upgrade', 'capacity_expansion', 'district_expansion'
  )),
  trigger_reason text NOT NULL,
  trigger_metrics jsonb DEFAULT '{}',
  recommended_slot_type text,
  recommended_district text,
  estimated_roi_multiplier numeric DEFAULT 0,
  estimated_additional_leads integer DEFAULT 0,
  priority_score integer DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'presented', 'accepted', 'declined', 'expired')),
  presented_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.vendor_upgrade_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors read own upgrade recs"
ON public.vendor_upgrade_recommendations FOR SELECT TO authenticated
USING (vendor_id IN (SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()));

CREATE POLICY "Vendors update own recs"
ON public.vendor_upgrade_recommendations FOR UPDATE TO authenticated
USING (vendor_id IN (SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()))
WITH CHECK (vendor_id IN (SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()));

CREATE POLICY "Service role manages upgrade recs"
ON public.vendor_upgrade_recommendations FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_vur_vendor_pending ON public.vendor_upgrade_recommendations (vendor_id, status) WHERE status = 'pending';
CREATE INDEX idx_vur_priority ON public.vendor_upgrade_recommendations (priority_score DESC);

-- 4. Vendor Market Share Tracking
CREATE TABLE IF NOT EXISTS public.vendor_market_share (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendor_business_profiles(id) ON DELETE CASCADE,
  district text NOT NULL,
  service_category text NOT NULL,
  period_month text NOT NULL,
  total_district_leads integer DEFAULT 0,
  vendor_leads_captured integer DEFAULT 0,
  market_share_pct numeric DEFAULT 0,
  lead_win_rate numeric DEFAULT 0,
  avg_time_to_close_days numeric DEFAULT 0,
  pricing_competitiveness_score integer DEFAULT 0 CHECK (pricing_competitiveness_score BETWEEN 0 AND 100),
  competitor_count integer DEFAULT 0,
  rank_in_district integer,
  insight_narrative text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (vendor_id, district, service_category, period_month)
);

ALTER TABLE public.vendor_market_share ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors read own market share"
ON public.vendor_market_share FOR SELECT TO authenticated
USING (vendor_id IN (SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()));

CREATE POLICY "Service role manages market share"
ON public.vendor_market_share FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_vms_district ON public.vendor_market_share (district, service_category, period_month);
CREATE INDEX idx_vms_share ON public.vendor_market_share (market_share_pct DESC);

-- 5. Vendor Campaign Performance
CREATE TABLE IF NOT EXISTS public.vendor_campaign_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendor_business_profiles(id) ON DELETE CASCADE,
  campaign_type text NOT NULL CHECK (campaign_type IN (
    'premium_slot', 'sponsored_search', 'lead_boost',
    'district_expansion', 'onboarding', 'seasonal_promo'
  )),
  campaign_name text NOT NULL,
  district text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  budget numeric DEFAULT 0,
  spend numeric DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  leads_generated integer DEFAULT 0,
  conversions integer DEFAULT 0,
  revenue_generated numeric DEFAULT 0,
  roi numeric DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.vendor_campaign_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors read own campaigns"
ON public.vendor_campaign_performance FOR SELECT TO authenticated
USING (vendor_id IN (SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()));

CREATE POLICY "Service role manages campaigns"
ON public.vendor_campaign_performance FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- 6. Trigger: auto-generate upsell recommendation on high vendor scores
CREATE OR REPLACE FUNCTION public.trigger_vendor_upsell_on_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only when composite score jumps above 70
  IF NEW.composite_rank_score >= 70 AND (OLD IS NULL OR OLD.composite_rank_score < 70) THEN
    INSERT INTO vendor_upgrade_recommendations (
      vendor_id, recommendation_type, trigger_reason, trigger_metrics,
      recommended_slot_type, priority_score
    ) VALUES (
      NEW.vendor_id,
      'premium_listing',
      'High composite intelligence score detected',
      jsonb_build_object(
        'composite_rank', NEW.composite_rank_score,
        'demand_score', NEW.demand_score,
        'performance_score', NEW.performance_score
      ),
      'featured_listing',
      LEAST(NEW.composite_rank_score, 100)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- High demand score → sponsored routing
  IF NEW.demand_score >= 75 AND (OLD IS NULL OR OLD.demand_score < 75) THEN
    INSERT INTO vendor_upgrade_recommendations (
      vendor_id, recommendation_type, trigger_reason, trigger_metrics,
      recommended_slot_type, priority_score
    ) VALUES (
      NEW.vendor_id,
      'sponsored_routing',
      'Operating in high-demand district',
      jsonb_build_object(
        'demand_score', NEW.demand_score,
        'district_signals', NEW.district_demand_signals
      ),
      'priority_lead_routing',
      LEAST(NEW.demand_score, 100)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vendor_upsell_on_score
AFTER INSERT OR UPDATE OF composite_rank_score, demand_score ON public.vendor_intelligence_scores
FOR EACH ROW EXECUTE FUNCTION public.trigger_vendor_upsell_on_score();
