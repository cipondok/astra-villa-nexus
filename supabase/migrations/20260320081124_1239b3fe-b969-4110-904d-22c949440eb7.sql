
-- ═══════════════════════════════════════════════════════════════
-- FSPCM: Founder Strategic Power Compounding Model
-- ═══════════════════════════════════════════════════════════════

-- 1️⃣ Decision Quality Compounding Engine
CREATE TABLE public.fspcm_decision_compounding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_domain TEXT NOT NULL,
  decision_epoch TEXT NOT NULL DEFAULT 'early_stage',
  cumulative_decisions INT DEFAULT 0,
  high_impact_ratio NUMERIC DEFAULT 0,
  competitive_positioning_delta NUMERIC DEFAULT 0,
  investor_confidence_index NUMERIC DEFAULT 0,
  opportunity_surface_area NUMERIC DEFAULT 0,
  compounding_rate NUMERIC DEFAULT 0,
  compounding_tier TEXT DEFAULT 'linear',
  decision_quality_score NUMERIC DEFAULT 0,
  streak_length INT DEFAULT 0,
  market_timing_accuracy NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fspcm_decision_compounding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fspcm_decision_compounding" ON public.fspcm_decision_compounding FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fspcm_decision_compounding" ON public.fspcm_decision_compounding FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_fspcm_decision_tier ON public.fspcm_decision_compounding(compounding_tier);

-- 2️⃣ Capital Leverage Amplification
CREATE TABLE public.fspcm_capital_leverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leverage_source TEXT NOT NULL,
  execution_credibility_score NUMERIC DEFAULT 0,
  institutional_network_depth NUMERIC DEFAULT 0,
  expansion_track_record NUMERIC DEFAULT 0,
  capital_access_multiplier NUMERIC DEFAULT 1,
  fundraising_velocity_days INT DEFAULT 0,
  valuation_premium_pct NUMERIC DEFAULT 0,
  deal_flow_quality NUMERIC DEFAULT 0,
  sovereign_access_level TEXT DEFAULT 'none',
  leverage_composite NUMERIC DEFAULT 0,
  leverage_tier TEXT DEFAULT 'emerging',
  year_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fspcm_capital_leverage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fspcm_capital_leverage" ON public.fspcm_capital_leverage FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fspcm_capital_leverage" ON public.fspcm_capital_leverage FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_fspcm_leverage_tier ON public.fspcm_capital_leverage(leverage_tier);

-- 3️⃣ Narrative Authority Formation
CREATE TABLE public.fspcm_narrative_authority (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_domain TEXT NOT NULL,
  directional_signal_strength NUMERIC DEFAULT 0,
  benchmark_recognition_score NUMERIC DEFAULT 0,
  ecosystem_alignment_index NUMERIC DEFAULT 0,
  media_amplification NUMERIC DEFAULT 0,
  conference_keynote_invitations INT DEFAULT 0,
  thought_leadership_citations INT DEFAULT 0,
  industry_perception_shift NUMERIC DEFAULT 0,
  authority_composite NUMERIC DEFAULT 0,
  authority_tier TEXT DEFAULT 'emerging',
  year_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fspcm_narrative_authority ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fspcm_narrative_authority" ON public.fspcm_narrative_authority FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fspcm_narrative_authority" ON public.fspcm_narrative_authority FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_fspcm_authority_tier ON public.fspcm_narrative_authority(authority_tier);

-- 4️⃣ Talent Magnetism Flywheel
CREATE TABLE public.fspcm_talent_magnetism (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_segment TEXT NOT NULL,
  inbound_application_rate NUMERIC DEFAULT 0,
  elite_hire_conversion_pct NUMERIC DEFAULT 0,
  execution_velocity_multiplier NUMERIC DEFAULT 1,
  organizational_resilience NUMERIC DEFAULT 0,
  retention_rate_pct NUMERIC DEFAULT 0,
  employer_brand_score NUMERIC DEFAULT 0,
  innovation_output_index NUMERIC DEFAULT 0,
  talent_network_reach INT DEFAULT 0,
  magnetism_composite NUMERIC DEFAULT 0,
  magnetism_tier TEXT DEFAULT 'emerging',
  year_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fspcm_talent_magnetism ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fspcm_talent_magnetism" ON public.fspcm_talent_magnetism FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fspcm_talent_magnetism" ON public.fspcm_talent_magnetism FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_fspcm_talent_tier ON public.fspcm_talent_magnetism(magnetism_tier);

-- 5️⃣ Legacy Influence Transition
CREATE TABLE public.fspcm_legacy_influence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influence_mechanism TEXT NOT NULL,
  institutional_embedding_score NUMERIC DEFAULT 0,
  cultural_principles_adoption NUMERIC DEFAULT 0,
  mission_continuity_strength NUMERIC DEFAULT 0,
  successor_pipeline_depth INT DEFAULT 0,
  governance_independence NUMERIC DEFAULT 0,
  brand_transcendence_score NUMERIC DEFAULT 0,
  influence_persistence_years INT DEFAULT 0,
  legacy_composite NUMERIC DEFAULT 0,
  legacy_tier TEXT DEFAULT 'personal',
  year_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fspcm_legacy_influence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fspcm_legacy_influence" ON public.fspcm_legacy_influence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fspcm_legacy_influence" ON public.fspcm_legacy_influence FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_fspcm_legacy_tier ON public.fspcm_legacy_influence(legacy_tier);

-- Trigger: signal when decision compounding reaches exponential tier
CREATE OR REPLACE FUNCTION notify_fspcm_exponential_power()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.compounding_tier = 'exponential' AND NEW.decision_quality_score >= 85 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('fspcm_exponential_power', 'fspcm_decision_compounding', NEW.id, 'high',
      json_build_object('domain', NEW.decision_domain, 'quality_score', NEW.decision_quality_score, 'streak', NEW.streak_length)::jsonb);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fspcm_exponential
AFTER INSERT OR UPDATE ON public.fspcm_decision_compounding
FOR EACH ROW EXECUTE FUNCTION notify_fspcm_exponential_power();
