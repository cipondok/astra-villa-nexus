
-- AML Screenings table
CREATE TABLE IF NOT EXISTS public.aml_screenings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'clear',
  score INTEGER NOT NULL DEFAULT 0,
  sanctions_match BOOLEAN NOT NULL DEFAULT false,
  pep_match BOOLEAN NOT NULL DEFAULT false,
  adverse_media BOOLEAN NOT NULL DEFAULT false,
  matches JSONB DEFAULT '[]'::jsonb,
  screened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.aml_screenings ENABLE ROW LEVEL SECURITY;

-- Users can view their own screenings
CREATE POLICY "Users view own AML screenings"
  ON public.aml_screenings FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins view all AML screenings"
  ON public.aml_screenings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only service role inserts (edge function uses service role)
-- No INSERT policy for authenticated users — enforced server-side

CREATE INDEX idx_aml_screenings_user_id ON public.aml_screenings(user_id);
CREATE INDEX idx_aml_screenings_risk_level ON public.aml_screenings(risk_level);
