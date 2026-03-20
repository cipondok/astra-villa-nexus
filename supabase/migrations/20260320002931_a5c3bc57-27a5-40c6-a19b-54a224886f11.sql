
-- ═══════════════════════════════════════════════════════════
-- AI CIVILIZATIONAL WEALTH STABILITY ENGINE (CWSE)
-- ═══════════════════════════════════════════════════════════

-- 1️⃣ Structural Wealth Resilience Monitoring
CREATE TABLE public.cwse_structural_resilience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  country text NOT NULL DEFAULT 'Global',
  bubble_formation_index numeric NOT NULL DEFAULT 0,
  systemic_leverage_ratio numeric NOT NULL DEFAULT 0,
  leverage_acceleration numeric NOT NULL DEFAULT 0,
  demographic_dependency_ratio numeric NOT NULL DEFAULT 0,
  dependency_trend text NOT NULL DEFAULT 'stable',
  inequality_gini_index numeric NOT NULL DEFAULT 0,
  inequality_stress_score numeric NOT NULL DEFAULT 0,
  housing_affordability_index numeric NOT NULL DEFAULT 100,
  real_wage_growth_pct numeric NOT NULL DEFAULT 0,
  debt_to_gdp_pct numeric NOT NULL DEFAULT 0,
  composite_resilience_score numeric NOT NULL DEFAULT 50,
  risk_regime text NOT NULL DEFAULT 'stable',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cwse_structural_resilience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_cwse_resilience" ON public.cwse_structural_resilience FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_cwse_resilience_region ON public.cwse_structural_resilience (region);
CREATE INDEX idx_cwse_resilience_regime ON public.cwse_structural_resilience (risk_regime);

-- 2️⃣ Stability Intervention Scenario Modeling
CREATE TABLE public.cwse_intervention_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name text NOT NULL,
  region text NOT NULL,
  intervention_type text NOT NULL DEFAULT 'policy_rate',
  policy_lever text NOT NULL DEFAULT '',
  policy_magnitude numeric NOT NULL DEFAULT 0,
  capital_rebalance_pct numeric NOT NULL DEFAULT 0,
  fiscal_sustainability_score numeric NOT NULL DEFAULT 50,
  gdp_impact_pct numeric NOT NULL DEFAULT 0,
  inflation_impact_pct numeric NOT NULL DEFAULT 0,
  employment_impact_pct numeric NOT NULL DEFAULT 0,
  housing_market_impact_pct numeric NOT NULL DEFAULT 0,
  time_to_effect_months integer NOT NULL DEFAULT 12,
  effectiveness_score numeric NOT NULL DEFAULT 50,
  side_effect_risk numeric NOT NULL DEFAULT 0,
  scenario_outcome text NOT NULL DEFAULT 'neutral',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cwse_intervention_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_cwse_interventions" ON public.cwse_intervention_scenarios FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_cwse_intervention_region ON public.cwse_intervention_scenarios (region);
CREATE INDEX idx_cwse_intervention_type ON public.cwse_intervention_scenarios (intervention_type);

-- 3️⃣ Multi-Generational Wealth Preservation
CREATE TABLE public.cwse_generational_wealth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  generation_cohort text NOT NULL DEFAULT 'millennial',
  retirement_demand_index numeric NOT NULL DEFAULT 0,
  housing_demand_pressure numeric NOT NULL DEFAULT 0,
  productivity_growth_pct numeric NOT NULL DEFAULT 0,
  asset_inflation_pct numeric NOT NULL DEFAULT 0,
  productivity_asset_gap numeric NOT NULL DEFAULT 0,
  intergenerational_transfer_usd numeric NOT NULL DEFAULT 0,
  transfer_efficiency_pct numeric NOT NULL DEFAULT 0,
  wealth_concentration_top10_pct numeric NOT NULL DEFAULT 0,
  social_mobility_index numeric NOT NULL DEFAULT 50,
  preservation_risk_score numeric NOT NULL DEFAULT 50,
  generational_equity_score numeric NOT NULL DEFAULT 50,
  forecast_horizon_years integer NOT NULL DEFAULT 30,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cwse_generational_wealth ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_cwse_generational" ON public.cwse_generational_wealth FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_cwse_gen_region ON public.cwse_generational_wealth (region);
CREATE INDEX idx_cwse_gen_cohort ON public.cwse_generational_wealth (generation_cohort);

-- 4️⃣ Economic Shock Absorption Strategy
CREATE TABLE public.cwse_shock_absorption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  shock_type text NOT NULL DEFAULT 'recession',
  early_warning_score numeric NOT NULL DEFAULT 0,
  warning_signals text[] NOT NULL DEFAULT '{}',
  capital_buffer_adequacy_pct numeric NOT NULL DEFAULT 0,
  diversification_benefit_score numeric NOT NULL DEFAULT 0,
  institutional_preparedness numeric NOT NULL DEFAULT 50,
  recommended_hedge_allocation_pct numeric NOT NULL DEFAULT 0,
  estimated_drawdown_pct numeric NOT NULL DEFAULT 0,
  recovery_time_months integer NOT NULL DEFAULT 24,
  absorption_capacity_score numeric NOT NULL DEFAULT 50,
  deployment_adjustment text NOT NULL DEFAULT 'hold',
  urgency text NOT NULL DEFAULT 'monitor',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cwse_shock_absorption ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_cwse_shock" ON public.cwse_shock_absorption FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_cwse_shock_region ON public.cwse_shock_absorption (region);
CREATE INDEX idx_cwse_shock_type ON public.cwse_shock_absorption (shock_type);
CREATE INDEX idx_cwse_shock_urgency ON public.cwse_shock_absorption (urgency);

-- 5️⃣ Civilization-Scale Insight Dashboard
CREATE TABLE public.cwse_civilization_insight (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  global_stability_index numeric NOT NULL DEFAULT 50,
  cross_sector_sync_score numeric NOT NULL DEFAULT 50,
  coordinated_risk_level text NOT NULL DEFAULT 'moderate',
  key_stability_drivers text[] NOT NULL DEFAULT '{}',
  key_risk_factors text[] NOT NULL DEFAULT '{}',
  strategic_recommendation text NOT NULL DEFAULT '',
  confidence_score numeric NOT NULL DEFAULT 50,
  signal_synthesis_count integer NOT NULL DEFAULT 0,
  era_classification text NOT NULL DEFAULT 'transition',
  outlook_horizon_years integer NOT NULL DEFAULT 10,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cwse_civilization_insight ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_cwse_insight" ON public.cwse_civilization_insight FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_cwse_insight_region ON public.cwse_civilization_insight (region);
CREATE INDEX idx_cwse_insight_risk ON public.cwse_civilization_insight (coordinated_risk_level);

-- ── Trigger: emit signal on elevated systemic risk ──
CREATE OR REPLACE FUNCTION public.fn_cwse_risk_alert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.risk_regime IN ('elevated', 'critical') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'cwse_systemic_risk_alert',
      'cwse_structural_resilience',
      NEW.id,
      CASE WHEN NEW.risk_regime = 'critical' THEN 'critical' ELSE 'high' END,
      jsonb_build_object('region', NEW.region, 'risk_regime', NEW.risk_regime, 'composite_resilience', NEW.composite_resilience_score, 'bubble_index', NEW.bubble_formation_index)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cwse_risk_alert
  AFTER INSERT OR UPDATE ON public.cwse_structural_resilience
  FOR EACH ROW EXECUTE FUNCTION public.fn_cwse_risk_alert();
