
-- ═══════════════════════════════════════════════════════════
-- GLOBAL VALUATION EXPANSION MODEL (GVEM)
-- ═══════════════════════════════════════════════════════════

-- 1) Market Size Expansion
CREATE TABLE public.gvem_market_expansion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expansion_phase TEXT NOT NULL CHECK (expansion_phase IN ('LOCAL_MARKETPLACE','NATIONAL_INFRASTRUCTURE','REGIONAL_INTELLIGENCE','GLOBAL_PLATFORM')),
  phase_label TEXT NOT NULL,
  tam_usd BIGINT NOT NULL DEFAULT 0,
  sam_usd BIGINT NOT NULL DEFAULT 0,
  som_usd BIGINT NOT NULL DEFAULT 0,
  penetration_pct NUMERIC(6,3) DEFAULT 0,
  growth_rate_pct NUMERIC(6,2) DEFAULT 0,
  geographic_scope TEXT DEFAULT 'Indonesia',
  key_drivers JSONB DEFAULT '[]',
  milestones_achieved INT DEFAULT 0,
  milestones_total INT DEFAULT 5,
  phase_confidence NUMERIC(5,2) DEFAULT 50,
  estimated_timeline_months INT DEFAULT 12,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gvem_market_expansion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gvem_market_expansion_read" ON public.gvem_market_expansion FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gvem_market_phase ON public.gvem_market_expansion(expansion_phase);

-- 2) Monetization Layer Stacking
CREATE TABLE public.gvem_monetization_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_name TEXT NOT NULL,
  layer_order INT NOT NULL DEFAULT 0,
  layer_type TEXT NOT NULL CHECK (layer_type IN ('TRANSACTION','VENDOR_ECOSYSTEM','DATA_INTELLIGENCE','INSTITUTIONAL_TOOLS','FINANCIAL_SERVICES')),
  current_arr_usd NUMERIC(14,2) DEFAULT 0,
  projected_arr_usd NUMERIC(14,2) DEFAULT 0,
  margin_pct NUMERIC(5,2) DEFAULT 0,
  contribution_to_valuation_pct NUMERIC(5,2) DEFAULT 0,
  multiple_applied NUMERIC(5,1) DEFAULT 10,
  implied_value_usd NUMERIC(16,2) DEFAULT 0,
  activation_status TEXT DEFAULT 'PLANNED' CHECK (activation_status IN ('PLANNED','BUILDING','LIVE','SCALING','DOMINANT')),
  dependencies JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gvem_monetization_stack ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gvem_monetization_stack_read" ON public.gvem_monetization_stack FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gvem_monet_type ON public.gvem_monetization_stack(layer_type);

-- 3) Network Effect Valuation Multiplier
CREATE TABLE public.gvem_network_multiplier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  effect_dimension TEXT NOT NULL CHECK (effect_dimension IN ('USER_GROWTH','LIQUIDITY_DEPTH','DATA_SCALE','ECOSYSTEM_DENSITY','CROSS_BORDER')),
  current_magnitude NUMERIC(8,2) DEFAULT 0,
  growth_velocity NUMERIC(6,3) DEFAULT 0,
  pricing_power_index NUMERIC(5,2) DEFAULT 50,
  defensibility_score NUMERIC(5,2) DEFAULT 50,
  strategic_value_score NUMERIC(5,2) DEFAULT 50,
  multiplier_contribution NUMERIC(5,2) DEFAULT 1,
  competitor_gap_pct NUMERIC(6,2) DEFAULT 0,
  tipping_point_reached BOOLEAN DEFAULT false,
  metcalfe_proxy NUMERIC(14,2) DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gvem_network_multiplier ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gvem_network_multiplier_read" ON public.gvem_network_multiplier FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gvem_net_dim ON public.gvem_network_multiplier(effect_dimension);

-- 4) Strategic Optionality
CREATE TABLE public.gvem_strategic_optionality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_name TEXT NOT NULL,
  option_type TEXT NOT NULL CHECK (option_type IN ('FINANCIAL_SERVICES','CROSS_BORDER','TOKENIZATION','PLATFORMIZATION','DATA_LICENSING')),
  probability_pct NUMERIC(5,2) DEFAULT 10,
  potential_value_usd NUMERIC(16,2) DEFAULT 0,
  expected_value_usd NUMERIC(16,2) DEFAULT 0,
  time_to_activation_months INT DEFAULT 24,
  readiness_score NUMERIC(5,2) DEFAULT 0,
  prerequisite_layers JSONB DEFAULT '[]',
  valuation_uplift_pct NUMERIC(6,2) DEFAULT 0,
  risk_factors JSONB DEFAULT '[]',
  status TEXT DEFAULT 'IDENTIFIED' CHECK (status IN ('IDENTIFIED','EVALUATING','COMMITTED','ACTIVE','REALIZED')),
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gvem_strategic_optionality ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gvem_strategic_optionality_read" ON public.gvem_strategic_optionality FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gvem_opt_type ON public.gvem_strategic_optionality(option_type);

-- 5) Enterprise Value Simulator
CREATE TABLE public.gvem_ev_simulator (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('BEAR','BASE','BULL','MOONSHOT')),
  year_horizon INT NOT NULL DEFAULT 5,
  base_revenue_usd NUMERIC(14,2) DEFAULT 0,
  projected_revenue_usd NUMERIC(14,2) DEFAULT 0,
  revenue_cagr_pct NUMERIC(6,2) DEFAULT 0,
  marketplace_multiple NUMERIC(5,1) DEFAULT 8,
  infrastructure_multiple NUMERIC(5,1) DEFAULT 20,
  blended_multiple NUMERIC(5,1) DEFAULT 12,
  infrastructure_revenue_pct NUMERIC(5,2) DEFAULT 20,
  implied_ev_usd NUMERIC(16,2) DEFAULT 0,
  network_premium_pct NUMERIC(6,2) DEFAULT 0,
  optionality_premium_pct NUMERIC(6,2) DEFAULT 0,
  total_ev_usd NUMERIC(16,2) DEFAULT 0,
  sustainability_score NUMERIC(5,2) DEFAULT 50,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gvem_ev_simulator ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gvem_ev_simulator_read" ON public.gvem_ev_simulator FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gvem_ev_scenario ON public.gvem_ev_simulator(scenario_type);

-- Trigger: emit signal when EV projection crosses milestone
CREATE OR REPLACE FUNCTION notify_gvem_milestone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_ev_usd >= 100000000 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('gvem_valuation_milestone', 'gvem_ev_simulator', NEW.id, 'critical',
      jsonb_build_object('scenario', NEW.scenario_name, 'total_ev', NEW.total_ev_usd, 'multiple', NEW.blended_multiple));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gvem_milestone
AFTER INSERT ON public.gvem_ev_simulator
FOR EACH ROW EXECUTE FUNCTION notify_gvem_milestone();
