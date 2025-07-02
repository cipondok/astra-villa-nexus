
-- Update main categories to match your new structure
UPDATE public.vendor_main_categories 
SET 
  name = 'Property Services',
  slug = 'property-services',
  icon = '🏠',
  description = 'Construction, repairs, maintenance (physical property focus)'
WHERE id = 'cat_prop';

UPDATE public.vendor_main_categories 
SET 
  name = 'Rentals & Logistics',
  slug = 'rentals-logistics', 
  icon = '🚚',
  description = 'Vehicles, equipment rentals, moving services'
WHERE id = 'cat_rental';

UPDATE public.vendor_main_categories 
SET 
  name = 'Electronics & Appliances',
  slug = 'electronics',
  icon = '🔌',
  description = 'Smart home devices, kitchen appliances, tech installations'
WHERE id = 'cat_elect';

UPDATE public.vendor_main_categories 
SET 
  name = 'Furniture & Decor',
  slug = 'furniture-decor',
  icon = '🛋️', 
  description = 'Budget to luxury furniture & décor items'
WHERE id = 'cat_furn';

UPDATE public.vendor_main_categories 
SET 
  name = 'Subscription Services',
  slug = 'memberships',
  icon = '🔄',
  description = 'Recurring maintenance plans (AC, plumbing, etc.)'
WHERE id = 'cat_sub';

-- Add new main categories (Building Materials and Design & Architecture)
INSERT INTO public.vendor_main_categories (id, name, slug, description, icon, display_order) VALUES
('vendor_cat_materials', 'Building Materials', 'building-materials', 'Raw materials (local/imported) - Moved from subcategory to main', '🧱', 6),
('vendor_cat_design', 'Design & Architecture', 'design-architecture', 'Architectural planning, interior design - Promoted from subcategory', '🏗️', 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- Remove Building Materials and Design & Architecture from subcategories since they're now main categories
DELETE FROM public.vendor_subcategories WHERE id IN ('cat_mat', 'cat_design');

-- Update subcategories that were under these to point to new main categories
UPDATE public.vendor_subcategories 
SET main_category_id = 'vendor_cat_materials'
WHERE id IN ('sub_mat1', 'sub_mat2');

UPDATE public.vendor_subcategories 
SET main_category_id = 'vendor_cat_design'
WHERE id IN ('sub_design1', 'sub_design2');

-- Update vendor services to reflect new main category structure
UPDATE public.vendor_services 
SET main_category_id = 'vendor_cat_materials'
WHERE main_category_id = 'cat_mat';

UPDATE public.vendor_services 
SET main_category_id = 'vendor_cat_design'
WHERE main_category_id = 'cat_design';
