
-- Property Deal Analysis table for persistent deal scoring
CREATE TABLE public.property_deal_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  deal_score SMALLINT NOT NULL DEFAULT 0 CHECK (deal_score BETWEEN 0 AND 100),
  estimated_value NUMERIC NOT NULL DEFAULT 0,
  listing_price NUMERIC NOT NULL DEFAULT 0,
  undervaluation_percent NUMERIC NOT NULL DEFAULT 0,
  deal_tag TEXT NOT NULL DEFAULT 'fair' CHECK (deal_tag IN ('hot_deal', 'good_deal', 'fair', 'overpriced')),
  roi_forecast_gap NUMERIC DEFAULT 0,
  location_growth_score SMALLINT DEFAULT 0,
  demand_signal_score SMALLINT DEFAULT 0,
  rental_yield_estimate NUMERIC DEFAULT 0,
  price_per_sqm NUMERIC DEFAULT 0,
  city_avg_price_per_sqm NUMERIC DEFAULT 0,
  analysis_metadata JSONB DEFAULT '{}',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id)
);

-- Enable RLS
ALTER TABLE public.property_deal_analysis ENABLE ROW LEVEL SECURITY;

-- Public read policy (deal analysis is public data)
CREATE POLICY "Anyone can read deal analysis"
  ON public.property_deal_analysis FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only service role can write (via edge functions)
CREATE POLICY "Service role can manage deal analysis"
  ON public.property_deal_analysis FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_deal_analysis_score ON public.property_deal_analysis(deal_score DESC);
CREATE INDEX idx_deal_analysis_tag ON public.property_deal_analysis(deal_tag);
CREATE INDEX idx_deal_analysis_underval ON public.property_deal_analysis(undervaluation_percent DESC);
CREATE INDEX idx_deal_analysis_updated ON public.property_deal_analysis(updated_at DESC);
