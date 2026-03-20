
-- =====================================================
-- GLOBAL CAPITAL CONSCIOUSNESS ENGINE (GCCE)
-- =====================================================

-- 1. Capital Flow Awareness Layer
CREATE TABLE public.gcce_capital_flow_awareness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  sector TEXT DEFAULT 'residential',
  inflow_velocity_usd NUMERIC(16,2) DEFAULT 0,
  outflow_velocity_usd NUMERIC(16,2) DEFAULT 0,
  net_flow_usd NUMERIC(16,2) DEFAULT 0,
  flow_direction TEXT DEFAULT 'neutral',
  sector_rotation_signal TEXT,
  liquidity_concentration_pct NUMERIC(5,2) DEFAULT 0,
  opportunity_corridor_score NUMERIC(5,2) DEFAULT 0,
  investor_sentiment_index NUMERIC(5,2) DEFAULT 50,
  cross_border_flow_pct NUMERIC(5,2) DEFAULT 0,
  flow_momentum TEXT DEFAULT 'stable',
  period_start DATE,
  period_end DATE,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Systemic Risk Mapping Engine
CREATE TABLE public.gcce_systemic_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  overheat_index NUMERIC(5,2) DEFAULT 0,
  debt_stress_indicator NUMERIC(5,2) DEFAULT 0,
  capital_withdrawal_rate NUMERIC(6,3) DEFAULT 0,
  shock_propagation_risk NUMERIC(5,2) DEFAULT 0,
  price_to_income_ratio NUMERIC(6,2) DEFAULT 0,
  credit_growth_deviation NUMERIC(6,2) DEFAULT 0,
  vacancy_rate_trend NUMERIC(5,2) DEFAULT 0,
  composite_systemic_risk NUMERIC(5,2) DEFAULT 0,
  risk_regime TEXT DEFAULT 'normal',
  early_warnings JSONB DEFAULT '[]',
  contagion_pathways JSONB DEFAULT '[]',
  stress_test_scenario TEXT,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Long-Term Opportunity Cycle Intelligence
CREATE TABLE public.gcce_opportunity_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  cycle_phase TEXT DEFAULT 'recovery',
  phase_maturity_pct NUMERIC(5,2) DEFAULT 0,
  demographic_growth_score NUMERIC(5,2) DEFAULT 0,
  infrastructure_pipeline_score NUMERIC(5,2) DEFAULT 0,
  urban_migration_intensity NUMERIC(5,2) DEFAULT 0,
  yield_compression_rate NUMERIC(6,3) DEFAULT 0,
  yield_spread_vs_benchmark NUMERIC(6,3) DEFAULT 0,
  opportunity_window_months INT,
  structural_advantage_score NUMERIC(5,2) DEFAULT 0,
  long_term_conviction_index NUMERIC(5,2) DEFAULT 0,
  cycle_timing_signal TEXT DEFAULT 'hold',
  forecast_horizon_years INT DEFAULT 5,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Strategic Scenario Simulation
CREATE TABLE public.gcce_scenario_simulation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  scenario_type TEXT DEFAULT 'base_case',
  region TEXT NOT NULL,
  city TEXT,
  capital_deployed_usd NUMERIC(16,2) DEFAULT 0,
  projected_irr_pct NUMERIC(6,2) DEFAULT 0,
  projected_multiple NUMERIC(5,2) DEFAULT 1,
  downside_drawdown_pct NUMERIC(5,2) DEFAULT 0,
  upside_potential_pct NUMERIC(5,2) DEFAULT 0,
  risk_adjusted_return NUMERIC(6,2) DEFAULT 0,
  regional_exposure_pct NUMERIC(5,2) DEFAULT 0,
  optimal_allocation_pct NUMERIC(5,2) DEFAULT 0,
  stress_resilience_score NUMERIC(5,2) DEFAULT 0,
  scenario_probability_pct NUMERIC(5,2) DEFAULT 50,
  assumptions JSONB DEFAULT '{}',
  simulation_result JSONB DEFAULT '{}',
  simulated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Insight Visualization & Decision Support
CREATE TABLE public.gcce_decision_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  macro_signal_summary TEXT,
  allocation_recommendation TEXT,
  confidence_level NUMERIC(5,2) DEFAULT 0,
  key_insight TEXT,
  supporting_signals JSONB DEFAULT '[]',
  risk_overlay_score NUMERIC(5,2) DEFAULT 0,
  opportunity_overlay_score NUMERIC(5,2) DEFAULT 0,
  timing_recommendation TEXT DEFAULT 'monitor',
  investment_thesis TEXT,
  decision_urgency TEXT DEFAULT 'low',
  target_investor_profile TEXT DEFAULT 'institutional',
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.gcce_capital_flow_awareness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcce_systemic_risk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcce_opportunity_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcce_scenario_simulation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcce_decision_support ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read gcce_capital_flow_awareness" ON public.gcce_capital_flow_awareness FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gcce_systemic_risk" ON public.gcce_systemic_risk FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gcce_opportunity_cycles" ON public.gcce_opportunity_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gcce_scenario_simulation" ON public.gcce_scenario_simulation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gcce_decision_support" ON public.gcce_decision_support FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service write gcce_capital_flow_awareness" ON public.gcce_capital_flow_awareness FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd gcce_capital_flow_awareness" ON public.gcce_capital_flow_awareness FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write gcce_systemic_risk" ON public.gcce_systemic_risk FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd gcce_systemic_risk" ON public.gcce_systemic_risk FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write gcce_opportunity_cycles" ON public.gcce_opportunity_cycles FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd gcce_opportunity_cycles" ON public.gcce_opportunity_cycles FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write gcce_scenario_simulation" ON public.gcce_scenario_simulation FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd gcce_scenario_simulation" ON public.gcce_scenario_simulation FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write gcce_decision_support" ON public.gcce_decision_support FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd gcce_decision_support" ON public.gcce_decision_support FOR UPDATE TO service_role USING (true);

-- Indexes
CREATE INDEX idx_gcce_flow_net ON public.gcce_capital_flow_awareness(net_flow_usd DESC);
CREATE INDEX idx_gcce_flow_region ON public.gcce_capital_flow_awareness(region, city);
CREATE INDEX idx_gcce_risk_composite ON public.gcce_systemic_risk(composite_systemic_risk DESC);
CREATE INDEX idx_gcce_cycle_phase ON public.gcce_opportunity_cycles(cycle_phase, long_term_conviction_index DESC);
CREATE INDEX idx_gcce_scenario_type ON public.gcce_scenario_simulation(scenario_type, risk_adjusted_return DESC);
CREATE INDEX idx_gcce_decision_urgency ON public.gcce_decision_support(decision_urgency, confidence_level DESC);

-- Trigger: emit signal on systemic risk regime change
CREATE OR REPLACE FUNCTION public.gcce_systemic_risk_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.risk_regime IN ('elevated', 'critical') AND NEW.composite_systemic_risk >= 65 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'gcce_systemic_risk_alert',
      'gcce_risk',
      NEW.id::text,
      CASE WHEN NEW.risk_regime = 'critical' THEN 'critical' ELSE 'high' END,
      jsonb_build_object(
        'city', NEW.city, 'region', NEW.region,
        'risk_regime', NEW.risk_regime,
        'composite_risk', NEW.composite_systemic_risk,
        'overheat', NEW.overheat_index,
        'debt_stress', NEW.debt_stress_indicator
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_gcce_systemic_risk_alert
AFTER INSERT OR UPDATE ON public.gcce_systemic_risk
FOR EACH ROW EXECUTE FUNCTION public.gcce_systemic_risk_alert();
