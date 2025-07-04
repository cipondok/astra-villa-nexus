-- =============================================
-- SAMPLE DATA FOR SERVICE BOOKING PLATFORM
-- =============================================

-- Insert sample service categories (5-level hierarchy)
INSERT INTO public.service_categories (name, slug, parent_id, level, image_path, description) VALUES
-- Level 1: Main Categories
('Home Services', 'home-services', NULL, 1, '/images/categories/home-services.jpg', 'Professional home maintenance and improvement services'),
('Professional Services', 'professional-services', NULL, 1, '/images/categories/professional-services.jpg', 'Expert professional consultation and services'),
('Health & Wellness', 'health-wellness', NULL, 1, '/images/categories/health-wellness.jpg', 'Health, fitness, and wellness services'),
('Automotive', 'automotive', NULL, 1, '/images/categories/automotive.jpg', 'Vehicle maintenance and automotive services'),
('Events & Entertainment', 'events-entertainment', NULL, 1, '/images/categories/events-entertainment.jpg', 'Event planning and entertainment services')
ON CONFLICT (slug, parent_id) DO NOTHING;

-- Get the IDs of the main categories for reference
WITH main_cats AS (
  SELECT id, slug FROM public.service_categories WHERE level = 1
)
-- Level 2: Sub Categories
INSERT INTO public.service_categories (name, slug, parent_id, level, image_path, description) 
SELECT name, slug, main_cats.id, 2, image_path, description
FROM main_cats
CROSS JOIN (VALUES
  ('Cleaning Services', 'cleaning-services', '/images/categories/cleaning-services.jpg', 'Professional cleaning services for homes and offices'),
  ('Repair & Maintenance', 'repair-maintenance', '/images/categories/repair-maintenance.jpg', 'Home repair and maintenance services'),
  ('Installation Services', 'installation-services', '/images/categories/installation-services.jpg', 'Professional installation services')
) AS sub_cats(name, slug, image_path, description)
WHERE main_cats.slug = 'home-services'
ON CONFLICT (slug, parent_id) DO NOTHING;

-- Insert sample locations (3-tier: state → city → area)
INSERT INTO public.service_locations (state_name, state_code, city_name, city_code, area_name, area_code, postal_code) VALUES
-- California locations
('California', 'CA', 'Los Angeles', 'LA', 'Downtown', 'DT', '90012'),
('California', 'CA', 'Los Angeles', 'LA', 'Beverly Hills', 'BH', '90210'),
('California', 'CA', 'Los Angeles', 'LA', 'Santa Monica', 'SM', '90401'),
('California', 'CA', 'San Francisco', 'SF', 'Financial District', 'FD', '94104'),
('California', 'CA', 'San Francisco', 'SF', 'Mission District', 'MD', '94110'),
('California', 'CA', 'San Diego', 'SD', 'Gaslamp Quarter', 'GQ', '92101'),

-- New York locations
('New York', 'NY', 'New York City', 'NYC', 'Manhattan', 'MN', '10001'),
('New York', 'NY', 'New York City', 'NYC', 'Brooklyn', 'BK', '11201'),
('New York', 'NY', 'New York City', 'NYC', 'Queens', 'QN', '11101'),
('New York', 'NY', 'Buffalo', 'BUF', 'Downtown', 'DT', '14202'),

-- Texas locations
('Texas', 'TX', 'Houston', 'HOU', 'Downtown', 'DT', '77002'),
('Texas', 'TX', 'Dallas', 'DAL', 'Deep Ellum', 'DE', '75226'),
('Texas', 'TX', 'Austin', 'AUS', 'South by Southwest', 'SXSW', '78701')
ON CONFLICT (state_code, city_code, area_code) DO NOTHING;

-- Add default media files for categories
INSERT INTO public.media_files (
  original_filename, stored_filename, file_path, file_size, mime_type, 
  entity_type, entity_id, is_featured, alt_text
) 
SELECT 
  'default-' || slug || '.jpg',
  'default-' || slug || '-' || id::text || '.jpg',
  '/images/categories/default-' || slug || '.jpg',
  1024,
  'image/jpeg',
  'category',
  id,
  true,
  'Default image for ' || name || ' category'
FROM public.service_categories
WHERE level = 1
ON CONFLICT (stored_filename) DO NOTHING;