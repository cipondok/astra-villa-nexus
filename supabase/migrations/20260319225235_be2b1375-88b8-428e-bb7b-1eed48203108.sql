
-- ══════════════════════════════════════════════════════════════
-- CEOS: Civilization-Scale Economic Operating System
-- ══════════════════════════════════════════════════════════════

-- 1) Global Development Coordination Engine
CREATE TABLE public.ceos_development_coordination (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  district text,
  segment_type text,
  -- Supply pipeline
  construction_pipeline_units int NOT NULL DEFAULT 0,
  construction_capacity_pct numeric NOT NULL DEFAULT 0,
  infrastructure_investment_usd numeric NOT NULL DEFAULT 0,
  infrastructure_readiness_score numeric NOT NULL DEFAULT 0,
  -- Population dynamics
  population_migration_net int NOT NULL DEFAULT 0,
  population_growth_rate numeric NOT NULL DEFAULT 0,
  urbanization_velocity numeric NOT NULL DEFAULT 0,
  -- Property supply
  active_supply_units int NOT NULL DEFAULT 0,
  pipeline_delivery_months numeric NOT NULL DEFAULT 0,
  supply_demand_ratio numeric NOT NULL DEFAULT 1.0,
  -- Coordination
  synchronization_score numeric NOT NULL DEFAULT 0,
  bottleneck_type text, -- 'labor','permits','materials','capital','land'
  bottleneck_severity numeric NOT NULL DEFAULT 0,
  coordination_status text NOT NULL DEFAULT 'monitoring', -- 'monitoring','intervention','critical','resolved'
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ceos_dev_city ON public.ceos_development_coordination(city);
CREATE INDEX idx_ceos_dev_sync ON public.ceos_development_coordination(synchronization_score DESC);

-- 2) Economic Signal Routing Layer
CREATE TABLE public.ceos_signal_routing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type text NOT NULL, -- 'investor_demand','developer_capacity','government_policy','vendor_supply','urban_plan'
  source_entity_type text NOT NULL, -- 'investor','developer','government','vendor','planner'
  source_entity_id text,
  target_entity_type text NOT NULL,
  target_entity_id text,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  signal_strength numeric NOT NULL DEFAULT 0, -- 0-100
  signal_payload jsonb NOT NULL DEFAULT '{}',
  propagation_speed text NOT NULL DEFAULT 'normal', -- 'instant','fast','normal','slow'
  signal_decay_hours int NOT NULL DEFAULT 24,
  is_amplified boolean NOT NULL DEFAULT false,
  amplification_factor numeric NOT NULL DEFAULT 1.0,
  routing_status text NOT NULL DEFAULT 'pending', -- 'pending','routed','delivered','expired','blocked'
  routed_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ceos_signal_type ON public.ceos_signal_routing(signal_type);
CREATE INDEX idx_ceos_signal_city ON public.ceos_signal_routing(city);
CREATE INDEX idx_ceos_signal_status ON public.ceos_signal_routing(routing_status);

-- 3) Autonomous Market Equilibrium Controller
CREATE TABLE public.ceos_market_equilibrium (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  district text,
  -- Housing balance
  housing_shortage_index numeric NOT NULL DEFAULT 0, -- negative = shortage, positive = surplus
  speculative_oversupply_risk numeric NOT NULL DEFAULT 0, -- 0-100
  rental_affordability_index numeric NOT NULL DEFAULT 50, -- 0-100
  investor_return_index numeric NOT NULL DEFAULT 50, -- 0-100
  -- Equilibrium
  equilibrium_score numeric NOT NULL DEFAULT 50, -- 0-100 (50 = perfect balance)
  equilibrium_phase text NOT NULL DEFAULT 'balanced', -- 'shortage','tightening','balanced','loosening','oversupply'
  mean_reversion_pressure numeric NOT NULL DEFAULT 0, -- -100 to 100
  intervention_urgency text NOT NULL DEFAULT 'none', -- 'none','watch','moderate','urgent','critical'
  -- Control actions
  recommended_supply_action text, -- 'accelerate_construction','slow_permits','incentivize_rental','restrict_speculation'
  recommended_demand_action text, -- 'attract_investment','cool_speculation','subsidize_housing','open_foreign_buyers'
  control_loop_confidence numeric NOT NULL DEFAULT 0, -- 0-100
  last_intervention_at timestamptz,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ceos_eq_city ON public.ceos_market_equilibrium(city);
CREATE INDEX idx_ceos_eq_score ON public.ceos_market_equilibrium(equilibrium_score);

-- 4) Societal Prosperity Optimization Model
CREATE TABLE public.ceos_prosperity_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  -- Core KPIs
  wealth_accessibility_score numeric NOT NULL DEFAULT 0, -- 0-100
  housing_stability_score numeric NOT NULL DEFAULT 0, -- 0-100
  urban_livability_score numeric NOT NULL DEFAULT 0, -- 0-100
  economic_resilience_score numeric NOT NULL DEFAULT 0, -- 0-100
  -- Sub-dimensions
  homeownership_rate_pct numeric NOT NULL DEFAULT 0,
  median_price_to_income_ratio numeric NOT NULL DEFAULT 0,
  rental_burden_pct numeric NOT NULL DEFAULT 0, -- % of income spent on rent
  infrastructure_quality_score numeric NOT NULL DEFAULT 0,
  employment_diversity_index numeric NOT NULL DEFAULT 0,
  green_space_per_capita_sqm numeric NOT NULL DEFAULT 0,
  -- Composite
  prosperity_composite_score numeric NOT NULL DEFAULT 0, -- 0-100
  prosperity_tier text NOT NULL DEFAULT 'developing', -- 'thriving','growing','developing','struggling','crisis'
  trajectory text NOT NULL DEFAULT 'stable', -- 'improving','stable','declining','critical_decline'
  forecast_5y_score numeric,
  policy_recommendations jsonb NOT NULL DEFAULT '[]',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ceos_prosperity_city ON public.ceos_prosperity_index(city);
