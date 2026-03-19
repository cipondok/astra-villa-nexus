-- =============================================
-- GLOBAL WEALTH SINGULARITY MODEL (GWSM)
-- =============================================

-- 1️⃣ Planetary Wealth Mapping Engine
CREATE TABLE public.gwsm_wealth_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geography text NOT NULL,
  geography_type text NOT NULL DEFAULT 'country' CHECK (geography_type IN ('global','continent','country','city','district')),
  asset_class text NOT NULL CHECK (asset_class IN ('real_estate','equities','infrastructure','commodities','digital_assets','fixed_income','private_equity','cash')),
  total_value_usd numeric(22,2) NOT NULL DEFAULT 0,
  value_share_pct numeric(6,3) DEFAULT 0,
  productivity_score numeric(5,2) DEFAULT 50,
  liquidity_score numeric(5,2) DEFAULT 50,
  trapped_capital_usd numeric(22,2) DEFAULT 0,
  trapped_capital_pct numeric(6,3) DEFAULT 0,
  under_leveraged boolean DEFAULT false,
  leverage_ratio numeric(6,3) DEFAULT 1.0,
  velocity_of_capital numeric(8,4) DEFAULT 1.0,
  inefficiency_index numeric(5,2) DEFAULT 0,
  growth_potential_score numeric(5,2) DEFAULT 50,
  data_confidence numeric(5,2) DEFAULT 50,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gwsm_wealth_geo ON public.gwsm_wealth_map(geography, asset_class);
CREATE INDEX idx_gwsm_wealth_date ON public.gwsm_wealth_map(snapshot_date);

-- 2️⃣ Capital Flow Optimization Core
CREATE TABLE public.gwsm_capital_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_geography text NOT NULL,
  target_geography text NOT NULL,
  asset_class text NOT NULL,
  flow_type text NOT NULL CHECK (flow_type IN ('predicted_optimal','actual','recommended','speculative','productive','rebalance')),
  flow_amount_usd numeric(22,2) NOT NULL DEFAULT 0,
  flow_velocity numeric(8,4) DEFAULT 1.0,
  productivity_gain_pct numeric(8,4) DEFAULT 0,
  bubble_risk_contribution numeric(5,2) DEFAULT 0,
  long_term_asset_productivity numeric(5,2) DEFAULT 50,
  optimization_delta_pct numeric(8,4) DEFAULT 0,
  friction_cost_pct numeric(6,3) DEFAULT 0,
  regulatory_friction numeric(5,2) DEFAULT 0,
  time_horizon_years integer DEFAULT 5,
  confidence numeric(5,2) DEFAULT 50,
  recommendation text,
  signal_sources jsonb DEFAULT '[]',
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gwsm_flows_source ON public.gwsm_capital_flows(source_geography, target_geography);
CREATE INDEX idx_gwsm_flows_type ON public.gwsm_capital_flows(flow_type);

-- 3️⃣ Generational Compounding Simulator
CREATE TABLE public.gwsm_generational_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('sovereign_fund','institution','family_office','pension','endowment','emerging_investor','retail_cohort')),
  entity_name text,
  initial_capital_usd numeric(22,2) NOT NULL DEFAULT 0,
  forecast_10y_usd numeric(22,2),
  forecast_25y_usd numeric(22,2),
  forecast_50y_usd numeric(22,2),
  forecast_100y_usd numeric(22,2),
  cagr_10y numeric(6,3),
  cagr_25y numeric(6,3),
  cagr_50y numeric(6,3),
  real_return_after_inflation numeric(6,3),
  allocation_strategy jsonb DEFAULT '{}',
  compounding_efficiency numeric(5,2) DEFAULT 50,
  wealth_preservation_probability numeric(5,2) DEFAULT 80,
  intergenerational_transfer_loss_pct numeric(6,3) DEFAULT 5,
  dynasty_longevity_score numeric(5,2) DEFAULT 50,
  scenario text DEFAULT 'base' CHECK (scenario IN ('pessimistic','conservative','base','optimistic','transformative')),
  key_assumptions jsonb DEFAULT '{}',
  risk_factors jsonb DEFAULT '[]',
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gwsm_gen_entity ON public.gwsm_generational_forecasts(entity_type, scenario);

