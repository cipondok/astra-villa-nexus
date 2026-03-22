
-- ai_signals and ai_tasks and ai_surface_rules (new tables)
-- ai_learning_events already exists, add missing columns

CREATE TABLE IF NOT EXISTS public.ai_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  predicted_value JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'medium',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES public.ai_signals(id) ON DELETE SET NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_priority TEXT NOT NULL DEFAULT 'medium',
  recommended_action TEXT,
  automation_possible BOOLEAN DEFAULT false,
  assigned_admin UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  impact_score NUMERIC(5,2) DEFAULT 0,
  impact_description TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_surface_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  trigger_metric TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  comparison TEXT NOT NULL DEFAULT 'gte',
  ui_surface_location TEXT NOT NULL DEFAULT 'top',
  urgency_level TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns to ai_learning_events
ALTER TABLE public.ai_learning_events ADD COLUMN IF NOT EXISTS behavior_source TEXT;
ALTER TABLE public.ai_learning_events ADD COLUMN IF NOT EXISTS pattern_detected TEXT;
ALTER TABLE public.ai_learning_events ADD COLUMN IF NOT EXISTS outcome_success_score NUMERIC(5,2);
ALTER TABLE public.ai_learning_events ADD COLUMN IF NOT EXISTS model_version TEXT DEFAULT '1.0';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_signals_type ON public.ai_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_ai_signals_entity ON public.ai_signals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_signals_unresolved ON public.ai_signals(is_resolved, severity) WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON public.ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_priority ON public.ai_tasks(task_priority, status);
CREATE INDEX IF NOT EXISTS idx_ai_surface_rules_active ON public.ai_surface_rules(is_active, trigger_metric);

-- RLS
ALTER TABLE public.ai_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_surface_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read ai_signals" ON public.ai_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ai_signals" ON public.ai_signals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update ai_signals" ON public.ai_signals FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth read ai_tasks" ON public.ai_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ai_tasks" ON public.ai_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update ai_tasks" ON public.ai_tasks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth read ai_surface_rules" ON public.ai_surface_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ai_surface_rules" ON public.ai_surface_rules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update ai_surface_rules" ON public.ai_surface_rules FOR UPDATE TO authenticated USING (true);
