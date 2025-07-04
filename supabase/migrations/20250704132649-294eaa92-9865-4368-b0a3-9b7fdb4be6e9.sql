-- Create new hierarchical vendor categories table
CREATE TABLE vendor_categories_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_id VARCHAR(100) NOT NULL,
  level INTEGER NOT NULL, -- 1=main, 2=sub, 3=specialization
  parent_id UUID REFERENCES vendor_categories_hierarchy(id),
  vendor_type VARCHAR(20) NOT NULL, -- 'product', 'service', 'both'
  requirements JSONB DEFAULT '{}', -- {"docs":["skk","npwp"],"equipment":true}
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  icon VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add Indonesian compliance fields to vendor_business_profiles
ALTER TABLE vendor_business_profiles ADD COLUMN IF NOT EXISTS skk_number VARCHAR(50);
ALTER TABLE vendor_business_profiles ADD COLUMN IF NOT EXISTS siuk_number VARCHAR(50);
ALTER TABLE vendor_business_profiles ADD COLUMN IF NOT EXISTS bpjs_ketenagakerjaan_status VARCHAR(20) DEFAULT 'unregistered';
ALTER TABLE vendor_business_profiles ADD COLUMN IF NOT EXISTS bpjs_kesehatan_status VARCHAR(20) DEFAULT 'unregistered';
ALTER TABLE vendor_business_profiles ADD COLUMN IF NOT EXISTS compliance_documents JSONB DEFAULT '{}';
ALTER TABLE vendor_business_profiles ADD COLUMN IF NOT EXISTS tarif_harian_min DECIMAL(12,2);
ALTER TABLE vendor_business_profiles ADD COLUMN IF NOT EXISTS tarif_harian_max DECIMAL(12,2);

-- Update vendor_services table for better hierarchy support
ALTER TABLE vendor_services ADD COLUMN IF NOT EXISTS category_hierarchy_id UUID REFERENCES vendor_categories_hierarchy(id);
ALTER TABLE vendor_services ADD COLUMN IF NOT EXISTS service_capacity JSONB DEFAULT '{}';
ALTER TABLE vendor_services ADD COLUMN IF NOT EXISTS pricing_rules JSONB DEFAULT '{}';
ALTER TABLE vendor_services ADD COLUMN IF NOT EXISTS geofencing_areas JSONB DEFAULT '[]';

-- Create vendor applications enhancement
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS category_hierarchy_selections JSONB DEFAULT '[]';
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS multi_service_bundle JSONB DEFAULT '{}';
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS service_areas_detailed JSONB DEFAULT '{}';

-- Insert sample hierarchical categories
INSERT INTO vendor_categories_hierarchy (category_code, name_en, name_id, level, vendor_type, icon, display_order) VALUES
-- Level 1: Main Categories
('products', 'Products', 'Produk', 1, 'product', '🛒', 1),
('services', 'Services', 'Layanan', 1, 'service', '🛠️', 2),

-- Level 2: Product Subcategories
('household_items', 'Household Items', 'Barang Rumah Tangga', 2, 'product', '🏠', 1),

-- Level 2: Service Subcategories  
('property_services', 'Property Services', 'Layanan Properti', 2, 'service', '🏢', 1),
('transportation', 'Transportation', 'Transportasi', 2, 'service', '🚗', 2),
('technical_services', 'Technical Services', 'Layanan Teknis', 2, 'service', '🔧', 3),

-- Level 3: Product Specializations
('furniture', 'Furniture', 'Furniture', 3, 'product', '🪑', 1),
('appliances', 'Appliances', 'Peralatan Elektronik', 3, 'product', '📱', 2),

-- Level 3: Service Specializations
('cleaning', 'Cleaning', 'Pembersihan', 3, 'service', '🧹', 1),
('car_rentals', 'Car Rentals', 'Sewa Mobil', 3, 'service', '🚙', 2),
('shifting_services', 'Shifting Services', 'Jasa Pindahan', 3, 'service', '📦', 3),
('ac_repair', 'AC Repair', 'Service AC', 3, 'service', '❄️', 4),
('electrical', 'Electrical', 'Listrik', 3, 'service', '⚡', 5);

-- Update parent relationships
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'products') WHERE category_code = 'household_items';
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'services') WHERE category_code IN ('property_services', 'transportation', 'technical_services');
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'household_items') WHERE category_code IN ('furniture', 'appliances');
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'property_services') WHERE category_code = 'cleaning';
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'transportation') WHERE category_code IN ('car_rentals', 'shifting_services');
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'technical_services') WHERE category_code IN ('ac_repair', 'electrical');

-- Add requirements for specific categories
UPDATE vendor_categories_hierarchy SET requirements = '{"docs":["ktp","sertifikat_kebersihan"],"equipment":["vacuum","mop"],"insurance":false}' WHERE category_code = 'cleaning';
UPDATE vendor_categories_hierarchy SET requirements = '{"docs":["skk","sertifikat_teknisi"],"license":true,"insurance":true}' WHERE category_code = 'ac_repair';
UPDATE vendor_categories_hierarchy SET requirements = '{"docs":["skk","sertifikat_listrik"],"license":true,"insurance":true}' WHERE category_code = 'electrical';
UPDATE vendor_categories_hierarchy SET requirements = '{"docs":["sim","stnk"],"vehicle_registration":true}' WHERE category_code = 'car_rentals';

-- Create level 4 for detailed specializations (Residential/Commercial)
INSERT INTO vendor_categories_hierarchy (category_code, name_en, name_id, level, parent_id, vendor_type, icon, display_order) VALUES
('cleaning_residential', 'Residential Cleaning', 'Pembersihan Rumah', 4, (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'cleaning'), 'service', '🏠', 1),
('cleaning_commercial', 'Commercial Cleaning', 'Pembersihan Komersial', 4, (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'cleaning'), 'service', '🏢', 2);

-- Enable RLS
ALTER TABLE vendor_categories_hierarchy ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active categories" ON vendor_categories_hierarchy FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON vendor_categories_hierarchy FOR ALL USING (check_admin_access());

-- Create trigger for updated_at
CREATE TRIGGER update_vendor_categories_hierarchy_updated_at
  BEFORE UPDATE ON vendor_categories_hierarchy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();