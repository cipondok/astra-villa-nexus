-- Update subcategories to link to existing main categories
UPDATE public.vendor_sub_categories SET 
main_category_id = (SELECT id FROM vendor_main_categories WHERE name = 'Home Services' LIMIT 1)
WHERE name IN ('Electrical', 'Plumbing');

UPDATE public.vendor_sub_categories SET 
main_category_id = (SELECT id FROM vendor_main_categories WHERE name = 'Cleaning & Sanitation' LIMIT 1)
WHERE name = 'Cleaning';

UPDATE public.vendor_sub_categories SET 
main_category_id = (SELECT id FROM vendor_main_categories WHERE name = 'Professional Services' LIMIT 1)
WHERE name IN ('Vehicle Rentals', 'Equipment');

UPDATE public.vendor_sub_categories SET 
main_category_id = (SELECT id FROM vendor_main_categories WHERE name = 'Construction & Maintenance' LIMIT 1)
WHERE name IN ('Flooring', 'Roofing');

UPDATE public.vendor_sub_categories SET 
main_category_id = (SELECT id FROM vendor_main_categories WHERE name = 'Creative & Design' LIMIT 1)
WHERE name IN ('Living Room', 'Office');