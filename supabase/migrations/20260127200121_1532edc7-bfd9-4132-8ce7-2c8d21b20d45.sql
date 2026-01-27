-- Create property valuations table to store valuation history
CREATE TABLE public.property_valuations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  estimated_value NUMERIC NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  valuation_method TEXT NOT NULL DEFAULT 'automated',
  market_trend TEXT CHECK (market_trend IN ('rising', 'stable', 'declining')),
  comparable_properties JSONB DEFAULT '[]'::jsonb,
  valuation_factors JSONB DEFAULT '{}'::jsonb,
  price_range_low NUMERIC,
  price_range_high NUMERIC,
  currency TEXT NOT NULL DEFAULT 'IDR',
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  requested_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.property_valuations ENABLE ROW LEVEL SECURITY;

-- Anyone can view valuations for public properties
CREATE POLICY "Public can view property valuations" 
ON public.property_valuations 
FOR SELECT 
USING (true);

-- Property owners and admins can request valuations
CREATE POLICY "Authenticated users can create valuations" 
ON public.property_valuations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX idx_property_valuations_property_id ON public.property_valuations(property_id);
CREATE INDEX idx_property_valuations_created_at ON public.property_valuations(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_property_valuations_updated_at
BEFORE UPDATE ON public.property_valuations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();