-- 4️⃣ Risk Entropy Stabilization Layer
CREATE TABLE public.gwsm_risk_entropy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL DEFAULT 'global' CHECK (scope IN ('global','continental','regional','national','city')),
  geography text,
  entropy_index numeric(5,2) NOT NULL DEFAULT 50,
  systemic_instability_score numeric(5,2) DEFAULT 0,
  crisis_probability_6m numeric(5,2) DEFAULT 5,
  crisis_probability_12m numeric(5,2) DEFAULT 10,
  crisis_probability_24m numeric(5,2) DEFAULT 15,
  contagion_risk numeric(5,2) DEFAULT 20,
  rebalancing_urgency text DEFAULT 'low' CHECK (rebalancing_urgency IN ('none','low','moderate','high','critical')),
  dampening_capacity numeric(5,2) DEFAULT 50,
  leverage_system_risk numeric(5,2) DEFAULT 30,
  liquidity_stress_index numeric(5,2) DEFAULT 20,
  correlation_spike_detected boolean DEFAULT false,
  safe_haven_demand_index numeric(5,2) DEFAULT 30,
  recommended_actions jsonb DEFAULT '[]',
  early_warning_signals jsonb DEFAULT '[]',
  propagation_paths jsonb DEFAULT '[]',
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gwsm_entropy_scope ON public.gwsm_risk_entropy(scope, geography);

-- 5️⃣ Wealth Gravity Field Index
CREATE TABLE public.gwsm_gravity_field (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target text NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('geography','asset_class','economic_cluster','sector','corridor')),
  gravity_score numeric(5,2) NOT NULL DEFAULT 50,
  capital_mass_usd numeric(22,2) DEFAULT 0,
  inflow_momentum numeric(8,4) DEFAULT 0,
  outflow_pressure numeric(8,4) DEFAULT 0,
  net_attraction numeric(8,4) DEFAULT 0,
  magnetic_field_strength numeric(5,2) DEFAULT 50,
  orbital_capital_usd numeric(22,2) DEFAULT 0,
  escape_velocity_threshold numeric(8,4) DEFAULT 0,
  gravitational_anomalies jsonb DEFAULT '[]',
  competing_fields jsonb DEFAULT '[]',
  attractors jsonb DEFAULT '[]',
  detractors jsonb DEFAULT '[]',
  field_trend text DEFAULT 'stable' CHECK (field_trend IN ('collapsing','weakening','stable','strengthening','surging')),
  rank_global integer,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gwsm_gravity_target ON public.gwsm_gravity_field(target, target_type);
CREATE INDEX idx_gwsm_gravity_score ON public.gwsm_gravity_field(gravity_score DESC);

-- RLS
ALTER TABLE public.gwsm_wealth_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gwsm_capital_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gwsm_generational_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gwsm_risk_entropy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gwsm_gravity_field ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read wealth map" ON public.gwsm_wealth_map FOR SELECT USING (true);
CREATE POLICY "Public read capital flows" ON public.gwsm_capital_flows FOR SELECT USING (true);
CREATE POLICY "Public read generational" ON public.gwsm_generational_forecasts FOR SELECT USING (true);
CREATE POLICY "Public read risk entropy" ON public.gwsm_risk_entropy FOR SELECT USING (true);
CREATE POLICY "Public read gravity field" ON public.gwsm_gravity_field FOR SELECT USING (true);

-- Trigger: emit critical signal on systemic instability
CREATE OR REPLACE FUNCTION public.fn_gwsm_systemic_alert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.systemic_instability_score >= 75 OR NEW.rebalancing_urgency = 'critical' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'gwsm_systemic_instability',
      'gwsm_entropy',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'scope', NEW.scope,
        'geography', NEW.geography,
        'entropy_index', NEW.entropy_index,
        'instability_score', NEW.systemic_instability_score,
        'crisis_prob_6m', NEW.crisis_probability_6m,
        'urgency', NEW.rebalancing_urgency
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gwsm_systemic_alert
  AFTER INSERT ON public.gwsm_risk_entropy
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_gwsm_systemic_alert();