
-- Property Engagement Scores table for AI Smart Collections
CREATE TABLE public.property_engagement_scores (
  property_id UUID PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
  views_total INTEGER DEFAULT 0,
  saves_total INTEGER DEFAULT 0,
  inquiries_total INTEGER DEFAULT 0,
  clicks_total INTEGER DEFAULT 0,
  avg_dwell_seconds NUMERIC DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  investment_score NUMERIC DEFAULT 0,
  livability_score NUMERIC DEFAULT 0,
  luxury_score NUMERIC DEFAULT 0,
  predicted_roi NUMERIC DEFAULT 0,
  roi_confidence NUMERIC DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast collection queries
CREATE INDEX idx_engagement_score ON public.property_engagement_scores (engagement_score DESC);
CREATE INDEX idx_investment_score ON public.property_engagement_scores (investment_score DESC);
CREATE INDEX idx_livability_score ON public.property_engagement_scores (livability_score DESC);
CREATE INDEX idx_luxury_score ON public.property_engagement_scores (luxury_score DESC);
CREATE INDEX idx_predicted_roi ON public.property_engagement_scores (predicted_roi DESC);

-- RLS: public read, service-role write
ALTER TABLE public.property_engagement_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read engagement scores"
  ON public.property_engagement_scores
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage engagement scores"
  ON public.property_engagement_scores
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
