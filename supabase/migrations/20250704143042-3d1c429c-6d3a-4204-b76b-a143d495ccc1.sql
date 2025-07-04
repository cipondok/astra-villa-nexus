-- Clear existing sample data and update with optimized structure
DELETE FROM vendor_categories_hierarchy;

-- Insert optimized 3-tier category structure
INSERT INTO vendor_categories_hierarchy (category_code, name_en, name_id, level, vendor_type, icon, display_order) VALUES
-- Level 1: Vendor Types (Main)
('products', 'Products', 'Produk', 1, 'product', '🛍️', 1),
('services', 'Services', 'Jasa', 1, 'service', '🛠️', 2),

-- Level 2: Main Categories
('household_items', 'Household Items', 'Barang Rumah Tangga', 2, 'product', '🏠', 1),
('property_services', 'Property Services', 'Layanan Properti', 2, 'service', '🏢', 1),
('transportation', 'Transportation', 'Transportasi', 2, 'service', '🚗', 2),
('technical', 'Technical Services', 'Layanan Teknis', 2, 'service', '🔧', 3),

-- Level 3: Subcategories
('furniture', 'Furniture', 'Furniture', 3, 'product', '🪑', 1),
('appliances', 'Appliances', 'Peralatan Elektronik', 3, 'product', '📱', 2),
('cleaning', 'Cleaning', 'Pembersihan', 3, 'service', '🧹', 1),
('installations', 'Installations', 'Instalasi', 3, 'service', '🔨', 2),
('car_rentals', 'Car Rentals', 'Sewa Mobil', 3, 'service', '🚙', 3),
('shifting_services', 'Shifting Services', 'Jasa Pindahan', 3, 'service', '📦', 4),
('ac_repair', 'AC Repair', 'Service AC', 3, 'service', '❄️', 5),

-- Level 4: Specializations
('sofas', 'Sofas', 'Sofa', 4, 'product', '🛋️', 1),
('beds', 'Beds', 'Tempat Tidur', 4, 'product', '🛏️', 2),
('cleaning_residential', 'Residential Cleaning', 'Pembersihan Rumah', 4, 'service', '🏠', 3),
('cleaning_commercial', 'Commercial Cleaning', 'Pembersihan Komersial', 4, 'service', '🏢', 4),
('split_units', 'Split Unit AC', 'AC Split', 4, 'service', '❄️', 5),
('central_ac', 'Central AC', 'AC Sentral', 4, 'service', '🏢', 6);

-- Update parent relationships
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'products') WHERE category_code = 'household_items';
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'services') WHERE category_code IN ('property_services', 'transportation', 'technical');

UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'household_items') WHERE category_code IN ('furniture', 'appliances');
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'property_services') WHERE category_code IN ('cleaning', 'installations');
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'transportation') WHERE category_code IN ('car_rentals', 'shifting_services');
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'technical') WHERE category_code = 'ac_repair';

UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'furniture') WHERE category_code IN ('sofas', 'beds');
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'cleaning') WHERE category_code IN ('cleaning_residential', 'cleaning_commercial');
UPDATE vendor_categories_hierarchy SET parent_id = (SELECT id FROM vendor_categories_hierarchy WHERE category_code = 'ac_repair') WHERE category_code IN ('split_units', 'central_ac');

-- Add requirements for specific categories
UPDATE vendor_categories_hierarchy SET requirements = '{"docs":["ktp","sertifikat_kebersihan"],"equipment":["vacuum","mop"],"insurance":false}' WHERE category_code = 'cleaning_residential';
UPDATE vendor_categories_hierarchy SET requirements = '{"docs":["ktp","sertifikat_kebersihan"],"equipment":["vacuum","mop","floor_polisher"],"insurance":true}' WHERE category_code = 'cleaning_commercial';
UPDATE vendor_categories_hierarchy SET requirements = '{"docs":["skk","sertifikat_teknisi"],"license":true,"insurance":true}' WHERE category_code IN ('split_units', 'central_ac');
UPDATE vendor_categories_hierarchy SET requirements = '{"docs":["sim","stnk"],"vehicle_registration":true}' WHERE category_code = 'car_rentals';
UPDATE vendor_categories_hierarchy SET requirements = '{"docs":["skk","sim"],"equipment":["truck","dolly"],"insurance":true}' WHERE category_code = 'shifting_services';