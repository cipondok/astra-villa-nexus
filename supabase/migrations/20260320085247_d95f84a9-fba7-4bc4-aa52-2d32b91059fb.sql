-- ══════════════════════════════════════════════════════════════
-- Global Fundraising Narrative Engine (GFNE)
-- ══════════════════════════════════════════════════════════════

-- 1) Vision Narrative Framework
CREATE TABLE public.gfne_vision_narrative (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_layer text NOT NULL CHECK (narrative_layer IN ('market_inefficiency','digital_transformation','data_ecosystem','liquidity_evolution','platform_vision')),
  headline text NOT NULL,
  core_thesis text NOT NULL,
  supporting_evidence text[] DEFAULT '{}',
  emotional_hook text,
  data_points jsonb DEFAULT '{}'::jsonb,
  target_audience text DEFAULT 'general' CHECK (target_audience IN ('vc_growth','institutional','sovereign','angel','general')),
  narrative_strength numeric DEFAULT 0,
  version integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gfne_vision_layer ON public.gfne_vision_narrative(narrative_layer, is_active, narrative_strength DESC);
ALTER TABLE public.gfne_vision_narrative ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gfne_vision_narrative" ON public.gfne_vision_narrative FOR SELECT TO authenticated USING (true);

-- 2) Market Opportunity Positioning
CREATE TABLE public.gfne_market_opportunity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_segment text NOT NULL,
  tam_usd numeric DEFAULT 0,
  sam_usd numeric DEFAULT 0,
  som_usd numeric DEFAULT 0,
  growth_rate_pct numeric DEFAULT 0,
  penetration_current_pct numeric DEFAULT 0,
  penetration_target_pct numeric DEFAULT 0,
  regional_breakdown jsonb DEFAULT '{}'::jsonb,
  network_effect_multiplier numeric DEFAULT 1,
  competitive_landscape_summary text,
  expansion_pathway text[] DEFAULT '{}',
  defensibility_narrative text,
  time_horizon text DEFAULT '5_year' CHECK (time_horizon IN ('1_year','3_year','5_year','10_year')),
  confidence numeric DEFAULT 0,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gfne_market_tam ON public.gfne_market_opportunity(tam_usd DESC);
ALTER TABLE public.gfne_market_opportunity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gfne_market_opportunity" ON public.gfne_market_opportunity FOR SELECT TO authenticated USING (true);

-- 3) Traction Signal Amplification
CREATE TABLE public.gfne_traction_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_category text NOT NULL CHECK (signal_category IN ('growth_momentum','ecosystem_adoption','liquidity_density','revenue_velocity','engagement_depth','viral_coefficient')),
  metric_name text NOT NULL,
  current_value numeric DEFAULT 0,
  previous_value numeric DEFAULT 0,
  growth_pct numeric DEFAULT 0,
  benchmark_value numeric,
  benchmark_source text,
  narrative_framing text,
  investor_relevance text DEFAULT 'medium' CHECK (investor_relevance IN ('critical','high','medium','supportive')),
  visual_treatment text DEFAULT 'metric_card' CHECK (visual_treatment IN ('hero_stat','metric_card','trend_chart','comparison_bar','milestone_marker')),
  period text DEFAULT 'monthly',
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gfne_traction_category ON public.gfne_traction_signals(signal_category, investor_relevance);
ALTER TABLE public.gfne_traction_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gfne_traction_signals" ON public.gfne_traction_signals FOR SELECT TO authenticated USING (true);

-- 4) Strategic Moat Communication
CREATE TABLE public.gfne_moat_communication (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moat_type text NOT NULL CHECK (moat_type IN ('data_intelligence','network_effects','ecosystem_lockin','execution_speed','regulatory_positioning','brand_trust')),
  moat_name text NOT NULL,
  depth_score numeric DEFAULT 0,
  replication_difficulty text DEFAULT 'hard' CHECK (replication_difficulty IN ('trivial','moderate','hard','near_impossible')),
  time_to_replicate_months integer,
  competitive_advantage_narrative text,
  evidence_points text[] DEFAULT '{}',
  investor_proof_points jsonb DEFAULT '{}'::jsonb,
  moat_trend text DEFAULT 'strengthening' CHECK (moat_trend IN ('strengthening','stable','weakening')),
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gfne_moat_depth ON public.gfne_moat_communication(depth_score DESC);
ALTER TABLE public.gfne_moat_communication ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gfne_moat_communication" ON public.gfne_moat_communication FOR SELECT TO authenticated USING (true);

-- 5) Investor Psychology Alignment
CREATE TABLE public.gfne_investor_psychology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_archetype text NOT NULL CHECK (investor_archetype IN ('vc_growth','institutional','sovereign','angel','family_office','strategic_corporate')),
  primary_motivation text NOT NULL,
  risk_tolerance text DEFAULT 'moderate' CHECK (risk_tolerance IN ('aggressive','moderate','conservative')),
  return_expectation text,
  decision_drivers text[] DEFAULT '{}',
  objection_patterns text[] DEFAULT '{}',
  objection_responses jsonb DEFAULT '{}'::jsonb,
  messaging_tone text DEFAULT 'data_driven' CHECK (messaging_tone IN ('visionary','data_driven','conservative','narrative_rich','technical')),
  deck_emphasis text[] DEFAULT '{}',
  follow_up_sequence jsonb DEFAULT '[]'::jsonb,
  conversion_playbook text,
  effectiveness_score numeric DEFAULT 0,
  last_calibrated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gfne_investor_archetype ON public.gfne_investor_psychology(investor_archetype, effectiveness_score DESC);
ALTER TABLE public.gfne_investor_psychology ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gfne_investor_psychology" ON public.gfne_investor_psychology FOR SELECT TO authenticated USING (true);

-- Trigger: emit signal when critical traction signal detected
CREATE OR REPLACE FUNCTION public.fn_gfne_critical_traction()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.investor_relevance = 'critical' AND NEW.growth_pct >= 50 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('gfne_traction_milestone', 'gfne_traction_signals', NEW.id, 'high',
      jsonb_build_object('metric', NEW.metric_name, 'growth_pct', NEW.growth_pct, 'category', NEW.signal_category));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gfne_critical_traction
AFTER INSERT OR UPDATE ON public.gfne_traction_signals
FOR EACH ROW EXECUTE FUNCTION public.fn_gfne_critical_traction();