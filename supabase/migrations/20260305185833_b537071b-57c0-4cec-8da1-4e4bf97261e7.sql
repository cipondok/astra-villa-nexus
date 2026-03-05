CREATE TABLE public.ai_weight_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weights jsonb NOT NULL,
  trigger_type text NOT NULL DEFAULT 'auto_tune',
  total_events_analyzed integer,
  data_quality text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read weight history"
  ON public.ai_weight_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ai_weight_history_created ON public.ai_weight_history(created_at DESC);