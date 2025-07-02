
-- Create main categories table
CREATE TABLE IF NOT EXISTS public.vendor_main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update existing subcategories table to reference main categories
ALTER TABLE public.vendor_subcategories 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique constraint on slug for subcategories
ALTER TABLE public.vendor_subcategories 
ADD CONSTRAINT vendor_subcategories_slug_unique UNIQUE (slug);

-- Insert main categories
INSERT INTO public.vendor_main_categories (id, name, slug, description, icon, display_order) VALUES
('cat_prop', 'Property Services', 'property-services', 'All construction, repair, and maintenance services', '🏠', 1),
('cat_rental', 'Rentals & Logistics', 'rentals-logistics', 'Short-term rentals, moving services', '🚚', 2),
('cat_elect', 'Electronics & Appliances', 'electronics', 'New gadgets, smart home devices', '⚡', 3),
('cat_furn', 'Furniture & Decor', 'furniture-decor', 'Budget to luxury furniture', '🛋️', 4),
('cat_sub', 'Subscription Services', 'memberships', 'Maintenance plans (e.g., AC checkups)', '📋', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- Insert subcategories under Property Services
INSERT INTO public.vendor_subcategories (id, name, slug, main_category_id, description, icon, display_order) VALUES
('cat_elec', 'Electrical Services', 'electrical', 'cat_prop', 'Wiring, fixtures, smart home setups', '⚡', 1),
('cat_mat', 'Building Materials', 'materials', 'cat_prop', 'Local/imported raw materials (wood, steel, etc.)', '🧱', 2),
('cat_design', 'Design & Architecture', 'design-architecture', 'cat_prop', 'Interior/exterior design, 3D modeling', '🎨', 3),
('cat_repair', 'Repair & Maintenance', 'repair-maintenance', 'cat_prop', 'Plumbing, AC, kitchen fixes', '🔧', 4),
('sub_elec1', 'Wiring & Installations', 'electrical-wiring', 'cat_elec', 'Professional electrical wiring and installations', '🔌', 1),
('sub_elec2', 'Smart Home Setup', 'smart-home', 'cat_elec', 'Smart home automation and IoT device setup', '🏡', 2),
('sub_mat1', 'Local Materials', 'local-materials', 'cat_mat', 'Local materials like wood, brick, cement', '🌳', 1),
('sub_mat2', 'Imported Luxury Materials', 'imported-materials', 'cat_mat', 'Premium imported construction materials', '💎', 2),
('sub_design1', 'Interior Design', 'interior-design', 'cat_design', 'Interior design and decoration services', '🎨', 1),
('sub_design2', 'Architectural Planning', 'architecture', 'cat_design', 'Architectural planning and 3D modeling', '📐', 2),
('sub_repair1', 'Kitchen Repairs', 'kitchen-repairs', 'cat_repair', 'Kitchen appliance and fixture repairs', '🍳', 1),
('sub_repair2', 'AC Servicing', 'ac-repair', 'cat_repair', 'Air conditioning maintenance and repair', '❄️', 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  main_category_id = EXCLUDED.main_category_id,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- Add RLS policies for main categories
ALTER TABLE public.vendor_main_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view main categories" ON public.vendor_main_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage main categories" ON public.vendor_main_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update vendor_services table to use main_category_id and subcategory_id
ALTER TABLE public.vendor_services 
ADD COLUMN IF NOT EXISTS main_category_id UUID REFERENCES public.vendor_main_categories(id),
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES public.vendor_subcategories(id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_main_categories_updated_at 
    BEFORE UPDATE ON public.vendor_main_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
