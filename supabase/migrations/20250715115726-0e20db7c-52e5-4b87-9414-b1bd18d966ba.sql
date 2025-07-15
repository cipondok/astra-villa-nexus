-- Insert the missing product categories
INSERT INTO public.vendor_main_categories (id, name, slug, description, icon, type, display_order, is_active) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Electronics & Appliances', 'electronics-appliances', 'Consumer electronics, appliances, and tech products', '📱', 'product', 7, true),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Furniture & Decor', 'furniture-decor', 'Home furniture, decoration, and interior items', '🪑', 'product', 8, true),
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Fashion & Accessories', 'fashion-accessories', 'Clothing, accessories, and fashion items', '👕', 'product', 9, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  type = EXCLUDED.type,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Add some product subcategories
INSERT INTO public.vendor_sub_categories (id, name, slug, description, icon, main_category_id, display_order, is_active) VALUES
  -- Electronics & Appliances subcategories
  ('e1', 'Smartphones & Tablets', 'smartphones-tablets', 'Mobile devices and tablets', '📱', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 1, true),
  ('e2', 'Laptops & Computers', 'laptops-computers', 'Personal computers and laptops', '💻', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 2, true),
  ('e3', 'Home Appliances', 'home-appliances', 'Kitchen and home appliances', '🏠', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 3, true),
  
  -- Furniture & Decor subcategories
  ('f1', 'Living Room Furniture', 'living-room-furniture', 'Sofas, chairs, and living room items', '🛋️', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 1, true),
  ('f2', 'Bedroom Furniture', 'bedroom-furniture', 'Beds, dressers, and bedroom items', '🛏️', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 2, true),
  ('f3', 'Home Decor', 'home-decor', 'Decorative items and accessories', '🎨', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 3, true),
  
  -- Fashion & Accessories subcategories
  ('fa1', 'Men\'s Clothing', 'mens-clothing', 'Men\'s apparel and clothing', '👔', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 1, true),
  ('fa2', 'Women\'s Clothing', 'womens-clothing', 'Women\'s apparel and clothing', '👗', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 2, true),
  ('fa3', 'Accessories & Jewelry', 'accessories-jewelry', 'Fashion accessories and jewelry', '💍', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 3, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  main_category_id = EXCLUDED.main_category_id,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();