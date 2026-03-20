
-- ═══════════════════════════════════════════════════════════════
-- GLOBAL INVESTOR PSYCHOLOGY DOMINATION MODEL (GIPD)
-- ═══════════════════════════════════════════════════════════════

-- 1. Investor Motivation Mapping
CREATE TABLE public.gipd_motivation_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_region TEXT NOT NULL,
  fear_greed_index NUMERIC NOT NULL DEFAULT 50,
  safety_seeking_pct NUMERIC NOT NULL DEFAULT 50,
  growth_seeking_pct NUMERIC NOT NULL DEFAULT 50,
  macro_uncertainty_score NUMERIC NOT NULL DEFAULT 0,
  capital_deployment_velocity NUMERIC NOT NULL DEFAULT 0,
  dominant_motivation TEXT NOT NULL DEFAULT 'balanced',
  cycle_phase TEXT NOT NULL DEFAULT 'neutral',
  sentiment_momentum NUMERIC NOT NULL DEFAULT 0,
  confidence_index NUMERIC NOT NULL DEFAULT 50,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gipd_motivation_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gipd_motivation_mapping" ON public.gipd_motivation_mapping FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gipd_motiv_region ON public.gipd_motivation_mapping(market_region);
CREATE INDEX idx_gipd_motiv_computed ON public.gipd_motivation_mapping(computed_at DESC);

-- 2. Trust Acceleration Framework
CREATE TABLE public.gipd_trust_acceleration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_dimension TEXT NOT NULL,
  decision_friction_score NUMERIC NOT NULL DEFAULT 0,
  data_transparency_index NUMERIC NOT NULL DEFAULT 0,
  deal_credibility_signal NUMERIC NOT NULL DEFAULT 0,
  conviction_strength NUMERIC NOT NULL DEFAULT 0,
  insight_quality_score NUMERIC NOT NULL DEFAULT 0,
  trust_composite NUMERIC NOT NULL DEFAULT 0,
  acceleration_strategy TEXT,
  trust_tier TEXT NOT NULL DEFAULT 'building',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gipd_trust_acceleration ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gipd_trust_acceleration" ON public.gipd_trust_acceleration FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gipd_trust_computed ON public.gipd_trust_acceleration(computed_at DESC);

-- 3. Opportunity Perception Amplifier
CREATE TABLE public.gipd_opportunity_perception (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_region TEXT NOT NULL,
  scarcity_intensity NUMERIC NOT NULL DEFAULT 0,
  capital_flow_momentum NUMERIC NOT NULL DEFAULT 0,
  wealth_narrative_strength NUMERIC NOT NULL DEFAULT 0,
  fomo_trigger_score NUMERIC NOT NULL DEFAULT 0,
  rational_backing_score NUMERIC NOT NULL DEFAULT 0,
  perception_composite NUMERIC NOT NULL DEFAULT 0,
  amplification_mode TEXT NOT NULL DEFAULT 'balanced',
  opportunity_urgency TEXT NOT NULL DEFAULT 'standard',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gipd_opportunity_perception ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gipd_opportunity_perception" ON public.gipd_opportunity_perception FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gipd_opp_region ON public.gipd_opportunity_perception(market_region);

-- 4. Behavioral Segmentation Intelligence
CREATE TABLE public.gipd_behavioral_segmentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name TEXT NOT NULL,
  investor_persona TEXT NOT NULL DEFAULT 'balanced',
  risk_appetite NUMERIC NOT NULL DEFAULT 50,
  analysis_depth_preference NUMERIC NOT NULL DEFAULT 50,
  decision_speed_profile TEXT NOT NULL DEFAULT 'moderate',
  communication_tone TEXT NOT NULL DEFAULT 'professional',
  engagement_nudge_type TEXT NOT NULL DEFAULT 'insight',
  segment_size_pct NUMERIC NOT NULL DEFAULT 0,
  conversion_rate NUMERIC NOT NULL DEFAULT 0,
  ltv_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  personalization_score NUMERIC NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gipd_behavioral_segmentation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gipd_behavioral_segmentation" ON public.gipd_behavioral_segmentation FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gipd_seg_computed ON public.gipd_behavioral_segmentation(computed_at DESC);

-- 5. Capital Activation Flywheel
CREATE TABLE public.gipd_capital_activation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_stage TEXT NOT NULL,
  stage_conversion_rate NUMERIC NOT NULL DEFAULT 0,
  emotional_driver TEXT NOT NULL DEFAULT 'curiosity',
  rational_driver TEXT NOT NULL DEFAULT 'data',
  friction_points INTEGER NOT NULL DEFAULT 0,
  stickiness_score NUMERIC NOT NULL DEFAULT 0,
  advocacy_potential NUMERIC NOT NULL DEFAULT 0,
  flywheel_velocity NUMERIC NOT NULL DEFAULT 0,
  flywheel_composite NUMERIC NOT NULL DEFAULT 0,
  activation_phase TEXT NOT NULL DEFAULT 'warming',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gipd_capital_activation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gipd_capital_activation" ON public.gipd_capital_activation FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gipd_activation_computed ON public.gipd_capital_activation(computed_at DESC);

-- Trigger: emit signal on extreme fear/greed
CREATE OR REPLACE FUNCTION public.emit_gipd_sentiment_signal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.fear_greed_index <= 20 OR NEW.fear_greed_index >= 80 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('gipd_sentiment_extreme', 'gipd_motivation', NEW.id::text, 'high',
      json_build_object('region', NEW.market_region, 'fear_greed', NEW.fear_greed_index, 'phase', NEW.cycle_phase)::jsonb);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_gipd_sentiment_signal
  AFTER INSERT OR UPDATE ON public.gipd_motivation_mapping
  FOR EACH ROW EXECUTE FUNCTION public.emit_gipd_sentiment_signal();
