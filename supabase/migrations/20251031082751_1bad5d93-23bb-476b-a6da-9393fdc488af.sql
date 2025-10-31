-- Create featured_ads table for carousel
CREATE TABLE public.featured_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.featured_ads ENABLE ROW LEVEL SECURITY;

-- Allow public to view active featured ads
CREATE POLICY "Featured ads are viewable by everyone" 
ON public.featured_ads 
FOR SELECT 
USING (is_active = true);

-- Allow authenticated users to manage featured ads (for admin)
CREATE POLICY "Authenticated users can manage featured ads" 
ON public.featured_ads 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create index for ordering
CREATE INDEX idx_featured_ads_order ON public.featured_ads(display_order, created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_featured_ads_updated_at
BEFORE UPDATE ON public.featured_ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();