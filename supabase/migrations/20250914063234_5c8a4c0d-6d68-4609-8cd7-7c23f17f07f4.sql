-- Add missing columns to vendor_main_categories if they don't exist
ALTER TABLE vendor_main_categories 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'service',
ADD COLUMN IF NOT EXISTS discount_eligible BOOLEAN DEFAULT true;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS vendor_main_categories_slug_idx ON vendor_main_categories(slug);

-- Create service name requests table if not exists
CREATE TABLE IF NOT EXISTS service_name_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES vendor_service_categories(id),
  requested_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE vendor_main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_service_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_name_requests ENABLE ROW LEVEL SECURITY;

-- Create admin policies for vendor_main_categories
DROP POLICY IF EXISTS "admin_manage_main_categories" ON vendor_main_categories;
CREATE POLICY "admin_manage_main_categories" ON vendor_main_categories
  FOR ALL USING (check_admin_access())
  WITH CHECK (check_admin_access());

DROP POLICY IF EXISTS "public_read_main_categories" ON vendor_main_categories;
CREATE POLICY "public_read_main_categories" ON vendor_main_categories
  FOR SELECT USING (is_active = true);

-- Create admin policies for vendor_sub_categories
DROP POLICY IF EXISTS "admin_manage_sub_categories" ON vendor_sub_categories;
CREATE POLICY "admin_manage_sub_categories" ON vendor_sub_categories
  FOR ALL USING (check_admin_access())
  WITH CHECK (check_admin_access());

DROP POLICY IF EXISTS "public_read_sub_categories" ON vendor_sub_categories;
CREATE POLICY "public_read_sub_categories" ON vendor_sub_categories
  FOR SELECT USING (is_active = true);

-- Create admin policies for approved_service_names
DROP POLICY IF EXISTS "admin_manage_approved_services" ON approved_service_names;
CREATE POLICY "admin_manage_approved_services" ON approved_service_names
  FOR ALL USING (check_admin_access())
  WITH CHECK (check_admin_access());

DROP POLICY IF EXISTS "public_read_approved_services" ON approved_service_names;
CREATE POLICY "public_read_approved_services" ON approved_service_names
  FOR SELECT USING (is_active = true);

-- Create policies for service_name_requests
DROP POLICY IF EXISTS "admin_manage_service_requests" ON service_name_requests;
CREATE POLICY "admin_manage_service_requests" ON service_name_requests
  FOR ALL USING (check_admin_access())
  WITH CHECK (check_admin_access());

DROP POLICY IF EXISTS "vendors_create_service_requests" ON service_name_requests;
CREATE POLICY "vendors_create_service_requests" ON service_name_requests
  FOR INSERT WITH CHECK (requested_by = auth.uid());

DROP POLICY IF EXISTS "vendors_view_own_service_requests" ON service_name_requests;
CREATE POLICY "vendors_view_own_service_requests" ON service_name_requests
  FOR SELECT USING (requested_by = auth.uid() OR check_admin_access());

-- Insert default data if tables are empty
INSERT INTO vendor_main_categories (name, description, icon, slug, type, display_order) 
SELECT * FROM (VALUES
  ('Home Services', 'General home maintenance and repair services', '🏠', 'home-services', 'service', 1),
  ('Construction', 'Building and construction related services', '🏗️', 'construction', 'service', 2),
  ('Cleaning', 'Cleaning and maintenance services', '🧹', 'cleaning', 'service', 3),
  ('Electrical', 'Electrical installation and repair services', '⚡', 'electrical', 'service', 4),
  ('Plumbing', 'Plumbing installation and repair services', '🔧', 'plumbing', 'service', 5),
  ('Landscaping', 'Garden and outdoor maintenance services', '🌿', 'landscaping', 'service', 6)
) AS t(name, description, icon, slug, type, display_order)
WHERE NOT EXISTS (SELECT 1 FROM vendor_main_categories)
ON CONFLICT (slug) DO NOTHING;

-- Insert default subcategories
INSERT INTO vendor_sub_categories (main_category_id, name, description, icon, display_order)
SELECT mc.id, sub.name, sub.description, sub.icon, sub.display_order
FROM vendor_main_categories mc,
(VALUES
  ('home-services', 'General Repair', 'General maintenance and repair work', '🔧', 1),
  ('home-services', 'Appliance Repair', 'Repair of household appliances', '🏠', 2),
  ('construction', 'Renovation', 'Home renovation projects', '🏗️', 1),
  ('construction', 'New Construction', 'New building construction', '🏢', 2),
  ('cleaning', 'House Cleaning', 'Residential cleaning services', '🏠', 1),
  ('cleaning', 'Office Cleaning', 'Commercial cleaning services', '🏢', 2),
  ('electrical', 'Installation', 'Electrical installation work', '💡', 1),
  ('electrical', 'Repair', 'Electrical repair services', '⚡', 2),
  ('plumbing', 'Installation', 'Plumbing installation work', '🚿', 1),
  ('plumbing', 'Repair', 'Plumbing repair services', '🔧', 2)
) AS sub(category_slug, name, description, icon, display_order)
WHERE mc.slug = sub.category_slug
AND NOT EXISTS (SELECT 1 FROM vendor_sub_categories WHERE main_category_id = mc.id AND name = sub.name);

-- Insert default approved service names
INSERT INTO approved_service_names (service_name, description, category_id, is_active)
SELECT svc.service_name, svc.description, vsc.id, true
FROM vendor_service_categories vsc,
(VALUES
  ('Bathroom Renovation', 'Complete bathroom renovation services'),
  ('Kitchen Renovation', 'Complete kitchen renovation services'),
  ('Electrical Wiring', 'Electrical wiring installation and repair'),
  ('Plumbing Installation', 'Plumbing installation services'),
  ('House Cleaning', 'Regular house cleaning services'),
  ('Office Cleaning', 'Commercial office cleaning services'),
  ('Garden Maintenance', 'Garden and landscape maintenance'),
  ('Lawn Mowing', 'Lawn mowing and grass cutting services')
) AS svc(service_name, description)
WHERE NOT EXISTS (SELECT 1 FROM approved_service_names WHERE service_name = svc.service_name)
LIMIT 10;