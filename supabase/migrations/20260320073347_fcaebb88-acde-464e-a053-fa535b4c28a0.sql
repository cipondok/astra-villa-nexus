
-- ══════════════════════════════════════════════════════════════
-- GLOBAL PROPTECH ENDGAME SIMULATION (GPES)
-- ══════════════════════════════════════════════════════════════

-- 1️⃣ Global Market Saturation Model
CREATE TABLE public.gpes_market_saturation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  region text,
  saturation_phase text NOT NULL CHECK (saturation_phase IN ('ENTRY','GROWTH','DOMINANT_LIQUIDITY','MONOPOLISTIC','SATURATED')),
  platform_liquidity_share_pct numeric DEFAULT 0,
  cross_border_flow_share_pct numeric DEFAULT 0,
  competitor_status text CHECK (competitor_status IN ('ACTIVE','NICHE_PLAYER','ACQUISITION_TARGET','EXITED','IRRELEVANT')),
  total_addressable_market_usd numeric DEFAULT 0,
  platform_captured_market_usd numeric DEFAULT 0,
  investor_concentration_index numeric DEFAULT 0,
  listing_market_share_pct numeric DEFAULT 0,
  deal_velocity_advantage_pct numeric DEFAULT 0,
  time_to_saturation_months integer,
  simulated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gpes_market_saturation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpes_market_saturation" ON public.gpes_market_saturation FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gpes_sat_phase ON public.gpes_market_saturation (saturation_phase);
CREATE INDEX idx_gpes_sat_share ON public.gpes_market_saturation (platform_liquidity_share_pct DESC);

-- 2️⃣ Platform Dependency Formation
CREATE TABLE public.gpes_platform_dependency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_type text NOT NULL CHECK (stakeholder_type IN ('INSTITUTIONAL_INVESTOR','DEVELOPER','SERVICE_VENDOR','AGENT','RETAIL_INVESTOR','GOVERNMENT')),
  dependency_driver text NOT NULL,
  dependency_intensity numeric DEFAULT 0,
  switching_cost_usd numeric DEFAULT 0,
  alternative_viability_score numeric DEFAULT 0,
  workflow_capture_pct numeric DEFAULT 0,
  revenue_at_risk_if_churn_pct numeric DEFAULT 0,
  lock_in_mechanism text,
  dependency_trajectory text CHECK (dependency_trajectory IN ('DEEPENING','STABLE','AT_RISK','DIVERSIFYING')),
  time_to_full_dependency_months integer,
  formation_stage text CHECK (formation_stage IN ('AWARENESS','CONVENIENCE','HABIT','DEPENDENCY','STRUCTURAL')),
  simulated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gpes_platform_dependency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpes_platform_dependency" ON public.gpes_platform_dependency FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gpes_dep_intensity ON public.gpes_platform_dependency (dependency_intensity DESC);

-- 3️⃣ Network Effect Terminal Velocity
CREATE TABLE public.gpes_terminal_velocity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network_dimension text NOT NULL CHECK (network_dimension IN ('USER_GROWTH','DATA_COMPOUNDING','INTELLIGENCE_STANDARD','LIQUIDITY_DEPTH','CROSS_BORDER_FLOW','ECOSYSTEM_DENSITY')),
  current_velocity numeric DEFAULT 0,
  tipping_point_threshold numeric DEFAULT 0,
  tipping_point_reached boolean DEFAULT false,
  acceleration_rate numeric DEFAULT 0,
  users_at_tipping_point integer DEFAULT 0,
  data_points_at_tipping_point bigint DEFAULT 0,
  competitor_catchup_years numeric DEFAULT 0,
  dominance_multiplier numeric DEFAULT 1.0,
  network_effect_type text CHECK (network_effect_type IN ('DIRECT','INDIRECT','DATA','CROSS_SIDE','LEARNING')),
  exponential_growth_factor numeric DEFAULT 1.0,
  simulated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gpes_terminal_velocity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpes_terminal_velocity" ON public.gpes_terminal_velocity FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gpes_tv_velocity ON public.gpes_terminal_velocity (current_velocity DESC);

-- 4️⃣ Strategic Optionality Engine
CREATE TABLE public.gpes_strategic_optionality (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expansion_path text NOT NULL CHECK (expansion_path IN ('FINANCING_INFRA','TOKENIZED_TRADING','URBAN_DEV_INTEL','MACRO_ANALYTICS','INSURANCE_LAYER','CONSTRUCTION_TECH','SMART_CITY_OS')),
  option_value_usd numeric DEFAULT 0,
  execution_readiness_pct numeric DEFAULT 0,
  market_size_usd numeric DEFAULT 0,
  synergy_with_core_pct numeric DEFAULT 0,
  capital_required_usd numeric DEFAULT 0,
  time_to_market_months integer DEFAULT 0,
  competitive_moat_years numeric DEFAULT 0,
  revenue_potential_annual_usd numeric DEFAULT 0,
  risk_level text CHECK (risk_level IN ('LOW','MEDIUM','HIGH','VERY_HIGH')),
  recommended_timing text CHECK (recommended_timing IN ('IMMEDIATE','POST_IPO','YEAR_5_PLUS','OPPORTUNISTIC','DEFER')),
  prerequisite_milestones jsonb DEFAULT '[]'::jsonb,
  simulated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gpes_strategic_optionality ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpes_strategic_optionality" ON public.gpes_strategic_optionality FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gpes_so_value ON public.gpes_strategic_optionality (option_value_usd DESC);

-- 5️⃣ Endgame State Definition
CREATE TABLE public.gpes_endgame_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endgame_role text NOT NULL CHECK (endgame_role IN ('DEAL_DISCOVERY_LAYER','CAPITAL_ALLOCATION_GRID','ECONOMIC_COORDINATION_SYSTEM','DATA_STANDARD_AUTHORITY','REGULATORY_INFRASTRUCTURE')),
  positioning_strength numeric DEFAULT 0,
  global_penetration_pct numeric DEFAULT 0,
  annual_platform_throughput_usd numeric DEFAULT 0,
  cities_controlled integer DEFAULT 0,
  institutional_clients integer DEFAULT 0,
  api_consumers integer DEFAULT 0,
  data_monopoly_score numeric DEFAULT 0,
  irreplaceability_score numeric DEFAULT 0,
  structural_power_index numeric DEFAULT 0,
  endgame_probability_pct numeric DEFAULT 0,
  endgame_timeline_years numeric DEFAULT 0,
  risk_factors jsonb DEFAULT '[]'::jsonb,
  simulated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gpes_endgame_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpes_endgame_state" ON public.gpes_endgame_state FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gpes_es_power ON public.gpes_endgame_state (structural_power_index DESC);

-- Trigger: emit signal when tipping point reached
CREATE OR REPLACE FUNCTION public.fn_gpes_tipping_point()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.tipping_point_reached = true AND (OLD.tipping_point_reached IS NULL OR OLD.tipping_point_reached = false) THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('gpes_tipping_point_reached', 'gpes_velocity', NEW.id, 'critical',
      jsonb_build_object('dimension', NEW.network_dimension, 'velocity', NEW.current_velocity, 'dominance_multiplier', NEW.dominance_multiplier, 'catchup_years', NEW.competitor_catchup_years));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gpes_tipping_point
  AFTER INSERT OR UPDATE ON public.gpes_terminal_velocity
  FOR EACH ROW EXECUTE FUNCTION public.fn_gpes_tipping_point();
