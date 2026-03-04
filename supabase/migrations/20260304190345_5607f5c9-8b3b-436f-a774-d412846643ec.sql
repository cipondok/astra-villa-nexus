
-- Table: ai_model_weights
CREATE TABLE public.ai_model_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factor text NOT NULL UNIQUE,
  weight integer NOT NULL DEFAULT 10,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL DEFAULT 'manual'
);

ALTER TABLE public.ai_model_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on ai_model_weights"
  ON public.ai_model_weights FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read on ai_model_weights"
  ON public.ai_model_weights FOR SELECT
  TO authenticated USING (true);

-- Seed default weights (sum = 110 per memory: location=25, price=22, feature=15, investment=13, popularity=15, collaborative=10)
-- Normalizing to 100: already sums to 100
INSERT INTO public.ai_model_weights (factor, weight, updated_by) VALUES
  ('location', 25, 'seed'),
  ('price', 22, 'seed'),
  ('feature', 15, 'seed'),
  ('investment', 13, 'seed'),
  ('popularity', 15, 'seed'),
  ('collaborative', 10, 'seed');

-- Table: ai_recommendation_events
CREATE TABLE public.ai_recommendation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  match_factors jsonb DEFAULT '{}'::jsonb,
  ai_match_score integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_rec_events_created ON public.ai_recommendation_events (created_at);
CREATE INDEX idx_ai_rec_events_type ON public.ai_recommendation_events (event_type);
CREATE INDEX idx_ai_rec_events_user ON public.ai_recommendation_events (user_id);

ALTER TABLE public.ai_recommendation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on ai_recommendation_events"
  ON public.ai_recommendation_events FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can insert own recommendation events"
  ON public.ai_recommendation_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own recommendation events"
  ON public.ai_recommendation_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
