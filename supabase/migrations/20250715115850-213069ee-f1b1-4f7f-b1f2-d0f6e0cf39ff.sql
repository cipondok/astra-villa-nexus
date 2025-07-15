-- Insert the missing product categories
INSERT INTO public.vendor_main_categories (id, name, description, icon, type, display_order, is_active, discount_eligible) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Electronics & Appliances', 'Consumer electronics, appliances, and tech products', '📱', 'product', 7, true, true),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Furniture & Decor', 'Home furniture, decoration, and interior items', '🪑', 'product', 8, true, true),
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Fashion & Accessories', 'Clothing, accessories, and fashion items', '👕', 'product', 9, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  type = EXCLUDED.type,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  discount_eligible = EXCLUDED.discount_eligible,
  updated_at = now();

-- Add some product subcategories
INSERT INTO public.vendor_sub_categories (id, name, description, icon, main_category_id, display_order, is_active) VALUES
  -- Electronics & Appliances subcategories
  ('e1', 'Smartphones & Tablets', 'Mobile devices and tablets', '📱', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 1, true),
  ('e2', 'Laptops & Computers', 'Personal computers and laptops', '💻', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 2, true),
  ('e3', 'Home Appliances', 'Kitchen and home appliances', '🏠', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 3, true),
  
  -- Furniture & Decor subcategories
  ('f1', 'Living Room Furniture', 'Sofas, chairs, and living room items', '🛋️', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 1, true),
  ('f2', 'Bedroom Furniture', 'Beds, dressers, and bedroom items', '🛏️', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 2, true),
  ('f3', 'Home Decor', 'Decorative items and accessories', '🎨', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 3, true),
  
  -- Fashion & Accessories subcategories
  ('fa1', 'Mens Clothing', 'Mens apparel and clothing', '👔', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 1, true),
  ('fa2', 'Womens Clothing', 'Womens apparel and clothing', '👗', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 2, true),
  ('fa3', 'Accessories & Jewelry', 'Fashion accessories and jewelry', '💍', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 3, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  main_category_id = EXCLUDED.main_category_id,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();