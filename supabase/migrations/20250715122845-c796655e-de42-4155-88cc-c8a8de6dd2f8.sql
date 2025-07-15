-- Add more diverse product categories beyond household items using proper UUIDs
INSERT INTO public.vendor_main_categories (id, name, description, icon, type, display_order, is_active, discount_eligible) VALUES
  ('a1ac10b1-58cc-4372-a567-0e02b2c3d479', 'Automotive & Transportation', 'Vehicles, parts, accessories, and transportation equipment', '🚗', 'product', 10, true, true),
  ('a2ac10b1-58cc-4372-a567-0e02b2c3d479', 'Sports & Recreation', 'Sports equipment, outdoor gear, fitness products', '⚽', 'product', 11, true, true),
  ('a3ac10b1-58cc-4372-a567-0e02b2c3d479', 'Health & Beauty', 'Healthcare products, cosmetics, wellness items', '💊', 'product', 12, true, true),
  ('a4ac10b1-58cc-4372-a567-0e02b2c3d479', 'Books & Media', 'Books, magazines, digital media, educational materials', '📚', 'product', 13, true, true),
  ('a5ac10b1-58cc-4372-a567-0e02b2c3d479', 'Industrial & Manufacturing', 'Industrial equipment, machinery, manufacturing tools', '🏭', 'product', 14, true, true),
  ('a6ac10b1-58cc-4372-a567-0e02b2c3d479', 'Food & Beverages', 'Food products, drinks, culinary ingredients', '🍎', 'product', 15, true, true),
  ('a7ac10b1-58cc-4372-a567-0e02b2c3d479', 'Agriculture & Farming', 'Agricultural products, farming equipment, livestock', '🌾', 'product', 16, true, true),
  ('a8ac10b1-58cc-4372-a567-0e02b2c3d479', 'Business & Office', 'Office supplies, business equipment, commercial products', '💼', 'product', 17, true, true),
  ('a9ac10b1-58cc-4372-a567-0e02b2c3d479', 'Arts & Crafts', 'Art supplies, craft materials, creative tools', '🎨', 'product', 18, true, true),
  ('b1ac10b1-58cc-4372-a567-0e02b2c3d479', 'Toys & Games', 'Children toys, board games, entertainment products', '🧸', 'product', 19, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  type = EXCLUDED.type,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  discount_eligible = EXCLUDED.discount_eligible,
  updated_at = now();

-- Add subcategories for these new product categories
INSERT INTO public.vendor_sub_categories (id, name, description, icon, main_category_id, display_order, is_active) VALUES
  -- Automotive & Transportation subcategories
  ('auto1111-58cc-4372-a567-0e02b2c3d479', 'Cars & Motorcycles', 'Vehicles for personal transportation', '🚗', 'a1ac10b1-58cc-4372-a567-0e02b2c3d479', 1, true),
  ('auto2222-58cc-4372-a567-0e02b2c3d479', 'Auto Parts & Accessories', 'Vehicle parts, accessories, and modifications', '🔧', 'a1ac10b1-58cc-4372-a567-0e02b2c3d479', 2, true),
  ('auto3333-58cc-4372-a567-0e02b2c3d479', 'Commercial Vehicles', 'Trucks, buses, commercial transportation', '🚛', 'a1ac10b1-58cc-4372-a567-0e02b2c3d479', 3, true),
  
  -- Sports & Recreation subcategories
  ('spor1111-58cc-4372-a567-0e02b2c3d479', 'Fitness Equipment', 'Exercise machines, weights, fitness gear', '🏋️', 'a2ac10b1-58cc-4372-a567-0e02b2c3d479', 1, true),
  ('spor2222-58cc-4372-a567-0e02b2c3d479', 'Outdoor & Camping', 'Camping gear, outdoor equipment, adventure sports', '🏕️', 'a2ac10b1-58cc-4372-a567-0e02b2c3d479', 2, true),
  ('spor3333-58cc-4372-a567-0e02b2c3d479', 'Team Sports', 'Football, basketball, volleyball equipment', '⚽', 'a2ac10b1-58cc-4372-a567-0e02b2c3d479', 3, true),
  
  -- Health & Beauty subcategories
  ('heal1111-58cc-4372-a567-0e02b2c3d479', 'Medical Equipment', 'Healthcare devices, medical supplies', '🩺', 'a3ac10b1-58cc-4372-a567-0e02b2c3d479', 1, true),
  ('heal2222-58cc-4372-a567-0e02b2c3d479', 'Cosmetics & Skincare', 'Beauty products, skincare, makeup', '💄', 'a3ac10b1-58cc-4372-a567-0e02b2c3d479', 2, true),
  ('heal3333-58cc-4372-a567-0e02b2c3d479', 'Supplements & Vitamins', 'Health supplements, vitamins, nutrition', '💊', 'a3ac10b1-58cc-4372-a567-0e02b2c3d479', 3, true),
  
  -- Industrial & Manufacturing subcategories
  ('indu1111-58cc-4372-a567-0e02b2c3d479', 'Heavy Machinery', 'Construction equipment, industrial machines', '🚜', 'a5ac10b1-58cc-4372-a567-0e02b2c3d479', 1, true),
  ('indu2222-58cc-4372-a567-0e02b2c3d479', 'Manufacturing Tools', 'Production tools, factory equipment', '🔨', 'a5ac10b1-58cc-4372-a567-0e02b2c3d479', 2, true),
  ('indu3333-58cc-4372-a567-0e02b2c3d479', 'Safety Equipment', 'Industrial safety gear, protective equipment', '🦺', 'a5ac10b1-58cc-4372-a567-0e02b2c3d479', 3, true),
  
  -- Agriculture & Farming subcategories
  ('agri1111-58cc-4372-a567-0e02b2c3d479', 'Farm Equipment', 'Tractors, plows, agricultural machinery', '🚜', 'a7ac10b1-58cc-4372-a567-0e02b2c3d479', 1, true),
  ('agri2222-58cc-4372-a567-0e02b2c3d479', 'Seeds & Plants', 'Agricultural seeds, plants, crops', '🌱', 'a7ac10b1-58cc-4372-a567-0e02b2c3d479', 2, true),
  ('agri3333-58cc-4372-a567-0e02b2c3d479', 'Livestock & Pets', 'Animals, pet supplies, veterinary products', '🐄', 'a7ac10b1-58cc-4372-a567-0e02b2c3d479', 3, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  main_category_id = EXCLUDED.main_category_id,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();