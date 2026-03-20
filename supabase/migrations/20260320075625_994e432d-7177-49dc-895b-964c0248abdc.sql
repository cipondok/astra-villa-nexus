
-- ============================================================
-- PLANET-SCALE NETWORK EFFECT MATHEMATICAL MODEL (PSNEM) SCHEMA
-- ============================================================

-- 1) Multi-Side Marketplace Growth
CREATE TABLE public.psnem_marketplace_growth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  investor_count INTEGER DEFAULT 0,
  supply_creator_count INTEGER DEFAULT 0,
  vendor_count INTEGER DEFAULT 0,
  financial_partner_count INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  cross_side_interaction_rate NUMERIC,
  metcalfe_value_index NUMERIC,
  marginal_utility_per_user NUMERIC,
  platform_utility_score NUMERIC,
  growth_phase TEXT DEFAULT 'linear',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Liquidity Density
CREATE TABLE public.psnem_liquidity_density (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  district TEXT,
  transaction_volume_monthly INTEGER DEFAULT 0,
  geographic_cluster_density NUMERIC,
  price_discovery_efficiency NUMERIC,
  deal_success_probability NUMERIC,
  bid_ask_spread_compression NUMERIC,
  liquidity_depth_score NUMERIC,
  critical_mass_reached BOOLEAN DEFAULT false,
  density_tier TEXT DEFAULT 'sparse',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Data Advantage Compounding
CREATE TABLE public.psnem_data_compounding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_domain TEXT NOT NULL,
  total_data_points BIGINT DEFAULT 0,
  predictive_accuracy_pct NUMERIC,
  accuracy_at_1x_scale NUMERIC,
  accuracy_at_10x_scale NUMERIC,
  recommendation_quality_score NUMERIC,
  investor_retention_lift_pct NUMERIC,
  switching_cost_index NUMERIC,
  compounding_rate NUMERIC,
  moat_depth_score NUMERIC,
  competitor_replication_years NUMERIC,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Threshold & Tipping Points
CREATE TABLE public.psnem_tipping_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  milestone_name TEXT NOT NULL,
  threshold_metric TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  current_value NUMERIC,
  progress_pct NUMERIC,
  is_reached BOOLEAN DEFAULT false,
  reached_at TIMESTAMPTZ,
  self_reinforcing_strength NUMERIC,
  competitor_entry_barrier NUMERIC,
  brand_reference_score NUMERIC,
  effect_type TEXT DEFAULT 'growth_acceleration',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Strategic Optimization Levers
CREATE TABLE public.psnem_optimization_levers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lever_name TEXT NOT NULL,
  lever_category TEXT NOT NULL,
  current_setting NUMERIC,
  optimal_setting NUMERIC,
  sensitivity_score NUMERIC,
  impact_on_growth_pct NUMERIC,
  impact_on_retention_pct NUMERIC,
  impact_on_monetization_pct NUMERIC,
  cost_to_adjust NUMERIC,
  roi_of_adjustment NUMERIC,
  recommended_action TEXT,
  simulation_result JSONB,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_psnem_growth_city ON public.psnem_marketplace_growth(city, computed_at DESC);
CREATE INDEX idx_psnem_density_city ON public.psnem_liquidity_density(city, district, density_tier);
CREATE INDEX idx_psnem_data_domain ON public.psnem_data_compounding(data_domain, computed_at DESC);
CREATE INDEX idx_psnem_tipping_city ON public.psnem_tipping_points(city, is_reached, assessed_at DESC);
CREATE INDEX idx_psnem_levers_cat ON public.psnem_optimization_levers(lever_category, computed_at DESC);

-- RLS
ALTER TABLE public.psnem_marketplace_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psnem_liquidity_density ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psnem_data_compounding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psnem_tipping_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psnem_optimization_levers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read psnem_marketplace_growth" ON public.psnem_marketplace_growth FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read psnem_liquidity_density" ON public.psnem_liquidity_density FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read psnem_data_compounding" ON public.psnem_data_compounding FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read psnem_tipping_points" ON public.psnem_tipping_points FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read psnem_optimization_levers" ON public.psnem_optimization_levers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert psnem_marketplace_growth" ON public.psnem_marketplace_growth FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert psnem_liquidity_density" ON public.psnem_liquidity_density FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert psnem_data_compounding" ON public.psnem_data_compounding FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert psnem_tipping_points" ON public.psnem_tipping_points FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert psnem_optimization_levers" ON public.psnem_optimization_levers FOR INSERT TO service_role WITH CHECK (true);

-- Trigger: emit signal when tipping point reached
CREATE OR REPLACE FUNCTION public.trg_psnem_tipping_reached() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_reached = true AND (OLD IS NULL OR OLD.is_reached = false) THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('psnem_tipping_point_reached', 'network_effect', NEW.id, 'critical',
      jsonb_build_object('city', NEW.city, 'milestone', NEW.milestone_name, 'metric', NEW.threshold_metric, 'value', NEW.current_value));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_psnem_tipping_reached
  AFTER INSERT OR UPDATE ON public.psnem_tipping_points
  FOR EACH ROW EXECUTE FUNCTION public.trg_psnem_tipping_reached();
