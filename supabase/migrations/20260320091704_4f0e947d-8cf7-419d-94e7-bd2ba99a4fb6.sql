
-- ═══════════════════════════════════════════════════════════
-- PUBLIC MARKET LIQUIDITY GRAVITY (PMLG) SCHEMA
-- ═══════════════════════════════════════════════════════════

-- 1. Liquidity Attraction Drivers
CREATE TABLE public.pmlg_liquidity_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_category TEXT NOT NULL DEFAULT 'growth_visibility',
  driver_name TEXT NOT NULL,
  attraction_score NUMERIC NOT NULL DEFAULT 50,
  growth_visibility_index NUMERIC DEFAULT 50,
  earnings_clarity NUMERIC DEFAULT 50,
  category_leadership_pct NUMERIC DEFAULT 0,
  trading_volume_impact NUMERIC DEFAULT 0,
  institutional_ownership_pct NUMERIC DEFAULT 0,
  retail_interest_index NUMERIC DEFAULT 0,
  benchmark_vs_peers NUMERIC DEFAULT 0,
  trend_direction TEXT DEFAULT 'stable',
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Narrative Momentum Reinforcement
CREATE TABLE public.pmlg_narrative_momentum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_type TEXT NOT NULL DEFAULT 'product_launch',
  milestone_description TEXT NOT NULL,
  analyst_engagement_score NUMERIC DEFAULT 0,
  thesis_reinforcement NUMERIC DEFAULT 50,
  valuation_resilience_impact NUMERIC DEFAULT 0,
  media_coverage_lift NUMERIC DEFAULT 0,
  investor_sentiment_shift NUMERIC DEFAULT 0,
  narrative_consistency NUMERIC DEFAULT 50,
  coverage_initiations INT DEFAULT 0,
  price_target_revisions INT DEFAULT 0,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Ecosystem Expansion Signaling
CREATE TABLE public.pmlg_ecosystem_expansion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expansion_type TEXT NOT NULL DEFAULT 'geographic',
  expansion_name TEXT NOT NULL,
  market_relevance_boost NUMERIC DEFAULT 0,
  investor_segment_breadth INT DEFAULT 0,
  confidence_reinforcement NUMERIC DEFAULT 50,
  tam_expansion_pct NUMERIC DEFAULT 0,
  product_evolution_score NUMERIC DEFAULT 0,
  network_effect_multiplier NUMERIC DEFAULT 1.0,
  competitive_moat_impact NUMERIC DEFAULT 0,
  signaling_effectiveness NUMERIC DEFAULT 50,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Market Participation Stability
CREATE TABLE public.pmlg_participation_stability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stability_dimension TEXT NOT NULL DEFAULT 'disclosure_consistency',
  stability_score NUMERIC NOT NULL DEFAULT 50,
  previous_score NUMERIC DEFAULT 50,
  disclosure_frequency TEXT DEFAULT 'quarterly',
  guidance_accuracy_pct NUMERIC DEFAULT 0,
  expectation_management_score NUMERIC DEFAULT 50,
  shareholder_communication_index NUMERIC DEFAULT 50,
  volatility_relative_to_sector NUMERIC DEFAULT 1.0,
  bid_ask_spread_basis_pts NUMERIC DEFAULT 0,
  avg_daily_volume NUMERIC DEFAULT 0,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Feedback Loop Optimization
CREATE TABLE public.pmlg_feedback_loop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_stage TEXT NOT NULL DEFAULT 'engagement_to_liquidity',
  loop_health NUMERIC NOT NULL DEFAULT 50,
  previous_health NUMERIC DEFAULT 50,
  engagement_index NUMERIC DEFAULT 0,
  liquidity_depth NUMERIC DEFAULT 0,
  valuation_stability NUMERIC DEFAULT 50,
  execution_capacity NUMERIC DEFAULT 50,
  self_reinforcing BOOLEAN DEFAULT false,
  loop_velocity NUMERIC DEFAULT 0,
  decay_risk NUMERIC DEFAULT 0,
  optimization_actions JSONB DEFAULT '[]',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_pmlg_drivers_cat ON public.pmlg_liquidity_drivers(driver_category);
CREATE INDEX idx_pmlg_drivers_measured ON public.pmlg_liquidity_drivers(measured_at DESC);
CREATE INDEX idx_pmlg_narrative_type ON public.pmlg_narrative_momentum(milestone_type);
CREATE INDEX idx_pmlg_narrative_assessed ON public.pmlg_narrative_momentum(assessed_at DESC);
CREATE INDEX idx_pmlg_expansion_type ON public.pmlg_ecosystem_expansion(expansion_type);
CREATE INDEX idx_pmlg_stability_dim ON public.pmlg_participation_stability(stability_dimension);
CREATE INDEX idx_pmlg_stability_assessed ON public.pmlg_participation_stability(assessed_at DESC);
CREATE INDEX idx_pmlg_loop_stage ON public.pmlg_feedback_loop(loop_stage);
CREATE INDEX idx_pmlg_loop_assessed ON public.pmlg_feedback_loop(assessed_at DESC);

-- RLS
ALTER TABLE public.pmlg_liquidity_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmlg_narrative_momentum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmlg_ecosystem_expansion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmlg_participation_stability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmlg_feedback_loop ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read pmlg_liquidity_drivers" ON public.pmlg_liquidity_drivers FOR SELECT USING (true);
CREATE POLICY "Allow read pmlg_narrative_momentum" ON public.pmlg_narrative_momentum FOR SELECT USING (true);
CREATE POLICY "Allow read pmlg_ecosystem_expansion" ON public.pmlg_ecosystem_expansion FOR SELECT USING (true);
CREATE POLICY "Allow read pmlg_participation_stability" ON public.pmlg_participation_stability FOR SELECT USING (true);
CREATE POLICY "Allow read pmlg_feedback_loop" ON public.pmlg_feedback_loop FOR SELECT USING (true);

-- Trigger: alert when feedback loop becomes self-reinforcing
CREATE OR REPLACE FUNCTION public.fn_pmlg_loop_signal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.self_reinforcing = true AND NEW.loop_health >= 75 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'pmlg_self_reinforcing',
      'pmlg_loop',
      NEW.id::text,
      'high',
      jsonb_build_object(
        'stage', NEW.loop_stage,
        'health', NEW.loop_health,
        'velocity', NEW.loop_velocity,
        'liquidity_depth', NEW.liquidity_depth
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_pmlg_loop_signal
  AFTER INSERT ON public.pmlg_feedback_loop
  FOR EACH ROW EXECUTE FUNCTION public.fn_pmlg_loop_signal();
