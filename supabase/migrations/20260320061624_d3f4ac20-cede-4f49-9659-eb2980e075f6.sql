
-- ═══════════════════════════════════════════════════════════════
-- AI-DRIVEN PLANETARY GOVERNANCE CAPITAL MODEL (PGCM)
-- ═══════════════════════════════════════════════════════════════

-- 1. Global Capital Allocation Intelligence
CREATE TABLE public.pgcm_capital_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Global',
  infra_funding_gap_usd NUMERIC NOT NULL DEFAULT 0,
  cross_border_flow_index NUMERIC NOT NULL DEFAULT 0,
  long_term_return_score NUMERIC NOT NULL DEFAULT 0,
  resilience_trade_off NUMERIC NOT NULL DEFAULT 0,
  capital_efficiency_ratio NUMERIC NOT NULL DEFAULT 0,
  allocation_priority TEXT NOT NULL DEFAULT 'standard',
  risk_adjusted_return NUMERIC NOT NULL DEFAULT 0,
  allocation_composite NUMERIC NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pgcm_capital_allocation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read pgcm_capital_allocation" ON public.pgcm_capital_allocation FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_pgcm_alloc_region ON public.pgcm_capital_allocation(region);
CREATE INDEX idx_pgcm_alloc_computed ON public.pgcm_capital_allocation(computed_at DESC);

-- 2. Development Priority Optimization
CREATE TABLE public.pgcm_development_priority (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Global',
  urban_expansion_pressure NUMERIC NOT NULL DEFAULT 0,
  housing_need_index NUMERIC NOT NULL DEFAULT 0,
  mobility_infra_gap NUMERIC NOT NULL DEFAULT 0,
  climate_adaptation_urgency NUMERIC NOT NULL DEFAULT 0,
  development_priority_score NUMERIC NOT NULL DEFAULT 0,
  priority_tier TEXT NOT NULL DEFAULT 'medium',
  sequencing_recommendation TEXT,
  estimated_investment_usd NUMERIC NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pgcm_development_priority ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read pgcm_development_priority" ON public.pgcm_development_priority FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_pgcm_dev_region ON public.pgcm_development_priority(region);

-- 3. Institutional Coordination Layer
CREATE TABLE public.pgcm_institutional_coordination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Global',
  ppp_readiness_score NUMERIC NOT NULL DEFAULT 0,
  data_sharing_maturity NUMERIC NOT NULL DEFAULT 0,
  multi_region_sync_score NUMERIC NOT NULL DEFAULT 0,
  institutional_trust_index NUMERIC NOT NULL DEFAULT 0,
  coordination_composite NUMERIC NOT NULL DEFAULT 0,
  partnership_model TEXT NOT NULL DEFAULT 'bilateral',
  active_partnerships INTEGER NOT NULL DEFAULT 0,
  coordination_phase TEXT NOT NULL DEFAULT 'forming',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pgcm_institutional_coordination ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read pgcm_institutional_coordination" ON public.pgcm_institutional_coordination FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_pgcm_inst_region ON public.pgcm_institutional_coordination(region);

-- 4. Sovereign Investment Scenario Simulator
CREATE TABLE public.pgcm_sovereign_simulation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Global',
  scenario_name TEXT NOT NULL,
  policy_alignment_score NUMERIC NOT NULL DEFAULT 0,
  development_sequencing_efficiency NUMERIC NOT NULL DEFAULT 0,
  fiscal_sustainability_index NUMERIC NOT NULL DEFAULT 0,
  gdp_growth_impact_pct NUMERIC NOT NULL DEFAULT 0,
  employment_creation_index NUMERIC NOT NULL DEFAULT 0,
  debt_to_gdp_trajectory NUMERIC NOT NULL DEFAULT 0,
  success_probability NUMERIC NOT NULL DEFAULT 50,
  time_horizon_years INTEGER NOT NULL DEFAULT 15,
  simulation_status TEXT NOT NULL DEFAULT 'draft',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pgcm_sovereign_simulation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read pgcm_sovereign_simulation" ON public.pgcm_sovereign_simulation FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_pgcm_sov_region ON public.pgcm_sovereign_simulation(region);

-- 5. Strategic Governance Dashboard Insights
CREATE TABLE public.pgcm_governance_insight (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Global',
  governance_effectiveness NUMERIC NOT NULL DEFAULT 0,
  transparency_index NUMERIC NOT NULL DEFAULT 0,
  development_outcome_score NUMERIC NOT NULL DEFAULT 0,
  capital_deployment_efficiency NUMERIC NOT NULL DEFAULT 0,
  governance_composite NUMERIC NOT NULL DEFAULT 0,
  governance_tier TEXT NOT NULL DEFAULT 'developing',
  action_recommendations TEXT[],
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pgcm_governance_insight ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read pgcm_governance_insight" ON public.pgcm_governance_insight FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_pgcm_gov_region ON public.pgcm_governance_insight(region);

-- Trigger: emit signal on critical funding gaps
CREATE OR REPLACE FUNCTION public.emit_pgcm_funding_signal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.infra_funding_gap_usd >= 500000000000 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('pgcm_critical_funding_gap', 'pgcm_allocation', NEW.id::text, 'high',
      json_build_object('region', NEW.region, 'gap_usd', NEW.infra_funding_gap_usd, 'priority', NEW.allocation_priority)::jsonb);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_pgcm_funding_signal
  AFTER INSERT OR UPDATE ON public.pgcm_capital_allocation
  FOR EACH ROW EXECUTE FUNCTION public.emit_pgcm_funding_signal();