CREATE INDEX idx_ceos_prosperity_composite ON public.ceos_prosperity_index(prosperity_composite_score DESC);

-- 5) Modular Governance & Sovereign Integration
CREATE TABLE public.ceos_governance_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  country_name text NOT NULL,
  -- Regulation framework
  regulation_framework_version text NOT NULL DEFAULT '1.0',
  ownership_restriction_level text NOT NULL DEFAULT 'moderate', -- 'open','moderate','restricted','closed'
  foreign_ownership_rules jsonb NOT NULL DEFAULT '{}',
  tax_regime_summary jsonb NOT NULL DEFAULT '{}',
  zoning_flexibility_score numeric NOT NULL DEFAULT 50, -- 0-100
  -- PPP readiness
  ppp_readiness_score numeric NOT NULL DEFAULT 0, -- 0-100
  smart_city_integration_level text NOT NULL DEFAULT 'none', -- 'none','pilot','partial','advanced','full'
  digital_governance_score numeric NOT NULL DEFAULT 0, -- 0-100
  -- Adoption
  platform_adoption_phase text NOT NULL DEFAULT 'prospect', -- 'prospect','pilot','scaling','mature','sovereign_partner'
  active_city_count int NOT NULL DEFAULT 0,
  government_api_connected boolean NOT NULL DEFAULT false,
  data_sharing_agreement boolean NOT NULL DEFAULT false,
  -- Risk
  policy_stability_score numeric NOT NULL DEFAULT 50, -- 0-100
  geopolitical_risk_score numeric NOT NULL DEFAULT 0, -- 0-100
  regulatory_change_velocity numeric NOT NULL DEFAULT 0, -- changes per year
  last_policy_change_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ceos_gov_country ON public.ceos_governance_modules(country);

-- Trigger: emit signal when equilibrium goes critical
CREATE OR REPLACE FUNCTION public.fn_ceos_equilibrium_alert()
RETURNS trigger AS $$
BEGIN
  IF NEW.intervention_urgency IN ('urgent', 'critical') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'ceos_equilibrium_critical',
      'ceos_market_equilibrium',
      NEW.id::text,
      CASE WHEN NEW.intervention_urgency = 'critical' THEN 'critical' ELSE 'high' END,
      jsonb_build_object(
        'city', NEW.city,
        'equilibrium_score', NEW.equilibrium_score,
        'phase', NEW.equilibrium_phase,
        'urgency', NEW.intervention_urgency
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ceos_equilibrium_alert
AFTER INSERT OR UPDATE ON public.ceos_market_equilibrium
FOR EACH ROW EXECUTE FUNCTION public.fn_ceos_equilibrium_alert();

-- Enable RLS
ALTER TABLE public.ceos_development_coordination ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceos_signal_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceos_market_equilibrium ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceos_prosperity_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceos_governance_modules ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Authenticated read ceos_development_coordination" ON public.ceos_development_coordination FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read ceos_signal_routing" ON public.ceos_signal_routing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read ceos_market_equilibrium" ON public.ceos_market_equilibrium FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read ceos_prosperity_index" ON public.ceos_prosperity_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read ceos_governance_modules" ON public.ceos_governance_modules FOR SELECT TO authenticated USING (true);

-- Service role insert/update for edge functions
CREATE POLICY "Service insert ceos_development_coordination" ON public.ceos_development_coordination FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update ceos_development_coordination" ON public.ceos_development_coordination FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert ceos_signal_routing" ON public.ceos_signal_routing FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update ceos_signal_routing" ON public.ceos_signal_routing FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert ceos_market_equilibrium" ON public.ceos_market_equilibrium FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update ceos_market_equilibrium" ON public.ceos_market_equilibrium FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert ceos_prosperity_index" ON public.ceos_prosperity_index FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update ceos_prosperity_index" ON public.ceos_prosperity_index FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert ceos_governance_modules" ON public.ceos_governance_modules FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update ceos_governance_modules" ON public.ceos_governance_modules FOR UPDATE TO service_role USING (true);
