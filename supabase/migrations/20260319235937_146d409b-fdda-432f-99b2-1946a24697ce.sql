
-- =====================================================
-- GLOBAL ASSET LIQUIDITY INTERNET (GALI) SCHEMA
-- =====================================================

-- 1️⃣ Global Asset Discovery Graph
CREATE TABLE public.gali_asset_discovery_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID,
  asset_type TEXT NOT NULL DEFAULT 'property',
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  investor_reach_count INT DEFAULT 0,
  vendor_connections INT DEFAULT 0,
  transaction_history_depth INT DEFAULT 0,
  signal_density_score NUMERIC(6,2) DEFAULT 0,
  discovery_velocity NUMERIC(6,2) DEFAULT 0,
  graph_centrality_score NUMERIC(6,4) DEFAULT 0,
  connected_investors INT DEFAULT 0,
  connected_vendors INT DEFAULT 0,
  cross_market_links INT DEFAULT 0,
  last_signal_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2️⃣ Liquidity Routing Protocol
CREATE TABLE public.gali_liquidity_routing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  exit_probability_score NUMERIC(5,2) DEFAULT 0,
  investor_intent_alignment NUMERIC(5,2) DEFAULT 0,
  geographic_rebalance_weight NUMERIC(5,4) DEFAULT 0,
  routing_priority TEXT DEFAULT 'standard',
  estimated_days_to_exit INT,
  liquidity_depth NUMERIC(12,2) DEFAULT 0,
  demand_supply_ratio NUMERIC(6,3) DEFAULT 1,
  routing_confidence NUMERIC(5,2) DEFAULT 0,
  rebalance_signal TEXT,
  last_routed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3️⃣ Universal Valuation Intelligence Layer
CREATE TABLE public.gali_valuation_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  comparable_score NUMERIC(5,2) DEFAULT 0,
  liquidity_velocity_score NUMERIC(5,2) DEFAULT 0,
  macro_growth_score NUMERIC(5,2) DEFAULT 0,
  asset_performance_score NUMERIC(5,2) DEFAULT 0,
  universal_valuation_index NUMERIC(6,2) DEFAULT 0,
  confidence_level NUMERIC(5,2) DEFAULT 0,
  valuation_tier TEXT DEFAULT 'standard',
  price_efficiency_ratio NUMERIC(6,4) DEFAULT 1,
  cross_market_premium NUMERIC(8,2) DEFAULT 0,
  standardized_yield_pct NUMERIC(5,2),
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4️⃣ Transaction Friction Compression Stack
CREATE TABLE public.gali_friction_compression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  asset_type TEXT DEFAULT 'property',
  due_diligence_avg_hours NUMERIC(8,2) DEFAULT 0,
  vendor_sync_latency_hours NUMERIC(8,2) DEFAULT 0,
  negotiation_cycle_days NUMERIC(6,2) DEFAULT 0,
  total_friction_score NUMERIC(5,2) DEFAULT 100,
  friction_reduction_pct NUMERIC(5,2) DEFAULT 0,
  automation_coverage_pct NUMERIC(5,2) DEFAULT 0,
  bottleneck_stage TEXT,
  bottleneck_action TEXT,
  transactions_measured INT DEFAULT 0,
  benchmark_friction_score NUMERIC(5,2),
  measured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5️⃣ Network Effect Expansion Logic
CREATE TABLE public.gali_network_expansion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  total_transactions_30d INT DEFAULT 0,
  valuation_accuracy_pct NUMERIC(5,2) DEFAULT 0,
  investor_trust_index NUMERIC(5,2) DEFAULT 0,
  platform_authority_score NUMERIC(5,2) DEFAULT 0,
  network_effect_multiplier NUMERIC(6,3) DEFAULT 1,
  transparency_index NUMERIC(5,2) DEFAULT 0,
  liquidity_concentration_pct NUMERIC(5,2) DEFAULT 0,
  compounding_velocity NUMERIC(6,3) DEFAULT 0,
  growth_stage TEXT DEFAULT 'nascent',
  projected_authority_90d NUMERIC(5,2),
  flywheel_rpm NUMERIC(8,2) DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.gali_asset_discovery_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gali_liquidity_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gali_valuation_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gali_friction_compression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gali_network_expansion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read gali_asset_discovery_graph" ON public.gali_asset_discovery_graph FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read gali_liquidity_routing" ON public.gali_liquidity_routing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read gali_valuation_intelligence" ON public.gali_valuation_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read gali_friction_compression" ON public.gali_friction_compression FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read gali_network_expansion" ON public.gali_network_expansion FOR SELECT TO authenticated USING (true);

-- Service role insert/update
CREATE POLICY "Service insert gali_asset_discovery_graph" ON public.gali_asset_discovery_graph FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update gali_asset_discovery_graph" ON public.gali_asset_discovery_graph FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert gali_liquidity_routing" ON public.gali_liquidity_routing FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update gali_liquidity_routing" ON public.gali_liquidity_routing FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert gali_valuation_intelligence" ON public.gali_valuation_intelligence FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update gali_valuation_intelligence" ON public.gali_valuation_intelligence FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert gali_friction_compression" ON public.gali_friction_compression FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update gali_friction_compression" ON public.gali_friction_compression FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert gali_network_expansion" ON public.gali_network_expansion FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update gali_network_expansion" ON public.gali_network_expansion FOR UPDATE TO service_role USING (true);

-- Indexes
CREATE INDEX idx_gali_discovery_region ON public.gali_asset_discovery_graph(region, city);
CREATE INDEX idx_gali_discovery_centrality ON public.gali_asset_discovery_graph(graph_centrality_score DESC);
CREATE INDEX idx_gali_routing_exit ON public.gali_liquidity_routing(exit_probability_score DESC);
CREATE INDEX idx_gali_routing_priority ON public.gali_liquidity_routing(routing_priority);
CREATE INDEX idx_gali_valuation_index ON public.gali_valuation_intelligence(universal_valuation_index DESC);
CREATE INDEX idx_gali_friction_score ON public.gali_friction_compression(total_friction_score ASC);
CREATE INDEX idx_gali_network_authority ON public.gali_network_expansion(platform_authority_score DESC);

-- Trigger: emit signal when network effect reaches critical mass
CREATE OR REPLACE FUNCTION public.gali_network_critical_mass()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.platform_authority_score >= 85 AND NEW.network_effect_multiplier >= 3.0 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'gali_critical_mass_reached',
      'gali_network',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'city', NEW.city,
        'region', NEW.region,
        'authority', NEW.platform_authority_score,
        'multiplier', NEW.network_effect_multiplier,
        'stage', NEW.growth_stage
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_gali_network_critical_mass
AFTER INSERT OR UPDATE ON public.gali_network_expansion
FOR EACH ROW EXECUTE FUNCTION public.gali_network_critical_mass();
