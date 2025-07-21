-- Create property ratings and reviews tables
CREATE TABLE public.property_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_buyer BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, user_id)
);

-- Enable RLS
ALTER TABLE public.property_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view property ratings" 
ON public.property_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create ratings" 
ON public.property_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.property_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.property_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create property rating aggregates table for performance
CREATE TABLE public.property_rating_aggregates (
  property_id UUID NOT NULL PRIMARY KEY,
  average_rating NUMERIC(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for aggregates
ALTER TABLE public.property_rating_aggregates ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read rating aggregates
CREATE POLICY "Anyone can view rating aggregates" 
ON public.property_rating_aggregates 
FOR SELECT 
USING (true);

-- Create function to update rating aggregates
CREATE OR REPLACE FUNCTION public.update_property_rating_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new aggregates for the property
  INSERT INTO public.property_rating_aggregates (
    property_id,
    average_rating,
    total_ratings,
    rating_distribution,
    last_updated
  )
  SELECT 
    pr.property_id,
    ROUND(AVG(pr.rating::numeric), 2) as average_rating,
    COUNT(pr.rating) as total_ratings,
    jsonb_build_object(
      '1', COUNT(CASE WHEN pr.rating = 1 THEN 1 END),
      '2', COUNT(CASE WHEN pr.rating = 2 THEN 1 END),
      '3', COUNT(CASE WHEN pr.rating = 3 THEN 1 END),
      '4', COUNT(CASE WHEN pr.rating = 4 THEN 1 END),
      '5', COUNT(CASE WHEN pr.rating = 5 THEN 1 END)
    ) as rating_distribution,
    now() as last_updated
  FROM public.property_ratings pr
  WHERE pr.property_id = COALESCE(NEW.property_id, OLD.property_id)
  GROUP BY pr.property_id
  ON CONFLICT (property_id) 
  DO UPDATE SET
    average_rating = EXCLUDED.average_rating,
    total_ratings = EXCLUDED.total_ratings,
    rating_distribution = EXCLUDED.rating_distribution,
    last_updated = EXCLUDED.last_updated;
    
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update aggregates
CREATE TRIGGER update_rating_aggregates_on_insert
  AFTER INSERT ON public.property_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_property_rating_aggregates();

CREATE TRIGGER update_rating_aggregates_on_update
  AFTER UPDATE ON public.property_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_property_rating_aggregates();

CREATE TRIGGER update_rating_aggregates_on_delete
  AFTER DELETE ON public.property_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_property_rating_aggregates();

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at on property_ratings
CREATE TRIGGER update_property_ratings_updated_at
  BEFORE UPDATE ON public.property_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();