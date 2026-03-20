-- ══════════════════════════════════════════════════════════════
-- Founder Strategic Command Center (FSCC)
-- ══════════════════════════════════════════════════════════════

-- 1) Strategic Signal Aggregation
CREATE TABLE public.fscc_strategic_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_domain text NOT NULL CHECK (signal_domain IN ('market_expansion','liquidity_growth','ecosystem_health','competitive','regulatory','talent')),
  signal_name text NOT NULL,
  signal_value numeric DEFAULT 0,
  signal_trend text DEFAULT 'stable' CHECK (signal_trend IN ('surging','rising','stable','declining','critical')),
  severity text DEFAULT 'info' CHECK (severity IN ('critical','warning','info','positive')),
  city text,
  country text DEFAULT 'Indonesia',
  context_data jsonb DEFAULT '{}'::jsonb,
  requires_action boolean DEFAULT false,
  action_deadline timestamptz,
  detected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_fscc_signals_domain ON public.fscc_strategic_signals(signal_domain, severity, detected_at DESC);
ALTER TABLE public.fscc_strategic_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fscc_strategic_signals" ON public.fscc_strategic_signals FOR SELECT TO authenticated USING (true);

-- 2) Priority Decision Interface
CREATE TABLE public.fscc_priority_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_category text NOT NULL CHECK (decision_category IN ('bottleneck','opportunity','capital_efficiency','risk_mitigation','strategic_pivot')),
  title text NOT NULL,
  urgency text DEFAULT 'medium' CHECK (urgency IN ('critical','high','medium','low')),
  impact_score numeric DEFAULT 0,
  confidence numeric DEFAULT 0,
  recommended_action text,
  alternative_actions jsonb DEFAULT '[]'::jsonb,
  affected_cities text[] DEFAULT '{}',
  affected_metrics text[] DEFAULT '{}',
  estimated_roi_pct numeric,
  deadline timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending','in_review','decided','executing','completed','deferred')),
  decided_at timestamptz,
  outcome_notes text,
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_fscc_decisions_urgency ON public.fscc_priority_decisions(urgency, impact_score DESC);
ALTER TABLE public.fscc_priority_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fscc_priority_decisions" ON public.fscc_priority_decisions FOR SELECT TO authenticated USING (true);

-- 3) Scenario Simulation Workspace
CREATE TABLE public.fscc_scenario_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_type text NOT NULL CHECK (scenario_type IN ('geographic_expansion','pricing_adjustment','partnership','acquisition','product_pivot','market_exit')),
  scenario_name text NOT NULL,
  base_case jsonb DEFAULT '{}'::jsonb,
  bull_case jsonb DEFAULT '{}'::jsonb,
  bear_case jsonb DEFAULT '{}'::jsonb,
  probability_base numeric DEFAULT 50,
  probability_bull numeric DEFAULT 25,
  probability_bear numeric DEFAULT 25,
  expected_value_usd numeric DEFAULT 0,
  risk_adjusted_return numeric DEFAULT 0,
  time_horizon_months integer DEFAULT 12,
  key_assumptions text[] DEFAULT '{}',
  sensitivity_factors jsonb DEFAULT '{}'::jsonb,
  simulation_status text DEFAULT 'draft' CHECK (simulation_status IN ('draft','running','completed','archived')),
  result_summary text,
  simulated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_fscc_scenarios_type ON public.fscc_scenario_simulations(scenario_type, simulation_status);
ALTER TABLE public.fscc_scenario_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fscc_scenario_simulations" ON public.fscc_scenario_simulations FOR SELECT TO authenticated USING (true);

-- 4) Organizational Alignment Intelligence
CREATE TABLE public.fscc_org_alignment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name text NOT NULL,
  function_area text DEFAULT 'engineering' CHECK (function_area IN ('engineering','product','growth','operations','finance','partnerships','data_science','design')),
  execution_velocity numeric DEFAULT 0,
  sprint_completion_pct numeric DEFAULT 0,
  resource_utilization_pct numeric DEFAULT 0,
  headcount_current integer DEFAULT 0,
  headcount_target integer DEFAULT 0,
  hiring_gap integer DEFAULT 0,
  alignment_score numeric DEFAULT 0,
  blockers jsonb DEFAULT '[]'::jsonb,
  key_milestones jsonb DEFAULT '[]'::jsonb,
  cross_team_dependencies text[] DEFAULT '{}',
  velocity_trend text DEFAULT 'stable' CHECK (velocity_trend IN ('accelerating','stable','decelerating','stalled')),
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_fscc_org_alignment ON public.fscc_org_alignment(alignment_score DESC);
ALTER TABLE public.fscc_org_alignment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fscc_org_alignment" ON public.fscc_org_alignment FOR SELECT TO authenticated USING (true);

-- 5) Long-Horizon Vision Tracking
CREATE TABLE public.fscc_vision_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_name text NOT NULL,
  goal_category text DEFAULT 'growth' CHECK (goal_category IN ('growth','revenue','market_share','product','talent','fundraising','expansion','brand')),
  time_horizon text DEFAULT '1_year' CHECK (time_horizon IN ('quarterly','1_year','3_year','5_year','10_year')),
  target_value numeric DEFAULT 0,
  current_value numeric DEFAULT 0,
  progress_pct numeric DEFAULT 0,
  trajectory text DEFAULT 'on_track' CHECK (trajectory IN ('ahead','on_track','at_risk','behind','critical')),
  milestones_total integer DEFAULT 0,
  milestones_completed integer DEFAULT 0,
  narrative_summary text,
  investor_talking_points text[] DEFAULT '{}',
  risk_factors text[] DEFAULT '{}',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_fscc_vision_trajectory ON public.fscc_vision_tracking(trajectory, progress_pct DESC);
ALTER TABLE public.fscc_vision_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fscc_vision_tracking" ON public.fscc_vision_tracking FOR SELECT TO authenticated USING (true);

-- Trigger: emit signal for critical decisions
CREATE OR REPLACE FUNCTION public.fn_fscc_critical_decision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.urgency = 'critical' AND NEW.status = 'pending' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('fscc_critical_decision', 'fscc_priority_decisions', NEW.id, 'critical',
      jsonb_build_object('title', NEW.title, 'category', NEW.decision_category, 'impact', NEW.impact_score));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fscc_critical_decision
AFTER INSERT OR UPDATE ON public.fscc_priority_decisions
FOR EACH ROW EXECUTE FUNCTION public.fn_fscc_critical_decision();