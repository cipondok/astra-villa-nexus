
-- Investor Intelligence Scores table
CREATE TABLE public.investor_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core scores
  capital_readiness_score NUMERIC(5,2) DEFAULT 0 CHECK (capital_readiness_score >= 0 AND capital_readiness_score <= 100),
  deal_conversion_probability NUMERIC(5,4) DEFAULT 0 CHECK (deal_conversion_probability >= 0 AND deal_conversion_probability <= 1),
  liquidity_matching_index NUMERIC(5,2) DEFAULT 0 CHECK (liquidity_matching_index >= 0 AND liquidity_matching_index <= 100),
  
  -- Investment style classification
  style_classification TEXT DEFAULT 'unclassified' CHECK (style_classification IN ('yield_hunter', 'flip_opportunist', 'luxury_lifestyle', 'institutional_allocator', 'unclassified')),
  style_confidence NUMERIC(5,2) DEFAULT 0,
  
  -- Signal inputs snapshot
  search_frequency INTEGER DEFAULT 0,
  saved_count INTEGER DEFAULT 0,
  viewing_bookings INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  past_transactions INTEGER DEFAULT 0,
  avg_session_duration_sec INTEGER DEFAULT 0,
  
  -- Scoring weights (admin-overridable)
  weight_search NUMERIC(4,2) DEFAULT 0.10,
  weight_saves NUMERIC(4,2) DEFAULT 0.15,
  weight_viewings NUMERIC(4,2) DEFAULT 0.20,
  weight_budget NUMERIC(4,2) DEFAULT 0.15,
  weight_location NUMERIC(4,2) DEFAULT 0.10,
  weight_risk_profile NUMERIC(4,2) DEFAULT 0.10,
  weight_transactions NUMERIC(4,2) DEFAULT 0.15,
  weight_rental_pref NUMERIC(4,2) DEFAULT 0.05,
  
  -- Metadata
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.investor_scores ENABLE ROW LEVEL SECURITY;

-- Users can read their own score
CREATE POLICY "Users can read own investor score"
  ON public.investor_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for leaderboard queries
CREATE INDEX idx_investor_scores_capital_readiness ON public.investor_scores(capital_readiness_score DESC);
CREATE INDEX idx_investor_scores_conversion ON public.investor_scores(deal_conversion_probability DESC);
CREATE INDEX idx_investor_scores_style ON public.investor_scores(style_classification);
