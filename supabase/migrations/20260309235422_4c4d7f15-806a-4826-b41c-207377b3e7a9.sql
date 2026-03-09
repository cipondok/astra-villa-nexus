
-- Location Market Insights: unified market intelligence per city
CREATE TABLE public.location_market_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT,
  city TEXT NOT NULL,
  state TEXT,
  avg_price NUMERIC DEFAULT 0,
  avg_price_per_sqm NUMERIC DEFAULT 0,
  avg_roi NUMERIC DEFAULT 0,
  avg_rental_yield NUMERIC DEFAULT 0,
  avg_investment_score NUMERIC DEFAULT 0,
  market_growth_rate NUMERIC DEFAULT 0,
  market_status TEXT DEFAULT 'stable',
  demand_score INTEGER DEFAULT 0,
  listing_volume INTEGER DEFAULT 0,
  price_range_min NUMERIC DEFAULT 0,
  price_range_max NUMERIC DEFAULT 0,
  top_property_types TEXT[] DEFAULT '{}',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_market_insights_city ON public.location_market_insights(city);
CREATE INDEX idx_market_insights_status ON public.location_market_insights(market_status);
CREATE INDEX idx_market_insights_score ON public.location_market_insights(avg_investment_score DESC);

ALTER TABLE public.location_market_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read market insights" ON public.location_market_insights FOR SELECT TO anon, authenticated USING (true);
