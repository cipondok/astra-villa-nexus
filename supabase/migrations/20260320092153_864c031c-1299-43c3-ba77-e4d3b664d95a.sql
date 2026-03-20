
-- ═══════════════════════════════════════════════════════════
-- IPO EXECUTION TIMELINE (IPOEX) SCHEMA
-- 4 Phases, 16 Months of structured IPO preparation
-- ═══════════════════════════════════════════════════════════

-- Master timeline with all milestones
CREATE TABLE public.ipoex_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase INT NOT NULL,
  phase_name TEXT NOT NULL,
  month_offset INT NOT NULL,
  month_label TEXT NOT NULL,
  milestone_key TEXT NOT NULL,
  milestone_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  completion_pct NUMERIC DEFAULT 0,
  owner_role TEXT,
  dependencies TEXT[] DEFAULT '{}',
  blockers TEXT[] DEFAULT '{}',
  evidence JSONB DEFAULT '[]',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase-level readiness assessments
CREATE TABLE public.ipoex_phase_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase INT NOT NULL,
  phase_name TEXT NOT NULL,
  readiness_score NUMERIC NOT NULL DEFAULT 0,
  milestones_total INT DEFAULT 0,
  milestones_completed INT DEFAULT 0,
  milestones_blocked INT DEFAULT 0,
  critical_path_items TEXT[] DEFAULT '{}',
  risk_factors JSONB DEFAULT '[]',
  go_no_go_status TEXT DEFAULT 'pending',
  assessed_by TEXT,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stakeholder tracking (banks, advisors, board, investors)
CREATE TABLE public.ipoex_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_type TEXT NOT NULL DEFAULT 'investment_bank',
  stakeholder_name TEXT NOT NULL,
  role_description TEXT,
  engagement_status TEXT DEFAULT 'identified',
  engagement_score NUMERIC DEFAULT 0,
  last_interaction_at TIMESTAMPTZ,
  key_deliverables JSONB DEFAULT '[]',
  sentiment TEXT DEFAULT 'neutral',
  capital_indication_usd NUMERIC DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timeline risk register
CREATE TABLE public.ipoex_risk_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_category TEXT NOT NULL DEFAULT 'market',
  risk_name TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  probability NUMERIC DEFAULT 50,
  impact_description TEXT,
  mitigation_plan TEXT,
  owner_role TEXT,
  status TEXT DEFAULT 'open',
  phase_affected INT,
  identified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ipoex_milestones_phase ON public.ipoex_milestones(phase);
CREATE INDEX idx_ipoex_milestones_status ON public.ipoex_milestones(status);
CREATE INDEX idx_ipoex_milestones_month ON public.ipoex_milestones(month_offset);
CREATE INDEX idx_ipoex_phase_readiness_phase ON public.ipoex_phase_readiness(phase);
CREATE INDEX idx_ipoex_stakeholders_type ON public.ipoex_stakeholders(stakeholder_type);
CREATE INDEX idx_ipoex_risk_severity ON public.ipoex_risk_register(severity);
CREATE INDEX idx_ipoex_risk_status ON public.ipoex_risk_register(status);

-- RLS
ALTER TABLE public.ipoex_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipoex_phase_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipoex_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipoex_risk_register ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read ipoex_milestones" ON public.ipoex_milestones FOR SELECT USING (true);
CREATE POLICY "Allow read ipoex_phase_readiness" ON public.ipoex_phase_readiness FOR SELECT USING (true);
CREATE POLICY "Allow read ipoex_stakeholders" ON public.ipoex_stakeholders FOR SELECT USING (true);
CREATE POLICY "Allow read ipoex_risk_register" ON public.ipoex_risk_register FOR SELECT USING (true);

-- Trigger: alert when milestone is blocked
CREATE OR REPLACE FUNCTION public.fn_ipoex_milestone_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'blocked' AND array_length(NEW.blockers, 1) > 0 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'ipoex_milestone_blocked',
      'ipoex_milestone',
      NEW.id::text,
      'high',
      jsonb_build_object(
        'phase', NEW.phase,
        'month', NEW.month_label,
        'milestone', NEW.milestone_key,
        'blockers', NEW.blockers
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_ipoex_milestone_alert
  AFTER INSERT OR UPDATE ON public.ipoex_milestones
  FOR EACH ROW EXECUTE FUNCTION public.fn_ipoex_milestone_alert();
