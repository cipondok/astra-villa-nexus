
-- Phase 1: Unified Risk Signal Data Layer
CREATE TABLE public.risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user','listing','transaction','device','payment')),
  entity_id TEXT NOT NULL,
  risk_signal_type TEXT NOT NULL,
  risk_signal_value NUMERIC DEFAULT 0,
  severity_level TEXT NOT NULL DEFAULT 'low' CHECK (severity_level IN ('low','medium','high','critical')),
  source_system TEXT NOT NULL DEFAULT 'auth' CHECK (source_system IN ('auth','escrow','listing','admin','ai_model','payment','system')),
  metadata_json JSONB DEFAULT '{}'::jsonb,
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_risk_events_entity ON public.risk_events(entity_type, entity_id);
CREATE INDEX idx_risk_events_severity ON public.risk_events(severity_level, created_at DESC);
CREATE INDEX idx_risk_events_signal ON public.risk_events(risk_signal_type);

-- Phase 3: Risk Cases for investigation
CREATE TABLE public.risk_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  related_entity_type TEXT NOT NULL,
  related_entity_id TEXT NOT NULL,
  risk_reason TEXT NOT NULL,
  risk_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','cleared','action_taken')),
  admin_notes TEXT,
  assigned_admin_id UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_risk_cases_status ON public.risk_cases(status, created_at DESC);

-- Phase 8: AI Model Readiness
CREATE TABLE public.risk_feature_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  feature_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ DEFAULT now(),
  model_version TEXT DEFAULT 'v1'
);

CREATE TABLE public.risk_model_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL DEFAULT 'v1',
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  prediction_type TEXT NOT NULL,
  prediction_value NUMERIC,
  confidence NUMERIC,
  explanation JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add risk fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS risk_score NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'normal' CHECK (risk_level IN ('trusted','normal','watchlist','restricted')),
  ADD COLUMN IF NOT EXISTS last_risk_evaluated_at TIMESTAMPTZ;

-- RLS
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_feature_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_model_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on risk_events" ON public.risk_events FOR ALL USING (true);
CREATE POLICY "Service role full access on risk_cases" ON public.risk_cases FOR ALL USING (true);
CREATE POLICY "Service role full access on risk_feature_vectors" ON public.risk_feature_vectors FOR ALL USING (true);
CREATE POLICY "Service role full access on risk_model_predictions" ON public.risk_model_predictions FOR ALL USING (true);
