
-- Investment outcome tracking
CREATE TABLE public.investment_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID NOT NULL,
  predicted_roi NUMERIC,
  actual_roi NUMERIC,
  predicted_price NUMERIC,
  actual_price NUMERIC,
  investment_amount NUMERIC NOT NULL,
  profit_loss NUMERIC,
  success BOOLEAN,
  outcome_date DATE,
  model_version TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investment_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outcomes" ON public.investment_outcomes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outcomes" ON public.investment_outcomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_outcomes_user ON public.investment_outcomes(user_id);
CREATE INDEX idx_outcomes_property ON public.investment_outcomes(property_id);

-- Model experiments (A/B testing for models)
CREATE TABLE public.model_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed')),
  champion_version TEXT NOT NULL,
  challenger_version TEXT NOT NULL,
  champion_conversions INT DEFAULT 0,
  challenger_conversions INT DEFAULT 0,
  champion_impressions INT DEFAULT 0,
  challenger_impressions INT DEFAULT 0,
  champion_avg_roi NUMERIC DEFAULT 0,
  challenger_avg_roi NUMERIC DEFAULT 0,
  traffic_split NUMERIC DEFAULT 0.5,
  winner TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.model_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view experiments" ON public.model_experiments
  FOR SELECT TO authenticated USING (true);

-- Model experiment user assignments
CREATE TABLE public.model_experiment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.model_experiments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('champion','challenger')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(experiment_id, user_id)
);

ALTER TABLE public.model_experiment_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assignments" ON public.model_experiment_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert assignments" ON public.model_experiment_assignments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Training run logs
CREATE TABLE public.training_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'scheduled' CHECK (trigger_type IN ('scheduled','manual','threshold')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  training_samples INT,
  accuracy NUMERIC,
  loss NUMERIC,
  feature_importance JSONB DEFAULT '{}',
  old_weights JSONB,
  new_weights JSONB,
  comparison_metrics JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.training_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view training runs" ON public.training_runs
  FOR SELECT TO authenticated USING (true);
