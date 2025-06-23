
-- Create property categories table
CREATE TABLE public.property_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES public.property_categories(id),
  meta_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create property services table
CREATE TABLE public.property_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.property_categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('buy', 'rent', 'new_projects', 'pre_launching')),
  price_range_min NUMERIC,
  price_range_max NUMERIC,
  features JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.property_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_services ENABLE ROW LEVEL SECURITY;

-- Create policies for property categories (public read, admin write)
CREATE POLICY "Anyone can view active property categories" 
  ON public.property_categories 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Only admins can manage property categories" 
  ON public.property_categories 
  FOR ALL 
  USING (public.check_admin_access());

-- Create policies for property services (public read, admin write)
CREATE POLICY "Anyone can view active property services" 
  ON public.property_services 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Only admins can manage property services" 
  ON public.property_services 
  FOR ALL 
  USING (public.check_admin_access());

-- Add updated_at trigger
CREATE TRIGGER update_property_categories_updated_at
  BEFORE UPDATE ON public.property_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_services_updated_at
  BEFORE UPDATE ON public.property_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
