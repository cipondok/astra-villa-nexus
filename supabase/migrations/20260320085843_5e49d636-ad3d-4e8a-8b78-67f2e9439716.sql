
-- ═══════════════════════════════════════════════════════════
-- IPO VALUATION MOMENTUM SIMULATOR (IVMS) SCHEMA
-- ═══════════════════════════════════════════════════════════

-- 1. Valuation Signal Drivers
CREATE TABLE public.ivms_valuation_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_category TEXT NOT NULL DEFAULT 'revenue_growth',
  signal_name TEXT NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  previous_value NUMERIC DEFAULT 0,
  growth_rate_pct NUMERIC DEFAULT 0,
  consistency_score NUMERIC DEFAULT 0,
  investor_weight NUMERIC DEFAULT 1.0,
  perception_impact TEXT DEFAULT 'neutral',
  benchmark_percentile NUMERIC DEFAULT 50,
  data_points_count INT DEFAULT 0,
  trend_direction TEXT DEFAULT 'stable',
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Narrative Momentum Curve
CREATE TABLE public.ivms_narrative_momentum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase TEXT NOT NULL DEFAULT 'innovation',
  phase_label TEXT NOT NULL,
  sentiment_score NUMERIC NOT NULL DEFAULT 50,
  momentum_velocity NUMERIC DEFAULT 0,
  institutional_interest_level TEXT DEFAULT 'low',
  media_coverage_index NUMERIC DEFAULT 0,
  analyst_consensus TEXT DEFAULT 'neutral',
  narrative_strength NUMERIC DEFAULT 50,
  key_catalysts TEXT[] DEFAULT '{}',
  risk_factors TEXT[] DEFAULT '{}',
  phase_duration_months INT DEFAULT 0,
  transition_probability NUMERIC DEFAULT 0,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Market Timing Sensitivity
CREATE TABLE public.ivms_market_timing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  macro_environment TEXT NOT NULL DEFAULT 'neutral',
  sector_sentiment_score NUMERIC NOT NULL DEFAULT 50,
  capital_availability_index NUMERIC DEFAULT 50,
  ipo_window_status TEXT DEFAULT 'closed',
  comparable_multiples_avg NUMERIC DEFAULT 0,
  tech_sector_pe_ratio NUMERIC DEFAULT 0,
  interest_rate_environment TEXT DEFAULT 'stable',
  liquidity_premium NUMERIC DEFAULT 0,
  volatility_index NUMERIC DEFAULT 0,
  receptiveness_score NUMERIC DEFAULT 50,
  optimal_timing_window TEXT DEFAULT 'not_identified',
  timing_confidence NUMERIC DEFAULT 0,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Strategic Milestone Mapping
CREATE TABLE public.ivms_strategic_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_category TEXT NOT NULL DEFAULT 'geographic_expansion',
  milestone_name TEXT NOT NULL,
  target_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  completion_pct NUMERIC DEFAULT 0,
  valuation_impact_multiplier NUMERIC DEFAULT 1.0,
  investor_narrative_weight NUMERIC DEFAULT 1.0,
  target_date TIMESTAMPTZ,
  achieved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  dependencies TEXT[] DEFAULT '{}',
  evidence_points JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Long-Term Market Confidence Loop
CREATE TABLE public.ivms_confidence_loop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confidence_dimension TEXT NOT NULL DEFAULT 'execution_credibility',
  current_score NUMERIC NOT NULL DEFAULT 50,
  previous_score NUMERIC DEFAULT 50,
  score_trend TEXT DEFAULT 'stable',
  reinforcement_strength NUMERIC DEFAULT 0,
  trust_signals_count INT DEFAULT 0,
  credibility_events JSONB DEFAULT '[]',
  transparency_index NUMERIC DEFAULT 50,
  stakeholder_alignment NUMERIC DEFAULT 50,
  feedback_loop_velocity NUMERIC DEFAULT 0,
  decay_risk NUMERIC DEFAULT 0,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ivms_signals_category ON public.ivms_valuation_signals(signal_category);
CREATE INDEX idx_ivms_signals_measured ON public.ivms_valuation_signals(measured_at DESC);
CREATE INDEX idx_ivms_narrative_phase ON public.ivms_narrative_momentum(phase);
CREATE INDEX idx_ivms_narrative_assessed ON public.ivms_narrative_momentum(assessed_at DESC);
CREATE INDEX idx_ivms_timing_assessed ON public.ivms_market_timing(assessed_at DESC);
CREATE INDEX idx_ivms_milestones_status ON public.ivms_strategic_milestones(status);
CREATE INDEX idx_ivms_confidence_dimension ON public.ivms_confidence_loop(confidence_dimension);

-- RLS
ALTER TABLE public.ivms_valuation_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ivms_narrative_momentum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ivms_market_timing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ivms_strategic_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ivms_confidence_loop ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read ivms_valuation_signals" ON public.ivms_valuation_signals FOR SELECT USING (true);
CREATE POLICY "Allow read ivms_narrative_momentum" ON public.ivms_narrative_momentum FOR SELECT USING (true);
CREATE POLICY "Allow read ivms_market_timing" ON public.ivms_market_timing FOR SELECT USING (true);
CREATE POLICY "Allow read ivms_strategic_milestones" ON public.ivms_strategic_milestones FOR SELECT USING (true);
CREATE POLICY "Allow read ivms_confidence_loop" ON public.ivms_confidence_loop FOR SELECT USING (true);

-- Trigger: emit signal when momentum velocity exceeds threshold
CREATE OR REPLACE FUNCTION public.fn_ivms_momentum_signal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.momentum_velocity >= 75 AND NEW.sentiment_score >= 70 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'ivms_momentum_surge',
      'ivms_narrative',
      NEW.id::text,
      'high',
      jsonb_build_object(
        'phase', NEW.phase,
        'momentum_velocity', NEW.momentum_velocity,
        'sentiment_score', NEW.sentiment_score,
        'institutional_interest', NEW.institutional_interest_level
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_ivms_momentum_signal
  AFTER INSERT ON public.ivms_narrative_momentum
  FOR EACH ROW EXECUTE FUNCTION public.fn_ivms_momentum_signal();
