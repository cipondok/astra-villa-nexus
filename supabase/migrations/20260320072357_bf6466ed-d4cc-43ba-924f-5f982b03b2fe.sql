
-- ══════════════════════════════════════════════════════════════
-- CAPITAL MARKET PSYCHOLOGICAL POSITIONING MODEL (CMPPM)
-- ══════════════════════════════════════════════════════════════

-- 1️⃣ Narrative Power Architecture
CREATE TABLE public.cmppm_narrative_power (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_frame text NOT NULL,
  positioning_tier text CHECK (positioning_tier IN ('INFRASTRUCTURE','INTELLIGENCE_LAYER','CAPITAL_ROUTER','MARKETPLACE')),
  narrative_strength_score numeric DEFAULT 0,
  media_resonance_score numeric DEFAULT 0,
  investor_recall_score numeric DEFAULT 0,
  differentiation_clarity numeric DEFAULT 0,
  competitor_frame_gap numeric DEFAULT 0,
  key_proof_points jsonb DEFAULT '[]'::jsonb,
  target_audience text CHECK (target_audience IN ('VC','PE','SOVEREIGN','PUBLIC_MARKET','MEDIA','ALL')),
  narrative_status text DEFAULT 'DRAFT' CHECK (narrative_status IN ('DRAFT','ACTIVE','DOMINANT','RETIRED')),
  activated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.cmppm_narrative_power ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cmppm_narrative_power" ON public.cmppm_narrative_power FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_cmppm_narrative_strength ON public.cmppm_narrative_power (narrative_strength_score DESC);

-- 2️⃣ Perceived Category Leadership
CREATE TABLE public.cmppm_category_leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name text NOT NULL,
  leadership_claim text NOT NULL,
  media_mentions_count integer DEFAULT 0,
  analyst_coverage_count integer DEFAULT 0,
  share_of_voice_pct numeric DEFAULT 0,
  search_volume_index numeric DEFAULT 0,
  competitor_mention_ratio numeric DEFAULT 0,
  thought_leadership_score numeric DEFAULT 0,
  category_ownership_score numeric DEFAULT 0,
  positioning_strategy text,
  key_channels jsonb DEFAULT '[]'::jsonb,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cmppm_category_leadership ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cmppm_category_leadership" ON public.cmppm_category_leadership FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_cmppm_category_ownership ON public.cmppm_category_leadership (category_ownership_score DESC);

-- 3️⃣ Scarcity & Momentum Signaling
CREATE TABLE public.cmppm_scarcity_momentum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type text NOT NULL CHECK (signal_type IN ('GROWTH_METRIC','DATA_ADVANTAGE','NETWORK_EFFECT','MARKET_TIMING','DEAL_FLOW','EXCLUSIVITY')),
  signal_name text NOT NULL,
  current_value numeric DEFAULT 0,
  growth_rate_pct numeric DEFAULT 0,
  acceleration_rate numeric DEFAULT 0,
  competitor_gap_multiple numeric DEFAULT 1.0,
  scarcity_perception_score numeric DEFAULT 0,
  urgency_created numeric DEFAULT 0,
  fomo_intensity numeric DEFAULT 0,
  evidence_data jsonb DEFAULT '{}'::jsonb,
  display_format text,
  is_public boolean DEFAULT false,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cmppm_scarcity_momentum ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cmppm_scarcity_momentum" ON public.cmppm_scarcity_momentum FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_cmppm_scarcity_fomo ON public.cmppm_scarcity_momentum (fomo_intensity DESC);

-- 4️⃣ Institutional Trust Construction
CREATE TABLE public.cmppm_institutional_trust (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_segment text NOT NULL CHECK (institution_segment IN ('TIER1_VC','TIER2_VC','PE_FUND','SOVEREIGN_FUND','FAMILY_OFFICE','PENSION','ENDOWMENT','CORPORATE_VC')),
  trust_dimension text NOT NULL CHECK (trust_dimension IN ('CREDIBILITY','PREDICTABILITY','DEFENSIBILITY','GOVERNANCE','TRACK_RECORD','TEAM_QUALITY')),
  trust_score numeric DEFAULT 0,
  evidence_strength numeric DEFAULT 0,
  engagement_depth text CHECK (engagement_depth IN ('AWARENESS','INTEREST','EVALUATION','COMMITMENT','ADVOCACY')),
  touchpoints_completed integer DEFAULT 0,
  due_diligence_readiness_pct numeric DEFAULT 0,
  objection_handling_coverage_pct numeric DEFAULT 0,
  trust_building_actions jsonb DEFAULT '[]'::jsonb,
  next_milestone text,
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cmppm_institutional_trust ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cmppm_institutional_trust" ON public.cmppm_institutional_trust FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_cmppm_trust_score ON public.cmppm_institutional_trust (trust_score DESC);

-- 5️⃣ Valuation Psychology Flywheel
CREATE TABLE public.cmppm_valuation_psychology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flywheel_stage text NOT NULL CHECK (flywheel_stage IN ('NARRATIVE','INVESTOR_DEMAND','VALUATION_PREMIUM','MEDIA_ATTENTION','TALENT_ATTRACTION')),
  stage_strength numeric DEFAULT 0,
  momentum_contribution numeric DEFAULT 0,
  reinforcement_loops jsonb DEFAULT '[]'::jsonb,
  amplification_factor numeric DEFAULT 1.0,
  current_rpm numeric DEFAULT 0,
  target_rpm numeric DEFAULT 0,
  bottleneck_identified text,
  bottleneck_severity numeric DEFAULT 0,
  intervention_strategy text,
  compounding_velocity numeric DEFAULT 0,
  cycle_number integer DEFAULT 1,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cmppm_valuation_psychology ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cmppm_valuation_psychology" ON public.cmppm_valuation_psychology FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_cmppm_valuation_rpm ON public.cmppm_valuation_psychology (current_rpm DESC);

-- Trigger: emit signal when narrative reaches DOMINANT status
CREATE OR REPLACE FUNCTION public.fn_cmppm_narrative_dominant()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.narrative_status = 'DOMINANT' AND (OLD.narrative_status IS NULL OR OLD.narrative_status != 'DOMINANT') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('cmppm_narrative_dominant', 'cmppm_narrative', NEW.id, 'critical',
      jsonb_build_object('frame', NEW.narrative_frame, 'positioning', NEW.positioning_tier, 'strength', NEW.narrative_strength_score));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cmppm_narrative_dominant
  AFTER INSERT OR UPDATE ON public.cmppm_narrative_power
  FOR EACH ROW EXECUTE FUNCTION public.fn_cmppm_narrative_dominant();
