
-- ═══════════════════════════════════════════════════════════
-- PUBLIC MARKET NARRATIVE ENGINEERING SYSTEM (PMNE)
-- ═══════════════════════════════════════════════════════════

-- 1. Category Narrative Construction
CREATE TABLE public.pmne_category_narrative (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_frame TEXT NOT NULL,
  positioning_pillar TEXT NOT NULL CHECK (positioning_pillar IN ('INTELLIGENCE_INFRA','LIQUIDITY_ACCELERATOR','CAPITAL_ALLOCATION_TECH','ASSET_DISCOVERY_NETWORK')),
  clarity_score NUMERIC DEFAULT 0,
  differentiation_strength NUMERIC DEFAULT 0,
  analyst_resonance_score NUMERIC DEFAULT 0,
  media_pickup_potential NUMERIC DEFAULT 0,
  comparable_companies JSONB DEFAULT '[]',
  valuation_multiple_target NUMERIC DEFAULT 0,
  narrative_status TEXT DEFAULT 'DRAFT' CHECK (narrative_status IN ('DRAFT','TESTING','ACTIVE','DOMINANT')),
  supporting_evidence JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pmne_category_narrative ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read pmne_category_narrative" ON public.pmne_category_narrative FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_pmne_cn_clarity ON public.pmne_category_narrative(clarity_score DESC);

-- 2. Growth Story Signal Amplifier
CREATE TABLE public.pmne_growth_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_category TEXT NOT NULL CHECK (signal_category IN ('LIQUIDITY','VELOCITY','ADOPTION','EXPANSION','REVENUE','ENGAGEMENT')),
  metric_name TEXT NOT NULL,
  current_value NUMERIC DEFAULT 0,
  previous_value NUMERIC DEFAULT 0,
  growth_pct NUMERIC DEFAULT 0,
  trend_direction TEXT DEFAULT 'FLAT' CHECK (trend_direction IN ('ACCELERATING','GROWING','FLAT','DECLINING')),
  headline_worthy BOOLEAN DEFAULT false,
  investor_impact_score NUMERIC DEFAULT 0,
  amplification_priority TEXT DEFAULT 'STANDARD' CHECK (amplification_priority IN ('FLAGSHIP','HIGH','STANDARD','BACKGROUND')),
  suggested_headline TEXT,
  period TEXT DEFAULT 'monthly',
  measured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pmne_growth_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read pmne_growth_signals" ON public.pmne_growth_signals FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_pmne_gs_impact ON public.pmne_growth_signals(investor_impact_score DESC);

-- 3. Market Leadership Perception
CREATE TABLE public.pmne_leadership_perception (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perception_dimension TEXT NOT NULL CHECK (perception_dimension IN ('CATEGORY_LEADER','DATA_ADVANTAGE','NETWORK_EFFECT','SCALABILITY','INNOVATION')),
  perception_strength NUMERIC DEFAULT 0,
  evidence_depth NUMERIC DEFAULT 0,
  competitor_gap_pct NUMERIC DEFAULT 0,
  analyst_coverage_score NUMERIC DEFAULT 0,
  media_mention_velocity NUMERIC DEFAULT 0,
  perception_trend TEXT DEFAULT 'STABLE' CHECK (perception_trend IN ('STRENGTHENING','STABLE','WEAKENING','CONTESTED')),
  key_proof_points JSONB DEFAULT '[]',
  risk_to_perception TEXT,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pmne_leadership_perception ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read pmne_leadership_perception" ON public.pmne_leadership_perception FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_pmne_lp_strength ON public.pmne_leadership_perception(perception_strength DESC);

-- 4. Financial Story Architecture
CREATE TABLE public.pmne_financial_story (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_element TEXT NOT NULL CHECK (story_element IN ('REVENUE_PREDICTABILITY','MARGIN_EXPANSION','CAPITAL_EFFICIENCY','MONETIZATION_PATHWAY','UNIT_ECONOMICS')),
  narrative_strength NUMERIC DEFAULT 0,
  current_metric_value NUMERIC DEFAULT 0,
  projected_metric_value NUMERIC DEFAULT 0,
  improvement_trajectory TEXT DEFAULT 'LINEAR' CHECK (improvement_trajectory IN ('EXPONENTIAL','LINEAR','STEP_FUNCTION','PLATEAU')),
  investor_story_text TEXT,
  risk_factors JSONB DEFAULT '[]',
  peer_benchmark JSONB DEFAULT '{}',
  credibility_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pmne_financial_story ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read pmne_financial_story" ON public.pmne_financial_story FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_pmne_fs_credibility ON public.pmne_financial_story(credibility_score DESC);

-- 5. Investor Confidence Loop
CREATE TABLE public.pmne_confidence_loop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_element TEXT NOT NULL CHECK (loop_element IN ('PRODUCT_ANNOUNCEMENT','EXPANSION_MILESTONE','FUNDING_CYCLE','PARTNERSHIP_SIGNAL','METRIC_BEAT')),
  alignment_score NUMERIC DEFAULT 0,
  market_timing_score NUMERIC DEFAULT 0,
  messaging_consistency NUMERIC DEFAULT 0,
  confidence_impact NUMERIC DEFAULT 0,
  announcement_text TEXT,
  optimal_timing_window TEXT,
  synced_with_funding BOOLEAN DEFAULT false,
  loop_status TEXT DEFAULT 'PLANNED' CHECK (loop_status IN ('PLANNED','STAGED','DEPLOYED','MEASURED')),
  outcome_metrics JSONB DEFAULT '{}',
  planned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pmne_confidence_loop ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read pmne_confidence_loop" ON public.pmne_confidence_loop FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_pmne_cl_confidence ON public.pmne_confidence_loop(confidence_impact DESC);

-- Signal trigger for flagship growth signals
CREATE OR REPLACE FUNCTION public.fn_pmne_flagship_signal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amplification_priority = 'FLAGSHIP' AND NEW.headline_worthy = true THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('pmne_flagship_signal', 'growth_metric', NEW.id::text, 'critical',
      jsonb_build_object('metric', NEW.metric_name, 'growth_pct', NEW.growth_pct, 'headline', NEW.suggested_headline));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pmne_flagship_signal
AFTER INSERT OR UPDATE ON public.pmne_growth_signals
FOR EACH ROW EXECUTE FUNCTION public.fn_pmne_flagship_signal();
