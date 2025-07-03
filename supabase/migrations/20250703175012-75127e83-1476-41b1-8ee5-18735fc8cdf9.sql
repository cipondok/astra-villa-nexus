-- Fix subcategories that have null main_category_id
UPDATE public.vendor_sub_categories SET 
main_category_id = (SELECT id FROM vendor_main_categories WHERE name = 'Property Services' LIMIT 1)
WHERE name IN ('Electrical', 'Plumbing', 'Cleaning');

UPDATE public.vendor_sub_categories SET 
main_category_id = (SELECT id FROM vendor_main_categories WHERE name = 'Rentals' LIMIT 1)
WHERE name IN ('Vehicle Rentals', 'Equipment');

UPDATE public.vendor_sub_categories SET 
main_category_id = (SELECT id FROM vendor_main_categories WHERE name = 'Building Materials' LIMIT 1)
WHERE name IN ('Flooring', 'Roofing');

UPDATE public.vendor_sub_categories SET 
main_category_id = (SELECT id FROM vendor_main_categories WHERE name = 'Furniture' LIMIT 1)
WHERE name IN ('Living Room', 'Office');