
-- ═══════════════════════════════════════════════════════════
-- MARKET CAPTURE BLITZKRIEG MODEL (MCBM)
-- ═══════════════════════════════════════════════════════════

-- 1️⃣ District Domination Sequencer
CREATE TABLE public.mcbm_district_domination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  country TEXT NOT NULL DEFAULT 'Indonesia',
  liquidity_acceleration NUMERIC DEFAULT 0,
  inquiry_velocity NUMERIC DEFAULT 0,
  supply_gap_persistence NUMERIC DEFAULT 0,
  price_inefficiency_score NUMERIC DEFAULT 0,
  domination_score NUMERIC DEFAULT 0,
  capture_priority TEXT DEFAULT 'MONITOR' CHECK (capture_priority IN ('BLITZ','ACCELERATE','MONITOR','HOLD')),
  recommended_action TEXT,
  active_listings INTEGER DEFAULT 0,
  competitor_weakness_score NUMERIC DEFAULT 0,
  scoring_inputs JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mcbm_district_domination ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read mcbm_district_domination" ON public.mcbm_district_domination FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_mcbm_dd_score ON public.mcbm_district_domination(domination_score DESC);
CREATE INDEX idx_mcbm_dd_priority ON public.mcbm_district_domination(capture_priority);

-- 2️⃣ Supply Flood Strategy
CREATE TABLE public.mcbm_supply_flood (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  segment_type TEXT,
  current_supply INTEGER DEFAULT 0,
  demand_signals INTEGER DEFAULT 0,
  supply_deficit_ratio NUMERIC DEFAULT 0,
  vendor_onboarding_target INTEGER DEFAULT 0,
  vendors_onboarded INTEGER DEFAULT 0,
  onboarding_velocity NUMERIC DEFAULT 0,
  visibility_incentive_active BOOLEAN DEFAULT false,
  marketplace_depth_score NUMERIC DEFAULT 0,
  campaign_status TEXT DEFAULT 'PLANNING' CHECK (campaign_status IN ('PLANNING','ACTIVE','SCALING','SATURATED')),
  campaign_metrics JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mcbm_supply_flood ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read mcbm_supply_flood" ON public.mcbm_supply_flood FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_mcbm_sf_deficit ON public.mcbm_supply_flood(supply_deficit_ratio DESC);

-- 3️⃣ Investor Demand Surge Trigger
CREATE TABLE public.mcbm_demand_surge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  scarcity_signal_active BOOLEAN DEFAULT false,
  absorption_rate NUMERIC DEFAULT 0,
  urgency_score NUMERIC DEFAULT 0,
  active_viewing_flow INTEGER DEFAULT 0,
  passive_to_active_conversion NUMERIC DEFAULT 0,
  outbound_engagement_sent INTEGER DEFAULT 0,
  outbound_response_rate NUMERIC DEFAULT 0,
  deal_opportunity_count INTEGER DEFAULT 0,
  surge_status TEXT DEFAULT 'DORMANT' CHECK (surge_status IN ('DORMANT','WARMING','SURGING','PEAK')),
  trigger_metrics JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mcbm_demand_surge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read mcbm_demand_surge" ON public.mcbm_demand_surge FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_mcbm_ds_urgency ON public.mcbm_demand_surge(urgency_score DESC);

-- 4️⃣ Competitive Weakness Exploiter
CREATE TABLE public.mcbm_competitive_weakness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL,
  district TEXT,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  listing_freshness_gap_days NUMERIC DEFAULT 0,
  pricing_mismatch_pct NUMERIC DEFAULT 0,
  underserved_segments TEXT[] DEFAULT '{}',
  response_cycle_hours NUMERIC DEFAULT 0,
  our_speed_advantage_multiple NUMERIC DEFAULT 1,
  exploitation_opportunity_score NUMERIC DEFAULT 0,
  recommended_tactic TEXT,
  weakness_category TEXT DEFAULT 'SPEED' CHECK (weakness_category IN ('SPEED','PRICING','COVERAGE','QUALITY','DATA')),
  tracked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mcbm_competitive_weakness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read mcbm_competitive_weakness" ON public.mcbm_competitive_weakness FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_mcbm_cw_score ON public.mcbm_competitive_weakness(exploitation_opportunity_score DESC);

-- 5️⃣ Momentum Compounding Loop
CREATE TABLE public.mcbm_momentum_loop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  supply_dominance_score NUMERIC DEFAULT 0,
  investor_trust_index NUMERIC DEFAULT 0,
  deal_velocity_rpm NUMERIC DEFAULT 0,
  data_advantage_score NUMERIC DEFAULT 0,
  flywheel_momentum NUMERIC DEFAULT 0,
  momentum_phase TEXT DEFAULT 'IGNITION' CHECK (momentum_phase IN ('IGNITION','TRACTION','ACCELERATION','DOMINANCE','MONOPOLY')),
  loop_iteration INTEGER DEFAULT 0,
  compounding_rate NUMERIC DEFAULT 0,
  phase_metrics JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mcbm_momentum_loop ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read mcbm_momentum_loop" ON public.mcbm_momentum_loop FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_mcbm_ml_momentum ON public.mcbm_momentum_loop(flywheel_momentum DESC);

-- Signal trigger for blitz capture events
CREATE OR REPLACE FUNCTION public.fn_mcbm_blitz_signal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.capture_priority = 'BLITZ' AND NEW.domination_score >= 75 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('mcbm_blitz_capture', 'district', NEW.id::text, 'critical',
      jsonb_build_object('district', NEW.district, 'city', NEW.city, 'score', NEW.domination_score));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mcbm_blitz_signal
AFTER INSERT OR UPDATE ON public.mcbm_district_domination
FOR EACH ROW EXECUTE FUNCTION public.fn_mcbm_blitz_signal();
