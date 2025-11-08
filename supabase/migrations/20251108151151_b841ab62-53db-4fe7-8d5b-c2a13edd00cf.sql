-- Create filter usage tracking table
CREATE TABLE IF NOT EXISTS public.filter_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  location TEXT,
  property_types TEXT[],
  listing_type TEXT,
  price_min BIGINT,
  price_max BIGINT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  search_query TEXT,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_filter_usage_location ON public.filter_usage(location);
CREATE INDEX idx_filter_usage_listing_type ON public.filter_usage(listing_type);
CREATE INDEX idx_filter_usage_last_used ON public.filter_usage(last_used_at);

-- Enable Row Level Security
ALTER TABLE public.filter_usage ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for anonymous tracking)
CREATE POLICY "Allow insert for all users" 
ON public.filter_usage 
FOR INSERT 
WITH CHECK (true);

-- Allow read for all users (to see popular filters)
CREATE POLICY "Allow read for all users" 
ON public.filter_usage 
FOR SELECT 
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.increment_filter_usage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used_at = now();
  NEW.usage_count = NEW.usage_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;