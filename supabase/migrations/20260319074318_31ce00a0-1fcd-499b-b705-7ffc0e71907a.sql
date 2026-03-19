
-- Add multi-criteria sub-ratings to property_reviews
ALTER TABLE public.property_reviews
  ADD COLUMN IF NOT EXISTS rating_condition integer CHECK (rating_condition >= 1 AND rating_condition <= 5),
  ADD COLUMN IF NOT EXISTS rating_agent integer CHECK (rating_agent >= 1 AND rating_agent <= 5),
  ADD COLUMN IF NOT EXISTS rating_investment integer CHECK (rating_investment >= 1 AND rating_investment <= 5),
  ADD COLUMN IF NOT EXISTS spam_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderation_notes text,
  ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz;

-- Agent reviews table
CREATE TABLE IF NOT EXISTS public.agent_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  rating_responsiveness integer CHECK (rating_responsiveness >= 1 AND rating_responsiveness <= 5),
  rating_knowledge integer CHECK (rating_knowledge >= 1 AND rating_knowledge <= 5),
  rating_professionalism integer CHECK (rating_professionalism >= 1 AND rating_professionalism <= 5),
  title text,
  review_text text,
  is_published boolean DEFAULT true,
  admin_approved boolean DEFAULT false,
  spam_score integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  report_count integer DEFAULT 0,
  moderation_notes text,
  moderated_by uuid REFERENCES auth.users(id),
  moderated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agent_id, reviewer_id, property_id)
);

ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read published+approved reviews
CREATE POLICY "Public can read approved agent reviews"
  ON public.agent_reviews FOR SELECT
  USING (is_published = true AND admin_approved = true);

-- RLS: Users can read their own reviews regardless of status
CREATE POLICY "Users can read own agent reviews"
  ON public.agent_reviews FOR SELECT TO authenticated
  USING (reviewer_id = auth.uid());

-- RLS: Authenticated users can insert their own reviews
CREATE POLICY "Users can create agent reviews"
  ON public.agent_reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

-- RLS: Users can update their own reviews
CREATE POLICY "Users can update own agent reviews"
  ON public.agent_reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid());

-- RLS: Users can delete their own reviews
CREATE POLICY "Users can delete own agent reviews"
  ON public.agent_reviews FOR DELETE TO authenticated
  USING (reviewer_id = auth.uid());
