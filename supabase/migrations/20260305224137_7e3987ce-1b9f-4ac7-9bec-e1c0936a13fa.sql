
CREATE TABLE IF NOT EXISTS public.user_intent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intent_level TEXT NOT NULL DEFAULT 'browser',
  buyer_type TEXT NOT NULL DEFAULT 'Browser',
  preferred_city TEXT,
  avg_budget NUMERIC DEFAULT 0,
  property_type_preference TEXT,
  investment_affinity TEXT DEFAULT 'low',
  views_30d INTEGER DEFAULT 0,
  saves_30d INTEGER DEFAULT 0,
  inquiries_30d INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_intent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own intent profile"
  ON public.user_intent_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on user_intent_profiles"
  ON public.user_intent_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
