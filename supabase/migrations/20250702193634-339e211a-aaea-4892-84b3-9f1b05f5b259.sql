
-- Insert additional subcategories for Rentals & Logistics (cat_rental)
INSERT INTO public.vendor_subcategories (id, name, slug, main_category_id, description, icon, display_order) VALUES
('sub_rent1', 'Daily/Monthly Car Rentals', 'car-rental', 'cat_rental', 'Car rental services for daily or monthly periods', '🚗', 1),
('sub_rent2', 'Moving & Shifting Services', 'house-moving', 'cat_rental', 'Professional moving and relocation services', '📦', 2),
('sub_rent3', 'Driver Services', 'drivers', 'cat_rental', 'Professional driver services', '👨‍✈️', 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  main_category_id = EXCLUDED.main_category_id,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- Insert subcategories for Electronics & Appliances (cat_elect)
INSERT INTO public.vendor_subcategories (id, name, slug, main_category_id, description, icon, display_order) VALUES
('sub_elec1', 'Smart Home Devices', 'smart-devices', 'cat_elect', 'Smart home automation and IoT devices', '🏠', 1),
('sub_elec2', 'Kitchen Appliances', 'kitchen-appliances', 'cat_elect', 'Modern kitchen appliances and equipment', '🍳', 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  main_category_id = EXCLUDED.main_category_id,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- Insert subcategories for Furniture & Decor (cat_furn)
INSERT INTO public.vendor_subcategories (id, name, slug, main_category_id, description, icon, display_order) VALUES
('sub_furn1', 'Budget Furniture', 'budget-furniture', 'cat_furn', 'Affordable furniture options', '🪑', 1),
('sub_furn2', 'Luxury Furniture', 'luxury-furniture', 'cat_furn', 'Premium and luxury furniture pieces', '🛋️', 2),
('sub_furn3', 'Custom Woodwork', 'custom-wood', 'cat_furn', 'Custom wooden furniture and carpentry', '🌳', 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  main_category_id = EXCLUDED.main_category_id,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- Insert subcategories for Subscription Services (cat_sub)
INSERT INTO public.vendor_subcategories (id, name, slug, main_category_id, description, icon, display_order) VALUES
('sub_sub1', 'AC Maintenance (3-Month Plan)', 'ac-membership', 'cat_sub', 'Regular AC maintenance subscription service', '❄️', 1),
('sub_sub2', 'Plumbing Checkups', 'plumbing-membership', 'cat_sub', 'Regular plumbing inspection and maintenance', '🔧', 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  main_category_id = EXCLUDED.main_category_id,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- Insert sample vendor services
INSERT INTO public.vendor_services (id, service_name, main_category_id, subcategory_id, service_description, price_range, duration_minutes, location_type, is_active, featured, vendor_id) VALUES
('svc_001', 'Full Home Wiring', 'cat_prop', 'sub_elec1', 'Complete electrical wiring for residential properties', '{"min": 200, "max": 500}', 480, 'on_site', true, false, 'demo-vendor-789'),
('svc_002', 'Imported Italian Marble Installation', 'cat_prop', 'sub_mat2', 'Premium Italian marble installation service', '{"min": 50, "max": 50}', 360, 'on_site', true, true, 'demo-vendor-789'),
('svc_003', 'Modern Interior Design (Per Room)', 'cat_prop', 'sub_design1', 'Contemporary interior design services for individual rooms', '{"min": 300, "max": 800}', 240, 'on_site', true, false, 'demo-vendor-789'),
('svc_004', 'AC Gas Refill + Servicing', 'cat_prop', 'sub_repair2', 'Complete AC maintenance including gas refill and servicing', '{"min": 80, "max": 150}', 120, 'on_site', true, false, 'demo-vendor-789'),
('svc_005', 'Monthly Car Rental (SUV)', 'cat_rental', 'sub_rent1', 'Monthly SUV rental service with flexible terms', '{"min": 600, "max": 600}', 0, 'pickup_delivery', true, false, 'demo-vendor-789'),
('svc_006', 'Luxury Sofa Set (Customizable)', 'cat_furn', 'sub_furn2', 'Premium customizable luxury sofa sets', '{"min": 1200, "max": 3000}', 0, 'business_location', true, true, 'demo-vendor-789'),
('svc_007', 'AC Membership (4 Visits/Year)', 'cat_sub', 'sub_sub1', 'Annual AC maintenance membership with 4 scheduled visits', '{"min": 200, "max": 200}', 60, 'on_site', true, false, 'demo-vendor-789')
ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name,
  main_category_id = EXCLUDED.main_category_id,
  subcategory_id = EXCLUDED.subcategory_id,
  service_description = EXCLUDED.service_description,
  price_range = EXCLUDED.price_range,
  duration_minutes = EXCLUDED.duration_minutes,
  location_type = EXCLUDED.location_type,
  is_active = EXCLUDED.is_active,
  featured = EXCLUDED.featured;
