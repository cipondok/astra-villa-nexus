
-- Market Intelligence Tables

-- 1. Location Price Trends
CREATE TABLE public.location_price_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT,
  city TEXT NOT NULL,
  state TEXT,
  average_price NUMERIC NOT NULL DEFAULT 0,
  median_price NUMERIC DEFAULT 0,
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 0,
  property_count INTEGER DEFAULT 0,
  price_growth NUMERIC DEFAULT 0,
  trend_direction TEXT DEFAULT 'stable',
  price_per_sqm NUMERIC DEFAULT 0,
  period TEXT DEFAULT 'monthly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_location_price_trends_city ON public.location_price_trends(city);
CREATE INDEX idx_location_price_trends_state ON public.location_price_trends(state);
CREATE INDEX idx_location_price_trends_updated ON public.location_price_trends(updated_at DESC);

ALTER TABLE public.location_price_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read location price trends" ON public.location_price_trends FOR SELECT TO anon, authenticated USING (true);

-- 2. Rental Market Insights
CREATE TABLE public.rental_market_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT,
  city TEXT NOT NULL,
  state TEXT,
  avg_rental_yield NUMERIC DEFAULT 0,
  avg_monthly_rent NUMERIC DEFAULT 0,
  demand_score INTEGER DEFAULT 0,
  occupancy_prediction NUMERIC DEFAULT 0,
  rental_property_count INTEGER DEFAULT 0,
  avg_price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rental_insights_city ON public.rental_market_insights(city);
CREATE INDEX idx_rental_insights_demand ON public.rental_market_insights(demand_score DESC);

ALTER TABLE public.rental_market_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read rental insights" ON public.rental_market_insights FOR SELECT TO anon, authenticated USING (true);

-- 3. Investment Hotspots
CREATE TABLE public.investment_hotspots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT,
  city TEXT NOT NULL,
  state TEXT,
  hotspot_score NUMERIC DEFAULT 0,
  growth_score NUMERIC DEFAULT 0,
  rental_score NUMERIC DEFAULT 0,
  roi_score NUMERIC DEFAULT 0,
  property_count INTEGER DEFAULT 0,
  avg_investment_score NUMERIC DEFAULT 0,
  avg_roi NUMERIC DEFAULT 0,
  trend TEXT DEFAULT 'stable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotspots_city ON public.investment_hotspots(city);
CREATE INDEX idx_hotspots_score ON public.investment_hotspots(hotspot_score DESC);
CREATE UNIQUE INDEX idx_hotspots_city_location ON public.investment_hotspots(city, COALESCE(location, ''));

ALTER TABLE public.investment_hotspots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read investment hotspots" ON public.investment_hotspots FOR SELECT TO anon, authenticated USING (true);
