-- =============================================
-- GLOBAL URBAN ECONOMIC SIMULATOR (GUES)
-- =============================================

-- 1️⃣ Urban Growth Physics Engine
CREATE TABLE public.gues_urban_growth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  district text,
  simulation_horizon_years integer NOT NULL DEFAULT 10,
  population_current bigint,
  population_forecast bigint,
  population_cagr_pct numeric(6,3),
  infrastructure_investment_usd numeric(18,2) DEFAULT 0,
  infrastructure_multiplier numeric(6,3) DEFAULT 1.0,
  employment_cluster_count integer DEFAULT 0,
  employment_growth_pct numeric(6,3),
  commercial_density_sqm_per_capita numeric(10,2),
  commercial_density_forecast numeric(10,2),
  transit_expansion_score numeric(5,2) DEFAULT 0,
  green_space_ratio numeric(5,3),
  urbanization_velocity numeric(6,3),
  growth_phase text DEFAULT 'emerging' CHECK (growth_phase IN ('nascent','emerging','accelerating','mature','saturated','declining')),
  confidence_score numeric(5,2) DEFAULT 0,
  simulation_data jsonb DEFAULT '{}',
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gues_urban_city ON public.gues_urban_growth(city, country);

-- 2️⃣ Property Value Trajectory Predictor
CREATE TABLE public.gues_value_trajectories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  district text,
  property_type text DEFAULT 'residential',
  current_median_price_usd numeric(18,2),
  forecast_5y_price_usd numeric(18,2),
  forecast_10y_price_usd numeric(18,2),
  forecast_20y_price_usd numeric(18,2),
  appreciation_cagr_5y numeric(6,3),
  appreciation_cagr_10y numeric(6,3),
  appreciation_cagr_20y numeric(6,3),
  gentrification_stage text DEFAULT 'pre' CHECK (gentrification_stage IN ('pre','early','mid','advanced','post','stalled')),
  gentrification_probability numeric(5,2) DEFAULT 0,
  luxury_demand_index numeric(5,2) DEFAULT 0,
  rental_yield_current numeric(6,3),
  rental_yield_stabilized numeric(6,3),
  rental_yield_floor numeric(6,3),
  price_to_income_ratio numeric(8,2),
  trajectory_curve text DEFAULT 'linear' CHECK (trajectory_curve IN ('linear','exponential','s_curve','plateau','volatile','decline')),
  confidence_score numeric(5,2) DEFAULT 0,
  model_version text DEFAULT 'v1.0',
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gues_trajectory_city ON public.gues_value_trajectories(city, district);

-- 3️⃣ Capital Attraction Index
CREATE TABLE public.gues_capital_attraction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  composite_score numeric(5,2) NOT NULL DEFAULT 0,
  investment_friendliness numeric(5,2) DEFAULT 0,
  regulatory_friction numeric(5,2) DEFAULT 0,
  development_velocity numeric(5,2) DEFAULT 0,
  macro_stability numeric(5,2) DEFAULT 0,
  tax_competitiveness numeric(5,2) DEFAULT 0,
  foreign_ownership_ease numeric(5,2) DEFAULT 0,
  permit_speed_days integer,
  corruption_index numeric(5,2),
  fdi_inflow_usd numeric(18,2) DEFAULT 0,
  fdi_trend text DEFAULT 'stable' CHECK (fdi_trend IN ('declining','stable','growing','surging')),
  institutional_interest_score numeric(5,2) DEFAULT 0,
  tier text DEFAULT 'emerging' CHECK (tier IN ('frontier','emerging','growth','established','premium')),
  rank_global integer,
  rank_regional integer,
  signal_drivers jsonb DEFAULT '{}',
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gues_capital_city ON public.gues_capital_attraction(city, country);

-- 4️⃣ Crisis Resilience Simulator
CREATE TABLE public.gues_crisis_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  scenario_type text NOT NULL CHECK (scenario_type IN ('market_crash','rate_shock','oversupply','liquidity_freeze','pandemic','currency_crisis','political_instability')),
  scenario_name text NOT NULL,
  severity_level numeric(5,2) NOT NULL DEFAULT 50,
  price_impact_pct numeric(8,3),
  recovery_months integer,
  liquidity_impact_pct numeric(8,3),
  transaction_volume_impact_pct numeric(8,3),
  rental_yield_impact_pct numeric(8,3),
  developer_default_probability numeric(5,2),
  mortgage_stress_pct numeric(5,2),
  resilience_score numeric(5,2) DEFAULT 0,
  vulnerability_factors jsonb DEFAULT '[]',
  mitigation_strategies jsonb DEFAULT '[]',
  historical_precedent text,
  simulation_parameters jsonb DEFAULT '{}',
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gues_crisis_city ON public.gues_crisis_simulations(city, scenario_type);

-- 5️⃣ Strategic Expansion Recommendation AI
CREATE TABLE public.gues_expansion_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('hotspot','acquisition_target','early_entry','avoid','monitor')),
  priority_rank integer,
  opportunity_score numeric(5,2) NOT NULL DEFAULT 0,
  timing_signal text DEFAULT 'watch' CHECK (timing_signal IN ('immediate','6_months','12_months','watch','not_ready')),
  market_entry_strategy text,
  estimated_irr_pct numeric(6,3),
  estimated_multiple numeric(4,2),
  capital_required_usd numeric(18,2),
  competitive_landscape text,
  key_risks jsonb DEFAULT '[]',
  key_catalysts jsonb DEFAULT '[]',
  comparable_cities jsonb DEFAULT '[]',
  thesis text,
  valid_until date,
  is_active boolean DEFAULT true,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gues_expansion_type ON public.gues_expansion_recommendations(recommendation_type, is_active);

-- RLS
ALTER TABLE public.gues_urban_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gues_value_trajectories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gues_capital_attraction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gues_crisis_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gues_expansion_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read urban growth" ON public.gues_urban_growth FOR SELECT USING (true);
CREATE POLICY "Public read value trajectories" ON public.gues_value_trajectories FOR SELECT USING (true);
CREATE POLICY "Public read capital attraction" ON public.gues_capital_attraction FOR SELECT USING (true);
CREATE POLICY "Public read crisis simulations" ON public.gues_crisis_simulations FOR SELECT USING (true);
CREATE POLICY "Public read expansion recs" ON public.gues_expansion_recommendations FOR SELECT USING (true);

-- Trigger: emit signal when hotspot detected
CREATE OR REPLACE FUNCTION public.fn_gues_hotspot_signal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.recommendation_type = 'hotspot' AND NEW.opportunity_score >= 80 AND NEW.timing_signal = 'immediate' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'gues_hotspot_detected',
      'gues_expansion',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'city', NEW.city,
        'country', NEW.country,
        'opportunity_score', NEW.opportunity_score,
        'estimated_irr', NEW.estimated_irr_pct,
        'thesis', NEW.thesis
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gues_hotspot
  AFTER INSERT ON public.gues_expansion_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_gues_hotspot_signal();