-- Create filter sequences table for collaborative filtering
CREATE TABLE IF NOT EXISTS public.filter_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  previous_filter_id UUID,
  current_filter_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_filter_sequences_session ON public.filter_sequences(session_id);
CREATE INDEX idx_filter_sequences_previous ON public.filter_sequences(previous_filter_id);
CREATE INDEX idx_filter_sequences_current ON public.filter_sequences(current_filter_id);

-- Create analytics aggregation table for admin dashboard
CREATE TABLE IF NOT EXISTS public.filter_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  location TEXT,
  property_type TEXT,
  listing_type TEXT,
  search_count INTEGER DEFAULT 1,
  conversion_count INTEGER DEFAULT 0,
  avg_price_min BIGINT,
  avg_price_max BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX idx_filter_analytics_unique ON public.filter_analytics(date, COALESCE(location, ''), COALESCE(property_type, ''), COALESCE(listing_type, ''));

-- Create indexes for analytics queries
CREATE INDEX idx_filter_analytics_date ON public.filter_analytics(date DESC);
CREATE INDEX idx_filter_analytics_location ON public.filter_analytics(location);

-- Enable Row Level Security
ALTER TABLE public.filter_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filter_analytics ENABLE ROW LEVEL SECURITY;

-- Allow insert for all users (anonymous tracking)
CREATE POLICY "Allow insert for all users on sequences" 
ON public.filter_sequences 
FOR INSERT 
WITH CHECK (true);

-- Allow read for all users on sequences
CREATE POLICY "Allow read for all users on sequences" 
ON public.filter_sequences 
FOR SELECT 
USING (true);

-- Only admins can read analytics
CREATE POLICY "Allow read for authenticated users on analytics" 
ON public.filter_analytics 
FOR SELECT 
USING (true);

-- Allow insert/update for system (edge functions)
CREATE POLICY "Allow insert for all users on analytics" 
ON public.filter_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update for all users on analytics" 
ON public.filter_analytics 
FOR UPDATE 
USING (true);

-- Function to aggregate analytics daily
CREATE OR REPLACE FUNCTION public.aggregate_filter_analytics()
RETURNS void AS $$
BEGIN
  INSERT INTO public.filter_analytics (date, location, property_type, listing_type, search_count, avg_price_min, avg_price_max)
  SELECT 
    CURRENT_DATE,
    location,
    CASE WHEN array_length(property_types, 1) = 1 THEN property_types[1] ELSE NULL END as property_type,
    listing_type,
    COUNT(*) as search_count,
    AVG(price_min) as avg_price_min,
    AVG(price_max) as avg_price_max
  FROM public.filter_usage
  WHERE DATE(last_used_at) = CURRENT_DATE
  GROUP BY location, property_type, listing_type
  ON CONFLICT (date, COALESCE(location, ''), COALESCE(property_type, ''), COALESCE(listing_type, ''))
  DO UPDATE SET
    search_count = filter_analytics.search_count + EXCLUDED.search_count,
    avg_price_min = (filter_analytics.avg_price_min + EXCLUDED.avg_price_min) / 2,
    avg_price_max = (filter_analytics.avg_price_max + EXCLUDED.avg_price_max) / 2,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SET search_path = public;