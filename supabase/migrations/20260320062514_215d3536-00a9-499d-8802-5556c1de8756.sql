
-- ═══════════════════════════════════════════════════════════════
-- CATEGORY CREATOR NARRATIVE ENGINE (CCNE)
-- ═══════════════════════════════════════════════════════════════

-- 1. Category Definition Engine
CREATE TABLE public.ccne_category_definition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL,
  legacy_framing TEXT NOT NULL,
  new_framing TEXT NOT NULL,
  disruption_thesis TEXT NOT NULL,
  legacy_weakness_score NUMERIC NOT NULL DEFAULT 0,
  new_category_strength NUMERIC NOT NULL DEFAULT 0,
  market_readiness NUMERIC NOT NULL DEFAULT 0,
  competitive_moat_depth NUMERIC NOT NULL DEFAULT 0,
  category_maturity TEXT NOT NULL DEFAULT 'nascent',
  positioning_clarity NUMERIC NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ccne_category_definition ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read ccne_category_definition" ON public.ccne_category_definition FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_ccne_catdef_computed ON public.ccne_category_definition(computed_at DESC);

-- 2. Problem Amplification Layer
CREATE TABLE public.ccne_problem_amplification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_domain TEXT NOT NULL,
  inefficiency_description TEXT NOT NULL,
  quantified_loss_usd NUMERIC NOT NULL DEFAULT 0,
  affected_stakeholders TEXT NOT NULL DEFAULT 'all',
  emotional_urgency_score NUMERIC NOT NULL DEFAULT 0,
  systemic_failure_index NUMERIC NOT NULL DEFAULT 0,
  awareness_level TEXT NOT NULL DEFAULT 'low',
  amplification_strategy TEXT,
  virality_potential NUMERIC NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ccne_problem_amplification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read ccne_problem_amplification" ON public.ccne_problem_amplification FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_ccne_problem_computed ON public.ccne_problem_amplification(computed_at DESC);

-- 3. Future Vision Projection
CREATE TABLE public.ccne_vision_projection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vision_theme TEXT NOT NULL,
  narrative_arc TEXT NOT NULL,
  macro_alignment_score NUMERIC NOT NULL DEFAULT 0,
  inevitability_index NUMERIC NOT NULL DEFAULT 0,
  infrastructure_positioning NUMERIC NOT NULL DEFAULT 0,
  roadmap_coherence NUMERIC NOT NULL DEFAULT 0,
  audience_resonance NUMERIC NOT NULL DEFAULT 0,
  projection_horizon_years INTEGER NOT NULL DEFAULT 10,
  vision_tier TEXT NOT NULL DEFAULT 'emerging',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ccne_vision_projection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read ccne_vision_projection" ON public.ccne_vision_projection FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_ccne_vision_computed ON public.ccne_vision_projection(computed_at DESC);

-- 4. Founder Mythology Builder
CREATE TABLE public.ccne_founder_mythology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_element TEXT NOT NULL,
  mythology_type TEXT NOT NULL DEFAULT 'origin',
  contrarian_strength NUMERIC NOT NULL DEFAULT 0,
  credibility_score NUMERIC NOT NULL DEFAULT 0,
  mission_alignment NUMERIC NOT NULL DEFAULT 0,
  audience_inspiration NUMERIC NOT NULL DEFAULT 0,
  media_pickup_potential NUMERIC NOT NULL DEFAULT 0,
  mythology_composite NUMERIC NOT NULL DEFAULT 0,
  story_phase TEXT NOT NULL DEFAULT 'foundation',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ccne_founder_mythology ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read ccne_founder_mythology" ON public.ccne_founder_mythology FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_ccne_founder_computed ON public.ccne_founder_mythology(computed_at DESC);

-- 5. Market Education Flywheel
CREATE TABLE public.ccne_education_flywheel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_pillar TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'investors',
  mental_model_shift TEXT NOT NULL,
  adoption_velocity NUMERIC NOT NULL DEFAULT 0,
  evangelist_conversion_rate NUMERIC NOT NULL DEFAULT 0,
  paradigm_shift_score NUMERIC NOT NULL DEFAULT 0,
  content_reach_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  flywheel_momentum NUMERIC NOT NULL DEFAULT 0,
  flywheel_stage TEXT NOT NULL DEFAULT 'seeding',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ccne_education_flywheel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read ccne_education_flywheel" ON public.ccne_education_flywheel FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_ccne_flywheel_computed ON public.ccne_education_flywheel(computed_at DESC);

-- Trigger: emit signal on high category positioning clarity
CREATE OR REPLACE FUNCTION public.emit_ccne_category_signal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.positioning_clarity >= 80 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('ccne_category_crystallized', 'ccne_category', NEW.id::text, 'high',
      json_build_object('category', NEW.category_name, 'clarity', NEW.positioning_clarity, 'maturity', NEW.category_maturity)::jsonb);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_ccne_category_signal
  AFTER INSERT OR UPDATE ON public.ccne_category_definition
  FOR EACH ROW EXECUTE FUNCTION public.emit_ccne_category_signal();
