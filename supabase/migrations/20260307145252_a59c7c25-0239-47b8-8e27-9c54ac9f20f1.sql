
-- AI Feedback Signals table for self-learning system
CREATE TABLE IF NOT EXISTS public.ai_feedback_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  ai_match_score NUMERIC DEFAULT 0,
  user_action TEXT NOT NULL CHECK (user_action IN ('view', 'save', 'contact', 'visit', 'ignore', 'dismiss')),
  action_weight NUMERIC DEFAULT 1.0,
  recommendation_source TEXT DEFAULT 'ai_engine',
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON public.ai_feedback_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_property ON public.ai_feedback_signals(property_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created ON public.ai_feedback_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_action ON public.ai_feedback_signals(user_action);

-- RLS
ALTER TABLE public.ai_feedback_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
  ON public.ai_feedback_signals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own feedback"
  ON public.ai_feedback_signals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service role can read all for model training
CREATE POLICY "Service role full access"
  ON public.ai_feedback_signals FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- AI Learning Snapshots table for tracking model evolution
CREATE TABLE IF NOT EXISTS public.ai_learning_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type TEXT NOT NULL DEFAULT 'self_learning',
  total_signals_processed INTEGER DEFAULT 0,
  positive_signals INTEGER DEFAULT 0,
  negative_signals INTEGER DEFAULT 0,
  weights_before JSONB,
  weights_after JSONB,
  adjustments JSONB,
  model_accuracy NUMERIC DEFAULT 0,
  confidence_score NUMERIC DEFAULT 0,
  learning_rate NUMERIC DEFAULT 0.01,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_learning_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access snapshots"
  ON public.ai_learning_snapshots FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated read snapshots"
  ON public.ai_learning_snapshots FOR SELECT TO authenticated
  USING (true);
