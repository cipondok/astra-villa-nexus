
-- ═══════════════════════════════════════════════════════════
-- INTERPLANETARY ECONOMIC EXPANSION SIMULATOR (IEES)
-- ═══════════════════════════════════════════════════════════

-- 1️⃣ Frontier Settlement Growth
CREATE TABLE public.iees_frontier_settlement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frontier_zone text NOT NULL,
  region text NOT NULL DEFAULT 'Solar',
  population_wave_index numeric NOT NULL DEFAULT 0,
  migration_momentum numeric NOT NULL DEFAULT 0,
  infrastructure_phase text NOT NULL DEFAULT 'pre-deployment',
  infrastructure_readiness_pct numeric NOT NULL DEFAULT 0,
  transport_node_density numeric NOT NULL DEFAULT 0,
  energy_capacity_gw numeric NOT NULL DEFAULT 0,
  economic_cluster_count integer NOT NULL DEFAULT 0,
  cluster_diversity_score numeric NOT NULL DEFAULT 0,
  settlement_maturity_score numeric NOT NULL DEFAULT 0,
  projected_population_5y numeric DEFAULT NULL,
  growth_phase text NOT NULL DEFAULT 'pioneering',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.iees_frontier_settlement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_iees_frontier" ON public.iees_frontier_settlement FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_iees_frontier_zone ON public.iees_frontier_settlement (frontier_zone);
CREATE INDEX idx_iees_frontier_phase ON public.iees_frontier_settlement (growth_phase);

-- 2️⃣ Resource & Logistics Optimization
CREATE TABLE public.iees_resource_logistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frontier_zone text NOT NULL,
  supply_chain_resilience_score numeric NOT NULL DEFAULT 0,
  logistics_cost_index numeric NOT NULL DEFAULT 100,
  trade_route_count integer NOT NULL DEFAULT 0,
  trade_route_efficiency numeric NOT NULL DEFAULT 0,
  capital_at_risk_usd numeric NOT NULL DEFAULT 0,
  risk_adjusted_return_pct numeric NOT NULL DEFAULT 0,
  cost_compression_rate numeric NOT NULL DEFAULT 0,
  resource_self_sufficiency_pct numeric NOT NULL DEFAULT 0,
  critical_dependency_count integer NOT NULL DEFAULT 0,
  logistics_tier text NOT NULL DEFAULT 'nascent',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.iees_resource_logistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_iees_logistics" ON public.iees_resource_logistics FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_iees_logistics_zone ON public.iees_resource_logistics (frontier_zone);

-- 3️⃣ Economic Ecosystem Formation
CREATE TABLE public.iees_ecosystem_formation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frontier_zone text NOT NULL,
  housing_demand_units integer NOT NULL DEFAULT 0,
  housing_supply_units integer NOT NULL DEFAULT 0,
  housing_gap_pct numeric NOT NULL DEFAULT 0,
  service_industry_count integer NOT NULL DEFAULT 0,
  industrial_base_stage text NOT NULL DEFAULT 'extractive',
  financial_system_maturity text NOT NULL DEFAULT 'barter',
  gdp_equivalent_usd numeric NOT NULL DEFAULT 0,
  economic_complexity_index numeric NOT NULL DEFAULT 0,
  labor_market_depth_score numeric NOT NULL DEFAULT 0,
  ecosystem_maturity_score numeric NOT NULL DEFAULT 0,
  years_to_self_sustaining numeric DEFAULT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.iees_ecosystem_formation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_iees_ecosystem" ON public.iees_ecosystem_formation FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_iees_ecosystem_zone ON public.iees_ecosystem_formation (frontier_zone);
CREATE INDEX idx_iees_ecosystem_stage ON public.iees_ecosystem_formation (industrial_base_stage);

-- 4️⃣ Long-Term Scenario Simulation
CREATE TABLE public.iees_scenario_simulation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name text NOT NULL,
  frontier_zone text NOT NULL,
  governance_model text NOT NULL DEFAULT 'corporate_charter',
  funding_structure text NOT NULL DEFAULT 'venture_backed',
  sustainability_constraint text NOT NULL DEFAULT 'moderate',
  tech_breakthrough_assumed boolean NOT NULL DEFAULT false,
  time_horizon_years integer NOT NULL DEFAULT 50,
  projected_population numeric NOT NULL DEFAULT 0,
  projected_gdp_usd numeric NOT NULL DEFAULT 0,
  infrastructure_investment_usd numeric NOT NULL DEFAULT 0,
  roi_estimate_pct numeric NOT NULL DEFAULT 0,
  risk_score numeric NOT NULL DEFAULT 50,
  success_probability_pct numeric NOT NULL DEFAULT 50,
  scenario_outcome text NOT NULL DEFAULT 'uncertain',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.iees_scenario_simulation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_iees_scenarios" ON public.iees_scenario_simulation FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_iees_scenario_zone ON public.iees_scenario_simulation (frontier_zone);
CREATE INDEX idx_iees_scenario_outcome ON public.iees_scenario_simulation (scenario_outcome);

-- 5️⃣ Strategic Decision Support
CREATE TABLE public.iees_decision_support (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frontier_zone text NOT NULL,
  opportunity_score numeric NOT NULL DEFAULT 0,
  risk_overlay_score numeric NOT NULL DEFAULT 0,
  investment_readiness text NOT NULL DEFAULT 'speculative',
  recommended_allocation_pct numeric NOT NULL DEFAULT 0,
  time_to_breakeven_years numeric DEFAULT NULL,
  confidence_score numeric NOT NULL DEFAULT 50,
  key_drivers text[] NOT NULL DEFAULT '{}',
  strategic_recommendation text NOT NULL DEFAULT '',
  urgency_rating text NOT NULL DEFAULT 'monitor',
  signal_count integer NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.iees_decision_support ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_iees_decisions" ON public.iees_decision_support FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_iees_decision_zone ON public.iees_decision_support (frontier_zone);
CREATE INDEX idx_iees_decision_urgency ON public.iees_decision_support (urgency_rating);

-- ── Trigger: emit signal on high-opportunity frontier zone ──
CREATE OR REPLACE FUNCTION public.fn_iees_opportunity_signal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.opportunity_score >= 75 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'iees_frontier_opportunity',
      'iees_decision_support',
      NEW.id,
      'high',
      jsonb_build_object('frontier_zone', NEW.frontier_zone, 'opportunity_score', NEW.opportunity_score, 'investment_readiness', NEW.investment_readiness)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_iees_opportunity_signal
  AFTER INSERT OR UPDATE ON public.iees_decision_support
  FOR EACH ROW EXECUTE FUNCTION public.fn_iees_opportunity_signal();
