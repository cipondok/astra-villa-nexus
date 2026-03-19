
-- ============================================
-- AUTONOMOUS CITY EXPANSION INTELLIGENCE MODEL
-- ============================================

-- 1) Urban Growth Signal Engine
CREATE TABLE public.city_urban_growth_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  province TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'population_migration', 'infrastructure_investment', 'commercial_cluster',
    'transit_expansion', 'tech_hub_formation', 'tourism_growth', 'industrial_zone'
  )),
  signal_strength NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (signal_strength BETWEEN 0 AND 100),
  signal_data JSONB DEFAULT '{}'::jsonb,
  trend_direction TEXT CHECK (trend_direction IN ('accelerating', 'stable', 'decelerating')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_urban_growth_city ON public.city_urban_growth_signals (city);
CREATE INDEX idx_urban_growth_type ON public.city_urban_growth_signals (signal_type);

-- 2) Real Estate Expansion Probability Index
CREATE TABLE public.city_expansion_probability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  -- Component scores (0-100)
  liquidity_momentum NUMERIC(5,2) NOT NULL DEFAULT 0,
  absorption_acceleration NUMERIC(5,2) NOT NULL DEFAULT 0,
  price_appreciation_slope NUMERIC(5,2) NOT NULL DEFAULT 0,
  investor_entry_velocity NUMERIC(5,2) NOT NULL DEFAULT 0,
  infrastructure_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  population_growth_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  -- Composite
  expansion_probability NUMERIC(5,2) NOT NULL DEFAULT 0,
  expansion_phase TEXT CHECK (expansion_phase IN (
    'early_signal', 'momentum_building', 'breakout', 'rapid_growth', 'maturation', 'plateau'
  )),
  confidence_level NUMERIC(4,2) DEFAULT 0.5,
  time_horizon_months INTEGER DEFAULT 12,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city, district)
);

CREATE INDEX idx_expansion_prob_city ON public.city_expansion_probability (city);
CREATE INDEX idx_expansion_prob_score ON public.city_expansion_probability (expansion_probability DESC);

-- 3) Developer Opportunity Radar
CREATE TABLE public.city_developer_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN (
    'undersupplied_zone', 'high_future_demand', 'land_banking', 
    'redevelopment', 'mixed_use', 'affordable_housing'
  )),
  opportunity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  estimated_roi_pct NUMERIC(6,2),
  supply_deficit_units INTEGER,
  demand_forecast_12m NUMERIC(10,2),
  avg_land_price_sqm NUMERIC(12,2),
  recommended_property_type TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
  strategy_brief TEXT,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dev_opp_city ON public.city_developer_opportunities (city);
CREATE INDEX idx_dev_opp_score ON public.city_developer_opportunities (opportunity_score DESC);

-- 4) Expansion Sequencing Brain
CREATE TABLE public.city_expansion_sequencing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  -- Ranking dimensions (0-100)
  capital_inflow_potential NUMERIC(5,2) NOT NULL DEFAULT 0,
  market_maturity NUMERIC(5,2) NOT NULL DEFAULT 0,
  regulatory_openness NUMERIC(5,2) NOT NULL DEFAULT 0,
  digital_readiness NUMERIC(5,2) NOT NULL DEFAULT 0,
  vendor_ecosystem_depth NUMERIC(5,2) NOT NULL DEFAULT 0,
  -- Composite
  sequence_rank INTEGER,
  composite_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  recommended_entry_timing TEXT CHECK (recommended_entry_timing IN (
    'immediate', 'q1_next', 'q2_next', 'h2_next', 'monitor'
  )),
  entry_strategy TEXT,
  vendor_activation_plan TEXT,
  capital_deployment_strategy TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city, country)
);

CREATE INDEX idx_expansion_seq_rank ON public.city_expansion_sequencing (sequence_rank);

-- 5) Enable RLS
ALTER TABLE public.city_urban_growth_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_expansion_probability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_developer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_expansion_sequencing ENABLE ROW LEVEL SECURITY;

-- Read-only public policies for authenticated users
CREATE POLICY "Authenticated users can read urban growth signals"
  ON public.city_urban_growth_signals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read expansion probability"
  ON public.city_expansion_probability FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read developer opportunities"
  ON public.city_developer_opportunities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read expansion sequencing"
  ON public.city_expansion_sequencing FOR SELECT TO authenticated USING (true);

-- Service role insert/update policies
CREATE POLICY "Service can manage urban growth signals"
  ON public.city_urban_growth_signals FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service can manage expansion probability"
  ON public.city_expansion_probability FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service can manage developer opportunities"
  ON public.city_developer_opportunities FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service can manage expansion sequencing"
  ON public.city_expansion_sequencing FOR ALL USING (true) WITH CHECK (true);

-- 6) Trigger: emit signal on high-probability expansion detected
CREATE OR REPLACE FUNCTION public.trg_expansion_breakout_signal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expansion_probability >= 80 AND NEW.expansion_phase = 'breakout' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'city_expansion_breakout',
      'city_expansion',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'city', NEW.city,
        'district', NEW.district,
        'expansion_probability', NEW.expansion_probability,
        'phase', NEW.expansion_phase,
        'liquidity_momentum', NEW.liquidity_momentum,
        'investor_entry_velocity', NEW.investor_entry_velocity
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_city_expansion_breakout
  AFTER INSERT OR UPDATE ON public.city_expansion_probability
  FOR EACH ROW EXECUTE FUNCTION public.trg_expansion_breakout_signal();
