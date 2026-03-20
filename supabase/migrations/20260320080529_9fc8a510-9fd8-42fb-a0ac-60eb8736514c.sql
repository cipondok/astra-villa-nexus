
-- ═══════════════════════════════════════════════════════════════
-- FYCS: 50-Year Capital Civilization Strategy
-- ═══════════════════════════════════════════════════════════════

-- 1️⃣ Urban Expansion Macrocycle Model
CREATE TABLE public.fycs_urban_macrocycle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  region TEXT,
  decade_horizon INT NOT NULL DEFAULT 1,
  megacity_probability NUMERIC DEFAULT 0,
  urbanization_rate NUMERIC DEFAULT 0,
  infrastructure_wave_phase TEXT DEFAULT 'pre_investment',
  infrastructure_investment_usd NUMERIC DEFAULT 0,
  demographic_migration_net NUMERIC DEFAULT 0,
  population_projection_m NUMERIC DEFAULT 0,
  density_trajectory TEXT DEFAULT 'expanding',
  climate_resilience_score NUMERIC DEFAULT 0,
  smart_city_readiness NUMERIC DEFAULT 0,
  macrocycle_phase TEXT DEFAULT 'emergence',
  macrocycle_confidence NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fycs_urban_macrocycle ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fycs_urban_macrocycle" ON public.fycs_urban_macrocycle FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fycs_urban_macrocycle" ON public.fycs_urban_macrocycle FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_fycs_urban_macro_city ON public.fycs_urban_macrocycle(city);
CREATE INDEX idx_fycs_urban_macro_decade ON public.fycs_urban_macrocycle(decade_horizon);

-- 2️⃣ Capital Flow Gravity Mapping
CREATE TABLE public.fycs_capital_gravity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  cluster_type TEXT DEFAULT 'emerging',
  liquidity_concentration NUMERIC DEFAULT 0,
  institutional_capital_usd NUMERIC DEFAULT 0,
  data_transparency_score NUMERIC DEFAULT 0,
  technology_ecosystem_depth NUMERIC DEFAULT 0,
  gravity_pull_index NUMERIC DEFAULT 0,
  gravity_tier TEXT DEFAULT 'emerging',
  capital_velocity NUMERIC DEFAULT 0,
  competing_clusters INT DEFAULT 0,
  decade_horizon INT NOT NULL DEFAULT 1,
  trajectory TEXT DEFAULT 'accelerating',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fycs_capital_gravity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fycs_capital_gravity" ON public.fycs_capital_gravity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fycs_capital_gravity" ON public.fycs_capital_gravity FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_fycs_capital_gravity_tier ON public.fycs_capital_gravity(gravity_tier);

-- 3️⃣ Economic Stability Contribution
CREATE TABLE public.fycs_economic_stability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  market_inefficiency_reduction NUMERIC DEFAULT 0,
  housing_supply_resilience NUMERIC DEFAULT 0,
  asset_allocation_discipline NUMERIC DEFAULT 0,
  price_discovery_accuracy NUMERIC DEFAULT 0,
  volatility_dampening NUMERIC DEFAULT 0,
  systemic_risk_contribution NUMERIC DEFAULT 0,
  stability_composite_score NUMERIC DEFAULT 0,
  stability_tier TEXT DEFAULT 'moderate',
  platform_contribution_pct NUMERIC DEFAULT 0,
  decade_horizon INT NOT NULL DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fycs_economic_stability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fycs_economic_stability" ON public.fycs_economic_stability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fycs_economic_stability" ON public.fycs_economic_stability FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_fycs_stability_tier ON public.fycs_economic_stability(stability_tier);

-- 4️⃣ Innovation Wave Synchronization
CREATE TABLE public.fycs_innovation_waves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wave_name TEXT NOT NULL,
  wave_type TEXT NOT NULL DEFAULT 'technology',
  current_phase TEXT DEFAULT 'early_adoption',
  adoption_pct NUMERIC DEFAULT 0,
  real_estate_cycle_phase TEXT DEFAULT 'expansion',
  synchronization_score NUMERIC DEFAULT 0,
  platform_positioning TEXT DEFAULT 'observer',
  opportunity_window_years INT DEFAULT 5,
  disruption_intensity NUMERIC DEFAULT 0,
  market_impact_multiplier NUMERIC DEFAULT 1,
  decade_horizon INT NOT NULL DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fycs_innovation_waves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fycs_innovation_waves" ON public.fycs_innovation_waves FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fycs_innovation_waves" ON public.fycs_innovation_waves FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_fycs_innovation_phase ON public.fycs_innovation_waves(current_phase);

-- 5️⃣ Multi-Decade Strategic Positioning
CREATE TABLE public.fycs_strategic_positioning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_domain TEXT NOT NULL,
  capability_reinvention_score NUMERIC DEFAULT 0,
  geographic_diversification_index NUMERIC DEFAULT 0,
  monetization_adaptability NUMERIC DEFAULT 0,
  relevance_score NUMERIC DEFAULT 0,
  competitive_moat_depth NUMERIC DEFAULT 0,
  brand_permanence_index NUMERIC DEFAULT 0,
  ecosystem_lock_in NUMERIC DEFAULT 0,
  strategic_resilience NUMERIC DEFAULT 0,
  decade_horizon INT NOT NULL DEFAULT 1,
  risk_scenario TEXT DEFAULT 'base_case',
  positioning_tier TEXT DEFAULT 'strong',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fycs_strategic_positioning ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fycs_strategic_positioning" ON public.fycs_strategic_positioning FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fycs_strategic_positioning" ON public.fycs_strategic_positioning FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_fycs_strategic_tier ON public.fycs_strategic_positioning(positioning_tier);
CREATE INDEX idx_fycs_strategic_decade ON public.fycs_strategic_positioning(decade_horizon);

-- Trigger: signal when macrocycle reaches megacity threshold
CREATE OR REPLACE FUNCTION notify_fycs_megacity_formation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.megacity_probability >= 0.85 AND NEW.macrocycle_phase = 'megacity_formation' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('fycs_megacity_formation', 'fycs_urban_macrocycle', NEW.id, 'high',
      json_build_object('city', NEW.city, 'probability', NEW.megacity_probability, 'decade', NEW.decade_horizon)::jsonb);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fycs_megacity
AFTER INSERT OR UPDATE ON public.fycs_urban_macrocycle
FOR EACH ROW EXECUTE FUNCTION notify_fycs_megacity_formation();
