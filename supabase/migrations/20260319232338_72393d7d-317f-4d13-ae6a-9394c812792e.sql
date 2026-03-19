
-- ══════════════════════════════════════════════════════
-- MULTI-PLANET ECONOMIC EXPANSION MODEL (MPEEM)
-- ══════════════════════════════════════════════════════

-- 1️⃣ Off-World Infrastructure Investment
CREATE TABLE public.mpeem_infrastructure_investment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitat_name TEXT NOT NULL,
  planet TEXT NOT NULL DEFAULT 'Mars',
  habitat_type TEXT NOT NULL DEFAULT 'urban_zone',
  capital_allocated_usd NUMERIC DEFAULT 0,
  productivity_signal NUMERIC DEFAULT 0,
  resource_extraction_value NUMERIC DEFAULT 0,
  construction_phase TEXT DEFAULT 'planning',
  estimated_roi_decade NUMERIC DEFAULT 0,
  risk_tier TEXT DEFAULT 'frontier',
  infrastructure_class TEXT DEFAULT 'settlement',
  population_capacity INTEGER DEFAULT 0,
  operational_readiness NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2️⃣ Planetary Property Rights
CREATE TABLE public.mpeem_property_rights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planet TEXT NOT NULL DEFAULT 'Mars',
  zone_name TEXT NOT NULL,
  jurisdiction_model TEXT NOT NULL DEFAULT 'multi_sovereign',
  tokenized_claim_id TEXT,
  ownership_structure TEXT DEFAULT 'fractional_tokenized',
  shared_pool_contributors INTEGER DEFAULT 0,
  total_claim_value_usd NUMERIC DEFAULT 0,
  governance_framework JSONB DEFAULT '{}',
  dispute_resolution_protocol TEXT DEFAULT 'arbitration_dao',
  legal_recognition_status TEXT DEFAULT 'pending_framework',
  infrastructure_share_pct NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3️⃣ Interplanetary Capital Flows
CREATE TABLE public.mpeem_capital_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_planet TEXT NOT NULL DEFAULT 'Earth',
  destination_planet TEXT NOT NULL DEFAULT 'Mars',
  flow_type TEXT NOT NULL DEFAULT 'investment',
  flow_volume_usd NUMERIC DEFAULT 0,
  risk_adjusted_return NUMERIC DEFAULT 0,
  latency_seconds NUMERIC DEFAULT 0,
  transaction_protocol TEXT DEFAULT 'quantum_ledger',
  diversification_index NUMERIC DEFAULT 0,
  settlement_mechanism TEXT DEFAULT 'atomic_swap',
  flow_velocity NUMERIC DEFAULT 0,
  cross_planet_hedge_ratio NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4️⃣ Frontier Urban Growth Intelligence
CREATE TABLE public.mpeem_frontier_growth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colony_name TEXT NOT NULL,
  planet TEXT NOT NULL DEFAULT 'Mars',
  projected_population_5y INTEGER DEFAULT 0,
  projected_population_25y INTEGER DEFAULT 0,
  migration_velocity NUMERIC DEFAULT 0,
  economic_clustering_score NUMERIC DEFAULT 0,
  infrastructure_lifecycle_years INTEGER DEFAULT 50,
  urban_density_target NUMERIC DEFAULT 0,
  self_sufficiency_index NUMERIC DEFAULT 0,
  growth_phase TEXT DEFAULT 'frontier',
  anchor_industries JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5️⃣ Civilization Expansion Flywheel
CREATE TABLE public.mpeem_expansion_flywheel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id TEXT NOT NULL,
  new_asset_classes_created INTEGER DEFAULT 0,
  global_wealth_expansion_usd NUMERIC DEFAULT 0,
  tech_acceleration_index NUMERIC DEFAULT 0,
  frontier_market_cap_usd NUMERIC DEFAULT 0,
  investment_multiplier NUMERIC DEFAULT 1.0,
  civilization_stage TEXT DEFAULT 'type_0.7',
  flywheel_momentum NUMERIC DEFAULT 0,
  breakthroughs_unlocked INTEGER DEFAULT 0,
  decade_span TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_mpeem_infra_planet ON public.mpeem_infrastructure_investment(planet);
CREATE INDEX idx_mpeem_rights_planet ON public.mpeem_property_rights(planet);
CREATE INDEX idx_mpeem_flows_route ON public.mpeem_capital_flows(origin_planet, destination_planet);
CREATE INDEX idx_mpeem_growth_planet ON public.mpeem_frontier_growth(planet);
CREATE INDEX idx_mpeem_flywheel_cycle ON public.mpeem_expansion_flywheel(cycle_id);

-- Trigger: emit signal on frontier breakthrough
CREATE OR REPLACE FUNCTION public.fn_mpeem_frontier_breakthrough()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.flywheel_momentum >= 80 AND NEW.breakthroughs_unlocked >= 3 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'mpeem_frontier_breakthrough',
      'mpeem_expansion_flywheel',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'cycle_id', NEW.cycle_id,
        'momentum', NEW.flywheel_momentum,
        'breakthroughs', NEW.breakthroughs_unlocked,
        'stage', NEW.civilization_stage
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mpeem_frontier_breakthrough
AFTER INSERT OR UPDATE ON public.mpeem_expansion_flywheel
FOR EACH ROW EXECUTE FUNCTION public.fn_mpeem_frontier_breakthrough();

-- RLS
ALTER TABLE public.mpeem_infrastructure_investment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpeem_property_rights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpeem_capital_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpeem_frontier_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpeem_expansion_flywheel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read mpeem_infrastructure_investment" ON public.mpeem_infrastructure_investment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read mpeem_property_rights" ON public.mpeem_property_rights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read mpeem_capital_flows" ON public.mpeem_capital_flows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read mpeem_frontier_growth" ON public.mpeem_frontier_growth FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read mpeem_expansion_flywheel" ON public.mpeem_expansion_flywheel FOR SELECT TO authenticated USING (true);
