-- Create the new 4-level hierarchy structure

-- 1. Main Categories (Product/Service Type)
CREATE TABLE public.vendor_main_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('service', 'product')),
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Sub Categories (Service Area/Product Class)
CREATE TABLE public.vendor_sub_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  main_category_id UUID REFERENCES vendor_main_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Service Names (Specific Offering) - Update existing table
ALTER TABLE public.approved_service_names 
ADD COLUMN IF NOT EXISTS sub_category_id UUID REFERENCES vendor_sub_categories(id),
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'service' CHECK (type IN ('service', 'product'));

-- 4. Service Categories (Implementation Type) - Rename existing vendor_service_categories
ALTER TABLE public.vendor_service_categories 
ADD COLUMN IF NOT EXISTS approved_service_name_id UUID REFERENCES approved_service_names(id),
ADD COLUMN IF NOT EXISTS implementation_type TEXT;

-- Enable RLS
ALTER TABLE public.vendor_main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_sub_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Main Categories
CREATE POLICY "Everyone can view active main categories" 
ON public.vendor_main_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage main categories" 
ON public.vendor_main_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- RLS Policies for Sub Categories  
CREATE POLICY "Everyone can view active sub categories" 
ON public.vendor_sub_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage sub categories" 
ON public.vendor_sub_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Add triggers for updated_at
CREATE TRIGGER update_vendor_main_categories_updated_at
BEFORE UPDATE ON public.vendor_main_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_sub_categories_updated_at
BEFORE UPDATE ON public.vendor_sub_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for the hierarchy

-- Main Categories
INSERT INTO public.vendor_main_categories (name, description, type, icon, display_order) VALUES
('Property Services', 'All property-related services', 'service', '🏠', 1),
('Rentals', 'Equipment and vehicle rental services', 'service', '🚗', 2),
('Building Materials', 'Construction and building materials', 'product', '🧱', 3),
('Furniture', 'Home and office furniture', 'product', '🪑', 4);

-- Sub Categories
INSERT INTO public.vendor_sub_categories (main_category_id, name, description, icon, display_order) VALUES
-- Property Services subcategories
((SELECT id FROM vendor_main_categories WHERE name = 'Property Services'), 'Electrical', 'Electrical services and installations', '⚡', 1),
((SELECT id FROM vendor_main_categories WHERE name = 'Property Services'), 'Plumbing', 'Plumbing services and repairs', '🔧', 2),
((SELECT id FROM vendor_main_categories WHERE name = 'Property Services'), 'Cleaning', 'Professional cleaning services', '🧽', 3),

-- Rentals subcategories  
((SELECT id FROM vendor_main_categories WHERE name = 'Rentals'), 'Vehicle Rentals', 'Car, truck, and vehicle rentals', '🚙', 1),
((SELECT id FROM vendor_main_categories WHERE name = 'Rentals'), 'Equipment', 'Construction and tool equipment rentals', '🔨', 2),

-- Building Materials subcategories
((SELECT id FROM vendor_main_categories WHERE name = 'Building Materials'), 'Flooring', 'Floor materials and installation', '📐', 1),
((SELECT id FROM vendor_main_categories WHERE name = 'Building Materials'), 'Roofing', 'Roofing materials and supplies', '🏘️', 2),

-- Furniture subcategories
((SELECT id FROM vendor_main_categories WHERE name = /'), 'Living Room', 'Living room furniture and accessories', '🛋️', 1),
((SELECT id FROM vendor_main_categories WHERE name = 'Furniture'), 'Office', 'Office furniture and equipment', '💼', 2);

-- Update approved service names with sub categories
UPDATE public.approved_service_names SET 
sub_category_id = (SELECT id FROM vendor_sub_categories WHERE name = 'Electrical' LIMIT 1),
type = 'service'
WHERE service_name IN ('Electrical Installation', 'Smart Home Setup');

UPDATE public.approved_service_names SET 
sub_category_id = (SELECT id FROM vendor_sub_categories WHERE name = 'Plumbing' LIMIT 1),
type = 'service'
WHERE service_name IN ('Plumbing Services');

UPDATE public.approved_service_names SET 
sub_category_id = (SELECT id FROM vendor_sub_categories WHERE name = 'Cleaning' LIMIT 1),
type = 'service'
WHERE service_name IN ('House Cleaning', 'Deep House Cleaning', 'Move-in/Move-out Cleaning', 'Office Cleaning Services');

-- Add more specific service names
INSERT INTO public.approved_service_names (service_name, description, sub_category_id, type) VALUES
('Wiring Installation', 'Complete electrical wiring services', (SELECT id FROM vendor_sub_categories WHERE name = 'Electrical'), 'service'),
('Emergency Repair', 'Emergency plumbing repair services', (SELECT id FROM vendor_sub_categories WHERE name = 'Plumbing'), 'service'),
('Monthly Car Rental', 'Long-term monthly vehicle rentals', (SELECT id FROM vendor_sub_categories WHERE name = 'Vehicle Rentals'), 'service'),
('Scaffolding Rental', 'Construction scaffolding rental', (SELECT id FROM vendor_sub_categories WHERE name = 'Equipment'), 'service'),
('Imported Marble', 'Premium imported marble flooring', (SELECT id FROM vendor_sub_categories WHERE name = 'Flooring'), 'product'),
('Eco-Friendly Tiles', 'Sustainable roofing tile solutions', (SELECT id FROM vendor_sub_categories WHERE name = 'Roofing'), 'product'),
('Luxury Sofas', 'High-end living room sofas', (SELECT id FROM vendor_sub_categories WHERE name = 'Living Room'), 'product');

-- Update service categories with implementation types
UPDATE public.vendor_service_categories SET 
implementation_type = 'Residential'
WHERE name ILIKE '%home%' OR name ILIKE '%residential%';

UPDATE public.vendor_service_categories SET 
implementation_type = 'Commercial'  
WHERE name ILIKE '%commercial%' OR name ILIKE '%office%';

-- Add sample service categories for the new hierarchy
INSERT INTO public.vendor_service_categories (name, description, icon, approved_service_name_id, implementation_type) VALUES
('Residential', 'Residential implementation', '🏡', (SELECT id FROM approved_service_names WHERE service_name = 'Wiring Installation'), 'Residential'),
('Commercial', 'Commercial implementation', '🏢', (SELECT id FROM approved_service_names WHERE service_name = 'Wiring Installation'), 'Commercial'),
('Industrial', 'Industrial implementation', '🏭', (SELECT id FROM approved_service_names WHERE service_name = 'Wiring Installation'), 'Industrial'),
('Full System', 'Complete smart home system', '🏠', (SELECT id FROM approved_service_names WHERE service_name = 'Smart Home Setup'), 'Full System'),
('Partial Upgrade', 'Partial smart home upgrade', '⚡', (SELECT id FROM approved_service_names WHERE service_name = 'Smart Home Setup'), 'Partial Upgrade');

-- Update vendor_services table to use the new hierarchy
ALTER TABLE public.vendor_services 
ADD COLUMN IF NOT EXISTS main_category_id UUID REFERENCES vendor_main_categories(id),
ADD COLUMN IF NOT EXISTS sub_category_id UUID REFERENCES vendor_sub_categories(id),
ADD COLUMN IF NOT EXISTS service_location_state TEXT,
ADD COLUMN IF NOT EXISTS service_location_city TEXT,
ADD COLUMN IF NOT EXISTS service_location_area TEXT;