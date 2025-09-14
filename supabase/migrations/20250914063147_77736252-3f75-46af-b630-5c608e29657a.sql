-- Create vendor main categories table if not exists with proper structure
CREATE TABLE IF NOT EXISTS vendor_main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  slug TEXT UNIQUE,
  type TEXT DEFAULT 'service',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  discount_eligible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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

-- Insert some default main categories if table is empty
INSERT INTO vendor_main_categories (name, description, icon, slug, type, display_order) 
SELECT * FROM (VALUES
  ('Home Services', 'General home maintenance and repair services', '🏠', 'home-services', 'service', 1),
  ('Construction', 'Building and construction related services', '🏗️', 'construction', 'service', 2),
  ('Cleaning', 'Cleaning and maintenance services', '🧹', 'cleaning', 'service', 3),
  ('Electrical', 'Electrical installation and repair services', '⚡', 'electrical', 'service', 4),
  ('Plumbing', 'Plumbing installation and repair services', '🔧', 'plumbing', 'service', 5),
  ('Landscaping', 'Garden and outdoor maintenance services', '🌿', 'landscaping', 'service', 6)
) AS t(name, description, icon, slug, type, display_order)
WHERE NOT EXISTS (SELECT 1 FROM vendor_main_categories);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_vendor_categories_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vendor_main_categories_timestamp ON vendor_main_categories;
CREATE TRIGGER update_vendor_main_categories_timestamp
  BEFORE UPDATE ON vendor_main_categories
  FOR EACH ROW EXECUTE FUNCTION update_vendor_categories_timestamp();

DROP TRIGGER IF EXISTS update_vendor_sub_categories_timestamp ON vendor_sub_categories;
CREATE TRIGGER update_vendor_sub_categories_timestamp
  BEFORE UPDATE ON vendor_sub_categories
  FOR EACH ROW EXECUTE FUNCTION update_vendor_categories_timestamp();