
-- Fraud signals table
CREATE TABLE public.fraud_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  signal_type TEXT NOT NULL,
  signal_value NUMERIC NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'low',
  metadata_json JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fraud_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fraud signals"
  ON public.fraud_signals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all fraud signals"
  ON public.fraud_signals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert fraud signals"
  ON public.fraud_signals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_fraud_signals_user ON public.fraud_signals(user_id);
CREATE INDEX idx_fraud_signals_type ON public.fraud_signals(signal_type);
CREATE INDEX idx_fraud_signals_created ON public.fraud_signals(created_at DESC);

-- Intervention logs table
CREATE TABLE public.intervention_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  intervention_type TEXT NOT NULL,
  trigger_reason TEXT NOT NULL,
  conversion_score NUMERIC,
  fraud_score NUMERIC,
  action_taken TEXT NOT NULL,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.intervention_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view intervention logs"
  ON public.intervention_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert intervention logs"
  ON public.intervention_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_intervention_logs_user ON public.intervention_logs(user_id);
CREATE INDEX idx_intervention_logs_created ON public.intervention_logs(created_at DESC);

-- Aggregation function for dashboard
CREATE OR REPLACE FUNCTION public.get_fraud_dashboard_stats()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_signals_24h', (SELECT count(*) FROM fraud_signals WHERE created_at > now() - interval '24 hours'),
    'total_signals_7d', (SELECT count(*) FROM fraud_signals WHERE created_at > now() - interval '7 days'),
    'high_severity_count', (SELECT count(*) FROM fraud_signals WHERE severity IN ('high','critical') AND NOT is_resolved),
    'interventions_24h', (SELECT count(*) FROM intervention_logs WHERE created_at > now() - interval '24 hours'),
    'signal_distribution', (
      SELECT json_object_agg(signal_type, cnt)
      FROM (SELECT signal_type, count(*) as cnt FROM fraud_signals WHERE created_at > now() - interval '7 days' GROUP BY signal_type) s
    ),
    'severity_distribution', (
      SELECT json_object_agg(severity, cnt)
      FROM (SELECT severity, count(*) as cnt FROM fraud_signals WHERE created_at > now() - interval '7 days' GROUP BY severity) s
    )
  );
$$;
