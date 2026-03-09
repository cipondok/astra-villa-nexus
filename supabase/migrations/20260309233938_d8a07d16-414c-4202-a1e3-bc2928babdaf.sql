-- User property activity table for comprehensive behavior tracking
CREATE TABLE IF NOT EXISTS public.user_property_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX idx_user_property_activity_user ON public.user_property_activity (user_id, created_at DESC);
CREATE INDEX idx_user_property_activity_property ON public.user_property_activity (property_id, activity_type);
CREATE INDEX idx_user_property_activity_type ON public.user_property_activity (activity_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_property_activity ENABLE ROW LEVEL SECURITY;

-- Users can insert their own activity
CREATE POLICY "Users insert own activity" ON public.user_property_activity
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own activity
CREATE POLICY "Users read own activity" ON public.user_property_activity
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Precomputed property recommendations table
CREATE TABLE IF NOT EXISTS public.property_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  recommended_property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  recommendation_score numeric NOT NULL DEFAULT 0,
  recommendation_type text NOT NULL DEFAULT 'similar',
  factors jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, recommended_property_id, recommendation_type)
);

-- Indexes for fast recommendation lookups
CREATE INDEX idx_property_recs_property ON public.property_recommendations (property_id, recommendation_type, recommendation_score DESC);
CREATE INDEX idx_property_recs_type ON public.property_recommendations (recommendation_type, recommendation_score DESC);
CREATE INDEX idx_property_recs_updated ON public.property_recommendations (updated_at);

-- Enable RLS - recommendations are public read
ALTER TABLE public.property_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read recommendations" ON public.property_recommendations
  FOR SELECT USING (true);

-- Service role can manage recommendations
CREATE POLICY "Service role manages recommendations" ON public.property_recommendations
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);