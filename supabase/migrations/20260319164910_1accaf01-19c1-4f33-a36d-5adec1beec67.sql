CREATE TABLE public.investor_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_cities text[] DEFAULT '{}',
  preferred_property_types text[] DEFAULT '{}',
  budget_min bigint DEFAULT 0,
  budget_max bigint DEFAULT 0,
  investment_goals text[] DEFAULT '{}',
  risk_tolerance text DEFAULT 'moderate',
  experience_level text DEFAULT 'beginner',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.investor_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON public.investor_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.investor_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.investor_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow anonymous inserts for onboarding"
  ON public.investor_preferences FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);