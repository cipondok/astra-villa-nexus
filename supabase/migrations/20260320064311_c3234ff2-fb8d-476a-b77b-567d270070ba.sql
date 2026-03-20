
-- ═══════════════════════════════════════════════════════════
-- AI-POWERED MONOPOLY DEFENSE ARCHITECTURE (AMDA)
-- ═══════════════════════════════════════════════════════════

-- 1️⃣ Competitor Signal Monitoring
CREATE TABLE public.amda_competitor_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL,
  district TEXT,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  signal_type TEXT NOT NULL CHECK (signal_type IN ('SUPPLY_SURGE','MARKETING_SPIKE','PRICE_UNDERCUT','AGENT_MIGRATION','NEW_ENTRANT')),
  signal_strength NUMERIC DEFAULT 0,
  listing_delta_pct NUMERIC DEFAULT 0,
  marketing_intensity NUMERIC DEFAULT 0,
  price_undercut_pct NUMERIC DEFAULT 0,
  agent_churn_risk NUMERIC DEFAULT 0,
  threat_level TEXT DEFAULT 'LOW' CHECK (threat_level IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  threat_composite_score NUMERIC DEFAULT 0,
  raw_evidence JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.amda_competitor_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read amda_competitor_signals" ON public.amda_competitor_signals FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_amda_cs_threat ON public.amda_competitor_signals(threat_composite_score DESC);
CREATE INDEX idx_amda_cs_level ON public.amda_competitor_signals(threat_level);

-- 2️⃣ Strategic Counter-Move Planner
CREATE TABLE public.amda_counter_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_signal_id UUID REFERENCES public.amda_competitor_signals(id) ON DELETE SET NULL,
  district TEXT,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  move_type TEXT NOT NULL CHECK (move_type IN ('INCENTIVE_DEPLOY','ENGAGEMENT_BOOST','VISIBILITY_SURGE','LIQUIDITY_PROTECT','RETENTION_LOCK')),
  urgency TEXT DEFAULT 'MEDIUM' CHECK (urgency IN ('IMMEDIATE','HIGH','MEDIUM','LOW')),
  estimated_impact_score NUMERIC DEFAULT 0,
  resource_cost_index NUMERIC DEFAULT 0,
  roi_projection NUMERIC DEFAULT 0,
  execution_status TEXT DEFAULT 'PLANNED' CHECK (execution_status IN ('PLANNED','APPROVED','EXECUTING','COMPLETED','CANCELLED')),
  move_details JSONB DEFAULT '{}',
  planned_at TIMESTAMPTZ DEFAULT now(),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.amda_counter_moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read amda_counter_moves" ON public.amda_counter_moves FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_amda_cm_urgency ON public.amda_counter_moves(urgency);

-- 3️⃣ Moat Reinforcement Optimizer
CREATE TABLE public.amda_moat_reinforcement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moat_dimension TEXT NOT NULL CHECK (moat_dimension IN ('DATA_ASSET','AI_ACCURACY','ECOSYSTEM_DEPTH','NETWORK_DENSITY','BRAND_TRUST')),
  city TEXT NOT NULL DEFAULT 'Jakarta',
  current_strength NUMERIC DEFAULT 0,
  target_strength NUMERIC DEFAULT 0,
  gap_score NUMERIC DEFAULT 0,
  reinforcement_velocity NUMERIC DEFAULT 0,
  competitor_closest_pct NUMERIC DEFAULT 0,
  indispensability_index NUMERIC DEFAULT 0,
  reinforcement_actions JSONB DEFAULT '{}',
  fortress_status TEXT DEFAULT 'BUILDING' CHECK (fortress_status IN ('VULNERABLE','BUILDING','FORTIFIED','IMPREGNABLE')),
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.amda_moat_reinforcement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read amda_moat_reinforcement" ON public.amda_moat_reinforcement FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_amda_mr_strength ON public.amda_moat_reinforcement(current_strength DESC);

-- 4️⃣ Market Narrative Control
CREATE TABLE public.amda_narrative_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_theme TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  authority_perception_score NUMERIC DEFAULT 0,
  competitor_legacy_framing NUMERIC DEFAULT 0,
  category_leadership_index NUMERIC DEFAULT 0,
  share_of_voice_pct NUMERIC DEFAULT 0,
  sentiment_advantage NUMERIC DEFAULT 0,
  narrative_velocity NUMERIC DEFAULT 0,
  control_status TEXT DEFAULT 'CONTESTING' CHECK (control_status IN ('LOSING','CONTESTING','LEADING','DOMINANT')),
  content_strategy JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.amda_narrative_control ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read amda_narrative_control" ON public.amda_narrative_control FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_amda_nc_leadership ON public.amda_narrative_control(category_leadership_index DESC);

-- 5️⃣ Long-Horizon Dominance Simulator
CREATE TABLE public.amda_dominance_simulator (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  time_horizon_months INTEGER DEFAULT 12,
  projected_market_share_pct NUMERIC DEFAULT 0,
  defense_allocation_pct NUMERIC DEFAULT 0,
  expansion_allocation_pct NUMERIC DEFAULT 0,
  sustainability_score NUMERIC DEFAULT 0,
  risk_of_displacement NUMERIC DEFAULT 0,
  optimal_strategy TEXT DEFAULT 'BALANCED' CHECK (optimal_strategy IN ('AGGRESSIVE_EXPAND','BALANCED','DEFENSIVE_HOLD','STRATEGIC_RETREAT')),
  simulation_inputs JSONB DEFAULT '{}',
  simulation_results JSONB DEFAULT '{}',
  simulated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.amda_dominance_simulator ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read amda_dominance_simulator" ON public.amda_dominance_simulator FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_amda_ds_share ON public.amda_dominance_simulator(projected_market_share_pct DESC);

-- Signal trigger for critical threats
CREATE OR REPLACE FUNCTION public.fn_amda_threat_signal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.threat_level = 'CRITICAL' AND NEW.threat_composite_score >= 80 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('amda_critical_threat', 'competitor', NEW.id::text, 'critical',
      jsonb_build_object('competitor', NEW.competitor_name, 'district', NEW.district, 'signal_type', NEW.signal_type, 'score', NEW.threat_composite_score));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_amda_threat_signal
AFTER INSERT OR UPDATE ON public.amda_competitor_signals
FOR EACH ROW EXECUTE FUNCTION public.fn_amda_threat_signal();
