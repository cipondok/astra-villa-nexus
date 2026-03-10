
-- Property Investment Scores: dedicated table for cached, pre-computed investment intelligence
CREATE TABLE public.property_investment_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  investment_score INTEGER NOT NULL DEFAULT 0 CHECK (investment_score >= 0 AND investment_score <= 100),
  roi_forecast NUMERIC(6,2) DEFAULT 0,
  rental_yield NUMERIC(6,2) DEFAULT 0,
  growth_prediction NUMERIC(6,2) DEFAULT 0,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  location_demand_score INTEGER DEFAULT 0,
  price_fairness_score INTEGER DEFAULT 0,
  liquidity_score INTEGER DEFAULT 0,
  grade TEXT DEFAULT 'C',
  recommendation TEXT,
  factors JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id)
);

-- Indexes for leaderboard queries
CREATE INDEX idx_property_investment_scores_score ON public.property_investment_scores(investment_score DESC);
CREATE INDEX idx_property_investment_scores_property ON public.property_investment_scores(property_id);
CREATE INDEX idx_property_investment_scores_risk ON public.property_investment_scores(risk_level);
CREATE INDEX idx_property_investment_scores_grade ON public.property_investment_scores(grade);

-- RLS: public read, service role write
ALTER TABLE public.property_investment_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read investment scores"
  ON public.property_investment_scores
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage investment scores"
  ON public.property_investment_scores
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
