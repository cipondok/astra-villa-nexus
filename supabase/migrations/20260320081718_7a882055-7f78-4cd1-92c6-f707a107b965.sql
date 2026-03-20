
-- ═══════════════════════════════════════════════════════════════
-- HYCB: 100-Year PropTech Civilization Blueprint
-- ═══════════════════════════════════════════════════════════════

-- 1️⃣ Century Urban Transformation Model
CREATE TABLE public.hycb_urban_transformation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  region TEXT,
  time_horizon TEXT NOT NULL DEFAULT 'near',
  horizon_year_start INT NOT NULL DEFAULT 0,
  horizon_year_end INT NOT NULL DEFAULT 20,
  digital_infrastructure_pct NUMERIC DEFAULT 0,
  intelligent_coordination_score NUMERIC DEFAULT 0,
  autonomous_optimization_score NUMERIC DEFAULT 0,
  population_projection_m NUMERIC DEFAULT 0,
  urban_density_trajectory TEXT DEFAULT 'expanding',
  climate_adaptation_readiness NUMERIC DEFAULT 0,
  transformation_phase TEXT DEFAULT 'digitization',
  transformation_confidence NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hycb_urban_transformation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read hycb_urban_transformation" ON public.hycb_urban_transformation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert hycb_urban_transformation" ON public.hycb_urban_transformation FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_hycb_urban_horizon ON public.hycb_urban_transformation(time_horizon);
CREATE INDEX idx_hycb_urban_city ON public.hycb_urban_transformation(city);

-- 2️⃣ Global Property Liquidity Evolution
CREATE TABLE public.hycb_liquidity_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_cluster TEXT NOT NULL,
  era TEXT NOT NULL DEFAULT 'current',
  transparency_index NUMERIC DEFAULT 0,
  cross_border_friction NUMERIC DEFAULT 100,
  dynamic_pricing_adoption NUMERIC DEFAULT 0,
  tokenization_penetration NUMERIC DEFAULT 0,
  settlement_speed_hours NUMERIC DEFAULT 720,
  liquidity_depth_score NUMERIC DEFAULT 0,
  institutional_participation_pct NUMERIC DEFAULT 0,
  retail_access_score NUMERIC DEFAULT 0,
  liquidity_evolution_tier TEXT DEFAULT 'opaque',
  year_horizon INT NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hycb_liquidity_evolution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read hycb_liquidity_evolution" ON public.hycb_liquidity_evolution FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert hycb_liquidity_evolution" ON public.hycb_liquidity_evolution FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_hycb_liquidity_tier ON public.hycb_liquidity_evolution(liquidity_evolution_tier);

-- 3️⃣ Infrastructure Intelligence Layer
CREATE TABLE public.hycb_infrastructure_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intelligence_domain TEXT NOT NULL,
  city TEXT,
  urban_planning_integration NUMERIC DEFAULT 0,
  climate_resilience_contribution NUMERIC DEFAULT 0,
  mobility_grid_coordination NUMERIC DEFAULT 0,
  energy_optimization_score NUMERIC DEFAULT 0,
  data_coverage_pct NUMERIC DEFAULT 0,
  decision_influence_index NUMERIC DEFAULT 0,
  infrastructure_composite NUMERIC DEFAULT 0,
  integration_tier TEXT DEFAULT 'advisory',
  year_horizon INT NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hycb_infrastructure_intelligence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read hycb_infrastructure_intelligence" ON public.hycb_infrastructure_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert hycb_infrastructure_intelligence" ON public.hycb_infrastructure_intelligence FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_hycb_infra_tier ON public.hycb_infrastructure_intelligence(integration_tier);

-- 4️⃣ Housing Market Stability Framework
CREATE TABLE public.hycb_housing_stability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  boom_bust_dampening NUMERIC DEFAULT 0,
  supply_equilibrium_score NUMERIC DEFAULT 0,
  affordability_sustainability NUMERIC DEFAULT 0,
  speculative_pressure_index NUMERIC DEFAULT 0,
  price_volatility_reduction NUMERIC DEFAULT 0,
  institutional_stabilizer_pct NUMERIC DEFAULT 0,
  platform_stabilization_contribution NUMERIC DEFAULT 0,
  stability_composite NUMERIC DEFAULT 0,
  stability_tier TEXT DEFAULT 'volatile',
  year_horizon INT NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hycb_housing_stability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read hycb_housing_stability" ON public.hycb_housing_stability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert hycb_housing_stability" ON public.hycb_housing_stability FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_hycb_stability_tier ON public.hycb_housing_stability(stability_tier);

-- 5️⃣ Multi-Generational Platform Relevance
CREATE TABLE public.hycb_platform_relevance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adaptation_domain TEXT NOT NULL,
  technology_paradigm_readiness NUMERIC DEFAULT 0,
  regulatory_adaptability NUMERIC DEFAULT 0,
  demographic_responsiveness NUMERIC DEFAULT 0,
  cultural_evolution_alignment NUMERIC DEFAULT 0,
  capability_reinvention_cycles INT DEFAULT 0,
  competitive_moat_durability NUMERIC DEFAULT 0,
  ecosystem_indispensability NUMERIC DEFAULT 0,
  relevance_composite NUMERIC DEFAULT 0,
  relevance_tier TEXT DEFAULT 'current',
  generation_label TEXT DEFAULT 'Gen Alpha',
  year_horizon INT NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hycb_platform_relevance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read hycb_platform_relevance" ON public.hycb_platform_relevance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert hycb_platform_relevance" ON public.hycb_platform_relevance FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_hycb_relevance_tier ON public.hycb_platform_relevance(relevance_tier);

-- Trigger: signal when autonomous urban optimization is achieved
CREATE OR REPLACE FUNCTION notify_hycb_autonomous_city()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.autonomous_optimization_score >= 85 AND NEW.transformation_phase = 'autonomous_ecosystem' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('hycb_autonomous_city', 'hycb_urban_transformation', NEW.id, 'high',
      json_build_object('city', NEW.city, 'score', NEW.autonomous_optimization_score, 'horizon', NEW.time_horizon)::jsonb);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hycb_autonomous
AFTER INSERT OR UPDATE ON public.hycb_urban_transformation
FOR EACH ROW EXECUTE FUNCTION notify_hycb_autonomous_city();
