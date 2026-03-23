
CREATE TABLE IF NOT EXISTS public.investor_intent_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id uuid,
  intent_score numeric NOT NULL DEFAULT 0,
  intent_level text NOT NULL DEFAULT 'low',
  signal_breakdown jsonb DEFAULT '{}',
  last_signal_at timestamptz,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE public.investor_intent_scores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role full access intent scores" ON public.investor_intent_scores FOR ALL TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users read own intent scores" ON public.investor_intent_scores FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_intent_scores_user ON public.investor_intent_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_intent_scores_level ON public.investor_intent_scores(intent_level);
CREATE INDEX IF NOT EXISTS idx_intent_scores_score ON public.investor_intent_scores(intent_score DESC);

CREATE TABLE IF NOT EXISTS public.market_demand_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text,
  price_band text,
  total_views integer DEFAULT 0,
  total_saves integer DEFAULT 0,
  total_inquiries integer DEFAULT 0,
  demand_velocity_score numeric DEFAULT 0,
  view_to_inquiry_ratio numeric DEFAULT 0,
  investor_engagement_index numeric DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(city, property_type, price_band, period_start)
);

ALTER TABLE public.market_demand_signals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role full access demand signals" ON public.market_demand_signals FOR ALL TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth read demand signals" ON public.market_demand_signals FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_demand_signals_city ON public.market_demand_signals(city);
CREATE INDEX IF NOT EXISTS idx_demand_signals_velocity ON public.market_demand_signals(demand_velocity_score DESC);
