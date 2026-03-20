-- ══════════════════════════════════════════════════════════════
-- Global PropTech Execution War Map (GPEWM)
-- ══════════════════════════════════════════════════════════════

-- 1) Market Entry Sequencing
CREATE TABLE public.gpewm_market_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  region_cluster text,
  liquidity_potential numeric DEFAULT 0,
  digital_adoption_score numeric DEFAULT 0,
  capital_inflow_intensity numeric DEFAULT 0,
  regulatory_openness numeric DEFAULT 0,
  composite_priority numeric DEFAULT 0,
  entry_timing text DEFAULT 'monitor' CHECK (entry_timing IN ('immediate','next_quarter','h2','next_year','monitor')),
  entry_strategy text,
  population_millions numeric,
  gdp_per_capita_usd numeric,
  proptech_penetration_pct numeric DEFAULT 0,
  sequenced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gpewm_entry_priority ON public.gpewm_market_entry(composite_priority DESC);
ALTER TABLE public.gpewm_market_entry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpewm_market_entry" ON public.gpewm_market_entry FOR SELECT TO authenticated USING (true);

-- 2) Competitive Landscape
CREATE TABLE public.gpewm_competitive_landscape (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  competitor_name text NOT NULL,
  competitor_type text DEFAULT 'portal' CHECK (competitor_type IN ('portal','brokerage','fintech','saas','hybrid')),
  market_share_pct numeric DEFAULT 0,
  listing_volume integer DEFAULT 0,
  digital_maturity_score numeric DEFAULT 0,
  vulnerability_score numeric DEFAULT 0,
  response_strategy text DEFAULT 'differentiate' CHECK (response_strategy IN ('differentiate','partner','displace','bundle','coexist')),
  displacement_timeline_months integer,
  strategic_notes text,
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gpewm_comp_vuln ON public.gpewm_competitive_landscape(vulnerability_score DESC);
ALTER TABLE public.gpewm_competitive_landscape ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpewm_competitive_landscape" ON public.gpewm_competitive_landscape FOR SELECT TO authenticated USING (true);

-- 3) Supply Flywheel
CREATE TABLE public.gpewm_supply_flywheel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  supply_onboarding_velocity numeric DEFAULT 0,
  listing_quality_score numeric DEFAULT 0,
  vendor_ecosystem_depth integer DEFAULT 0,
  incentive_effectiveness numeric DEFAULT 0,
  demand_match_efficiency numeric DEFAULT 0,
  flywheel_rpm numeric DEFAULT 0,
  flywheel_phase text DEFAULT 'seeding' CHECK (flywheel_phase IN ('seeding','igniting','accelerating','self_sustaining','dominant')),
  activation_strategy text,
  supply_sources jsonb DEFAULT '[]'::jsonb,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gpewm_flywheel_rpm ON public.gpewm_supply_flywheel(flywheel_rpm DESC);
ALTER TABLE public.gpewm_supply_flywheel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpewm_supply_flywheel" ON public.gpewm_supply_flywheel FOR SELECT TO authenticated USING (true);

-- 4) Demand Acceleration
CREATE TABLE public.gpewm_demand_acceleration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  investor_funnel_velocity numeric DEFAULT 0,
  content_discovery_score numeric DEFAULT 0,
  recommendation_accuracy numeric DEFAULT 0,
  cac_current numeric,
  cac_target numeric,
  conversion_rate_pct numeric DEFAULT 0,
  demand_growth_rate numeric DEFAULT 0,
  acquisition_channel text,
  funnel_stage text DEFAULT 'awareness' CHECK (funnel_stage IN ('awareness','consideration','evaluation','conversion','retention')),
  acceleration_lever text,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gpewm_demand_growth ON public.gpewm_demand_acceleration(demand_growth_rate DESC);
ALTER TABLE public.gpewm_demand_acceleration ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpewm_demand_acceleration" ON public.gpewm_demand_acceleration FOR SELECT TO authenticated USING (true);

-- 5) Network Effect Compounding
CREATE TABLE public.gpewm_network_compounding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  liquidity_density numeric DEFAULT 0,
  data_intelligence_accuracy numeric DEFAULT 0,
  cac_reduction_pct numeric DEFAULT 0,
  network_density numeric DEFAULT 0,
  compounding_velocity numeric DEFAULT 0,
  compounding_phase text DEFAULT 'linear' CHECK (compounding_phase IN ('linear','inflection','exponential','dominant','monopolistic')),
  time_to_dominance_months integer,
  moat_depth_score numeric DEFAULT 0,
  defensibility_tier text DEFAULT 'emerging' CHECK (defensibility_tier IN ('emerging','establishing','formidable','unassailable')),
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gpewm_network_compound ON public.gpewm_network_compounding(compounding_velocity DESC);
ALTER TABLE public.gpewm_network_compounding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpewm_network_compounding" ON public.gpewm_network_compounding FOR SELECT TO authenticated USING (true);

-- Trigger: emit signal when a market hits immediate entry timing
CREATE OR REPLACE FUNCTION public.fn_gpewm_immediate_entry()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.entry_timing = 'immediate' AND NEW.composite_priority >= 75 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('gpewm_immediate_entry', 'gpewm_market_entry', NEW.id, 'high',
      jsonb_build_object('city', NEW.city, 'country', NEW.country, 'priority', NEW.composite_priority));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gpewm_immediate_entry
AFTER INSERT OR UPDATE ON public.gpewm_market_entry
FOR EACH ROW EXECUTE FUNCTION public.fn_gpewm_immediate_entry();