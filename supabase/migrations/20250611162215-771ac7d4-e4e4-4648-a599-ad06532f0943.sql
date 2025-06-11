
-- Create vendor property listings table
CREATE TABLE public.vendor_property_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  location TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  area_sqm INTEGER DEFAULT 0,
  price NUMERIC(15,2) NOT NULL DEFAULT 0,
  price_type TEXT DEFAULT 'monthly',
  is_furnished BOOLEAN DEFAULT false,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.vendor_property_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor property listings
CREATE POLICY "Vendors can view their own listings" 
  ON public.vendor_property_listings 
  FOR SELECT 
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can create their own listings" 
  ON public.vendor_property_listings 
  FOR INSERT 
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own listings" 
  ON public.vendor_property_listings 
  FOR UPDATE 
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can delete their own listings" 
  ON public.vendor_property_listings 
  FOR DELETE 
  USING (vendor_id = auth.uid());

-- Create vendor settings table
CREATE TABLE public.vendor_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_settings JSONB DEFAULT '{}',
  business_settings JSONB DEFAULT '{}',
  payment_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vendor_id)
);

-- Add Row Level Security for vendor settings
ALTER TABLE public.vendor_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor settings
CREATE POLICY "Vendors can view their own settings" 
  ON public.vendor_settings 
  FOR SELECT 
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can create their own settings" 
  ON public.vendor_settings 
  FOR INSERT 
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own settings" 
  ON public.vendor_settings 
  FOR UPDATE 
  USING (vendor_id = auth.uid());
