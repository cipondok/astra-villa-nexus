-- Create the missing vendor_sub_categories table
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

-- Add missing type column to vendor_main_categories
ALTER TABLE public.vendor_main_categories 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'service' CHECK (type IN ('service', 'product'));

-- Add missing columns to approved_service_names
ALTER TABLE public.approved_service_names 
ADD COLUMN IF NOT EXISTS sub_category_id UUID REFERENCES vendor_sub_categories(id),
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'service' CHECK (type IN ('service', 'product'));

-- Add missing columns to vendor_service_categories
ALTER TABLE public.vendor_service_categories 
ADD COLUMN IF NOT EXISTS approved_service_name_id UUID REFERENCES approved_service_names(id),
ADD COLUMN IF NOT EXISTS implementation_type TEXT;

-- Add missing columns to vendor_services
ALTER TABLE public.vendor_services 
ADD COLUMN IF NOT EXISTS main_category_id UUID REFERENCES vendor_main_categories(id),
ADD COLUMN IF NOT EXISTS sub_category_id UUID REFERENCES vendor_sub_categories(id),
ADD COLUMN IF NOT EXISTS service_location_state TEXT,
ADD COLUMN IF NOT EXISTS service_location_city TEXT,
ADD COLUMN IF NOT EXISTS service_location_area TEXT;

-- Enable RLS on vendor_sub_categories
ALTER TABLE public.vendor_sub_categories ENABLE ROW LEVEL SECURITY;

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

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_sub_categories_updated_at
BEFORE UPDATE ON public.vendor_sub_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for the hierarchy

-- Update existing main categories with type
UPDATE public.vendor_main_categories SET type = 'service' WHERE type IS NULL;

-- Insert Sub Categories
INSERT INTO public.vendor_sub_categories (main_category_id, name, description, icon, display_order) VALUES
-- Property Services subcategories
((SELECT id FROM vendor_main_categories WHERE name = 'Property Services' LIMIT 1), 'Electrical', 'Electrical services and installations', '⚡', 1),
((SELECT id FROM vendor_main_categories WHERE name = 'Property Services' LIMIT 1), 'Plumbing', 'Plumbing services and repairs', '🔧', 2),
((SELECT id FROM vendor_main_categories WHERE name = 'Property Services' LIMIT 1), 'Cleaning', 'Professional cleaning services', '🧽', 3),

-- Rentals subcategories  
((SELECT id FROM vendor_main_categories WHERE name = 'Rentals' LIMIT 1), 'Vehicle Rentals', 'Car, truck, and vehicle rentals', '🚙', 1),
((SELECT id FROM vendor_main_categories WHERE name = 'Rentals' LIMIT 1), 'Equipment', 'Construction and tool equipment rentals', '🔨', 2),

-- Building Materials subcategories
((SELECT id FROM vendor_main_categories WHERE name = 'Building Materials' LIMIT 1), 'Flooring', 'Floor materials and installation', '📐', 1),
((SELECT id FROM vendor_main_categories WHERE name = 'Building Materials' LIMIT 1), 'Roofing', 'Roofing materials and supplies', '🏘️', 2),

-- Furniture subcategories
((SELECT id FROM vendor_main_categories WHERE name = 'Furniture' LIMIT 1), 'Living Room', 'Living room furniture and accessories', '🛋️', 1),
((SELECT id FROM vendor_main_categories WHERE name = 'Furniture' LIMIT 1), 'Office', 'Office furniture and equipment', '💼', 2);

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