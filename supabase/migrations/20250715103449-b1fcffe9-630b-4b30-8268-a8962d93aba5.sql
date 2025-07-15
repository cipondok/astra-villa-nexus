-- Create main categories for Products
INSERT INTO public.vendor_main_categories (name, slug, description, icon, type, display_order, is_active) VALUES
('Electrical & Electronics', 'electrical-electronics', 'Home appliances, wiring, cables, power tools and generators', '⚡', 'product', 1, true),
('Furniture & Household Items', 'furniture-household', 'Sofas, beds, cabinets, kitchenware, decor and outdoor furniture', '🛋️', 'product', 2, true),
('Building Materials', 'building-materials', 'Cement, bricks, tiles, plumbing supplies, paints and coatings', '🧱', 'product', 3, true),
('Repair & Maintenance', 'repair-maintenance', 'Electrical repairs, plumbing, AC servicing with on-site and remote options', '🔧', 'service', 4, true),
('Construction & Design', 'construction-design', 'Architecture, painting, installation services with design capabilities', '🏗️', 'service', 5, true),
('Property & Administrative', 'property-administrative', 'Ownership transfer, cleaning, security, legal documentation services', '📋', 'service', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  type = EXCLUDED.type,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Create subcategories for Electrical & Electronics (Product)
INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Home Appliances', 'Fans, ACs, lights and other home electrical appliances', '🏠', id, 1, true 
FROM public.vendor_main_categories WHERE slug = 'electrical-electronics'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Wiring & Cables', 'Electrical wiring, cables and connection components', '🔌', id, 2, true 
FROM public.vendor_main_categories WHERE slug = 'electrical-electronics'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Power Tools & Generators', 'Electric tools, generators and power equipment', '⚡', id, 3, true 
FROM public.vendor_main_categories WHERE slug = 'electrical-electronics'
ON CONFLICT DO NOTHING;

-- Create subcategories for Furniture & Household Items (Product)
INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Sofas, Beds & Cabinets', 'Living room and bedroom furniture', '🛏️', id, 1, true 
FROM public.vendor_main_categories WHERE slug = 'furniture-household'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Kitchenware & Decor', 'Kitchen items, home decor and accessories', '🍽️', id, 2, true 
FROM public.vendor_main_categories WHERE slug = 'furniture-household'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Outdoor Furniture', 'Garden furniture, patio sets and outdoor equipment', '🌳', id, 3, true 
FROM public.vendor_main_categories WHERE slug = 'furniture-household'
ON CONFLICT DO NOTHING;

-- Create subcategories for Building Materials (Product)
INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Cement, Bricks & Tiles', 'Construction materials for building foundations', '🧱', id, 1, true 
FROM public.vendor_main_categories WHERE slug = 'building-materials'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Plumbing Supplies', 'Pipes, fittings, fixtures for water systems', '🚿', id, 2, true 
FROM public.vendor_main_categories WHERE slug = 'building-materials'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Paints & Coatings', 'Interior and exterior paints, primers and coatings', '🎨', id, 3, true 
FROM public.vendor_main_categories WHERE slug = 'building-materials'
ON CONFLICT DO NOTHING;

-- Create subcategories for Repair & Maintenance (Service)
INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Electrical Repairs', 'On-site electrical troubleshooting and remote consultations', '⚡', id, 1, true 
FROM public.vendor_main_categories WHERE slug = 'repair-maintenance'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Plumbing Services', 'Water system repairs and maintenance services', '🔧', id, 2, true 
FROM public.vendor_main_categories WHERE slug = 'repair-maintenance'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'AC Servicing', 'Air conditioning maintenance and repair services', '❄️', id, 3, true 
FROM public.vendor_main_categories WHERE slug = 'repair-maintenance'
ON CONFLICT DO NOTHING;

-- Create subcategories for Construction & Design (Service)
INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Architecture & Planning', 'Building design, 3D mockups and virtual planning', '📐', id, 1, true 
FROM public.vendor_main_categories WHERE slug = 'construction-design'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Painting Services', 'Interior and exterior painting services', '🎨', id, 2, true 
FROM public.vendor_main_categories WHERE slug = 'construction-design'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Installation Services', 'Kitchen, electronic and furniture installation', '🔨', id, 3, true 
FROM public.vendor_main_categories WHERE slug = 'construction-design'
ON CONFLICT DO NOTHING;

-- Create subcategories for Property & Administrative (Service)
INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Ownership Transfer', 'Property transfer services with on-site and remote support', '📋', id, 1, true 
FROM public.vendor_main_categories WHERE slug = 'property-administrative'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Cleaning Services', 'Professional cleaning for residential and commercial properties', '🧽', id, 2, true 
FROM public.vendor_main_categories WHERE slug = 'property-administrative'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (name, description, icon, main_category_id, display_order, is_active) 
SELECT 'Security & Legal', 'Security services, notary assistance and legal documentation', '🛡️', id, 3, true 
FROM public.vendor_main_categories WHERE slug = 'property-administrative'
ON CONFLICT DO NOTHING;

-- Add service delivery options enum if not exists
DO $$ BEGIN
    CREATE TYPE service_delivery_type AS ENUM ('on_site', 'remote', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add service delivery options column to vendor_services table
ALTER TABLE public.vendor_services 
ADD COLUMN IF NOT EXISTS service_delivery_options service_delivery_type[] DEFAULT ARRAY['on_site'::service_delivery_type];

-- Update existing services to have default delivery option
UPDATE public.vendor_services 
SET service_delivery_options = ARRAY['on_site'::service_delivery_type] 
WHERE service_delivery_options IS NULL;