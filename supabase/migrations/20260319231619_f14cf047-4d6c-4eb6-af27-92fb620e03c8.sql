
-- ══════════════════════════════════════════════════════
-- PLANETARY PROSPERITY OPTIMIZATION PROTOCOL (PPOP)
-- ══════════════════════════════════════════════════════

-- 1️⃣ Prosperity Signal Engine
CREATE TABLE public.ppop_prosperity_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  district TEXT,
  job_creation_velocity NUMERIC DEFAULT 0,
  affordability_index NUMERIC DEFAULT 50,
  infrastructure_productivity NUMERIC DEFAULT 50,
  capital_formation_rate NUMERIC DEFAULT 0,
  prosperity_composite_score NUMERIC DEFAULT 0,
  prosperity_zone_tier TEXT DEFAULT 'emerging',
  acceleration_detected BOOLEAN DEFAULT false,
  signal_drivers JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2️⃣ Urban Regeneration Optimization
CREATE TABLE public.ppop_urban_regeneration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  district TEXT,
  underperformance_score NUMERIC DEFAULT 0,
  investment_gap_usd NUMERIC DEFAULT 0,
  revitalization_priority TEXT DEFAULT 'low',
  housing_quality_index NUMERIC DEFAULT 50,
  economic_vitality_score NUMERIC DEFAULT 50,
  projected_roi_5y NUMERIC DEFAULT 0,
  intervention_type TEXT DEFAULT 'infrastructure',
  capital_channeled_usd NUMERIC DEFAULT 0,
  regeneration_phase TEXT DEFAULT 'assessment',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3️⃣ Global Opportunity Equalization
CREATE TABLE public.ppop_opportunity_equalization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  city TEXT,
  wealth_imbalance_index NUMERIC DEFAULT 0,
  development_attraction_score NUMERIC DEFAULT 0,
  upward_mobility_rate NUMERIC DEFAULT 0,
  emerging_market_readiness NUMERIC DEFAULT 0,
  equalization_intervention TEXT,
  capital_redirected_usd NUMERIC DEFAULT 0,
  gini_improvement_pct NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4️⃣ Long-Horizon Investment Alignment
CREATE TABLE public.ppop_long_horizon_alignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  district TEXT,
  asset_productivity_30y NUMERIC DEFAULT 0,
  institutional_alignment_score NUMERIC DEFAULT 0,
  societal_benefit_index NUMERIC DEFAULT 0,
  infra_housing_capital_synergy NUMERIC DEFAULT 0,
  multi_decade_roi_forecast NUMERIC DEFAULT 0,
  alignment_tier TEXT DEFAULT 'standard',
  incentive_structure JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5️⃣ Prosperity Feedback Loop
CREATE TABLE public.ppop_feedback_loop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id TEXT NOT NULL,
  transaction_outcomes_analyzed INTEGER DEFAULT 0,
  development_cycles_tracked INTEGER DEFAULT 0,
  migration_patterns_ingested INTEGER DEFAULT 0,
  prediction_accuracy_before NUMERIC DEFAULT 0,
  prediction_accuracy_after NUMERIC DEFAULT 0,
  improvement_delta_pct NUMERIC DEFAULT 0,
  prosperity_gain_cumulative NUMERIC DEFAULT 0,
  learning_epoch INTEGER DEFAULT 1,
  model_version TEXT DEFAULT 'v1.0',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ppop_prosperity_city ON public.ppop_prosperity_signals(city);
CREATE INDEX idx_ppop_prosperity_score ON public.ppop_prosperity_signals(prosperity_composite_score DESC);
CREATE INDEX idx_ppop_regen_priority ON public.ppop_urban_regeneration(revitalization_priority);
CREATE INDEX idx_ppop_equal_region ON public.ppop_opportunity_equalization(region);
CREATE INDEX idx_ppop_horizon_city ON public.ppop_long_horizon_alignment(city);
CREATE INDEX idx_ppop_feedback_cycle ON public.ppop_feedback_loop(cycle_id);

-- Trigger: emit signal when prosperity acceleration detected
CREATE OR REPLACE FUNCTION public.fn_ppop_prosperity_acceleration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.acceleration_detected = true AND NEW.prosperity_composite_score >= 75 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'ppop_prosperity_acceleration',
      'ppop_prosperity_signals',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'city', NEW.city,
        'score', NEW.prosperity_composite_score,
        'zone_tier', NEW.prosperity_zone_tier
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ppop_prosperity_acceleration
AFTER INSERT OR UPDATE ON public.ppop_prosperity_signals
FOR EACH ROW EXECUTE FUNCTION public.fn_ppop_prosperity_acceleration();

-- Enable RLS
ALTER TABLE public.ppop_prosperity_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppop_urban_regeneration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppop_opportunity_equalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppop_long_horizon_alignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppop_feedback_loop ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Allow read ppop_prosperity_signals" ON public.ppop_prosperity_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read ppop_urban_regeneration" ON public.ppop_urban_regeneration FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read ppop_opportunity_equalization" ON public.ppop_opportunity_equalization FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read ppop_long_horizon_alignment" ON public.ppop_long_horizon_alignment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read ppop_feedback_loop" ON public.ppop_feedback_loop FOR SELECT TO authenticated USING (true);
