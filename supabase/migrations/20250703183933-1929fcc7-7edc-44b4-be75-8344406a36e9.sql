-- Create unified categories table with 4-level hierarchy (fixed column reference issue)
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('product', 'service')),
  level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 4),
  parent_id TEXT NULL REFERENCES categories(id) ON DELETE CASCADE,
  meta JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure hierarchy consistency
  CONSTRAINT valid_hierarchy CHECK (
    (level = 1 AND parent_id IS NULL) OR 
    (level > 1 AND parent_id IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_level ON categories(level);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active categories" 
ON categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON categories 
FOR ALL 
USING (check_admin_access());

-- Create function to update timestamps
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing data from the 4 separate tables using shorter IDs

-- 1. Main Categories (Level 1)
INSERT INTO categories (id, name, slug, type, level, parent_id, meta, display_order, is_active)
SELECT 
  'mc' || ROW_NUMBER() OVER (ORDER BY display_order, name),
  name,
  LOWER(REPLACE(REPLACE(name, ' ', '-'), '&', 'and')),
  type,
  1,
  NULL,
  COALESCE(jsonb_build_object('icon', icon, 'description', description, 'original_id', id), '{}'),
  display_order,
  is_active
FROM vendor_main_categories;

-- 2. Sub Categories (Level 2) - Fixed to not reference non-existent slug column
INSERT INTO categories (id, name, slug, type, level, parent_id, meta, display_order, is_active)
SELECT 
  'sc' || ROW_NUMBER() OVER (ORDER BY display_order, name),
  vsc.name,
  LOWER(REPLACE(REPLACE(vsc.name, ' ', '-'), '&', 'and')),
  'service',
  2,
  (SELECT 'mc' || ROW_NUMBER() OVER (ORDER BY display_order, name) 
   FROM vendor_main_categories vmc 
   WHERE vmc.id = vsc.main_category_id),
  COALESCE(jsonb_build_object('icon', vsc.icon, 'description', vsc.description, 'original_id', vsc.id), '{}'),
  vsc.display_order,
  vsc.is_active
FROM vendor_sub_categories vsc
WHERE vsc.main_category_id IS NOT NULL;

-- 3. Service Names (Level 3)
WITH sub_cat_mapping AS (
  SELECT 
    vsc.id as original_id,
    'sc' || ROW_NUMBER() OVER (ORDER BY vsc.display_order, vsc.name) as new_id
  FROM vendor_sub_categories vsc
  WHERE vsc.main_category_id IS NOT NULL
)
INSERT INTO categories (id, name, slug, type, level, parent_id, meta, display_order, is_active)
SELECT 
  'sn' || ROW_NUMBER() OVER (ORDER BY asn.service_name),
  asn.service_name,
  LOWER(REPLACE(REPLACE(REPLACE(asn.service_name, ' ', '-'), '/', '-'), '&', 'and')),
  COALESCE(asn.type, 'service'),
  3,
  scm.new_id,
  COALESCE(jsonb_build_object('description', asn.description, 'original_id', asn.id), '{}'),
  0,
  asn.is_active
FROM approved_service_names asn
JOIN sub_cat_mapping scm ON scm.original_id = asn.sub_category_id
WHERE asn.sub_category_id IS NOT NULL;

-- 4. Implementation Types (Level 4)
WITH service_name_mapping AS (
  SELECT 
    asn.id as original_id,
    'sn' || ROW_NUMBER() OVER (ORDER BY asn.service_name) as new_id
  FROM approved_service_names asn
  WHERE asn.sub_category_id IS NOT NULL
)
INSERT INTO categories (id, name, slug, type, level, parent_id, meta, display_order, is_active)
SELECT 
  'it' || ROW_NUMBER() OVER (ORDER BY vsc.display_order, vsc.name),
  COALESCE(vsc.implementation_type, vsc.name),
  LOWER(REPLACE(REPLACE(COALESCE(vsc.implementation_type, vsc.name), ' ', '-'), '&', 'and')),
  'service',
  4,
  snm.new_id,
  COALESCE(jsonb_build_object('icon', vsc.icon, 'description', vsc.description, 'original_id', vsc.id), '{}'),
  vsc.display_order,
  vsc.is_active
FROM vendor_service_categories vsc
JOIN service_name_mapping snm ON snm.original_id = vsc.approved_service_name_id
WHERE vsc.approved_service_name_id IS NOT NULL;

-- Add sample product categories to demonstrate the structure
INSERT INTO categories (id, name, slug, type, level, parent_id, meta, display_order, is_active) VALUES
-- Building Materials (Main Category)
('prod-materials', 'Building Materials', 'building-materials', 'product', 1, NULL, '{"icon":"🧱","description":"Construction and building materials"}', 1, true),

-- Flooring (Sub Category)
('prod-floor', 'Flooring', 'flooring', 'product', 2, 'prod-materials', '{"weight_kg_sqm":25,"installation_required":true}', 1, true),

-- Imported Marble (Product Variant)
('prod-marble', 'Imported Marble', 'imported-marble', 'product', 3, 'prod-floor', '{"colors":["white","beige","gray"],"thickness_mm":[18,20,25],"finish":["polished","matte"]}', 1, true),

-- Marble Specifications (Attributes)
('marble-pol', 'Polished White Marble', 'polished-white-marble', 'product', 4, 'prod-marble', '{"price_range":{"min":45,"max":75,"unit":"sq_ft"},"thickness_mm":20,"finish":"polished","color":"white"}', 1, true),
('marble-mat', 'Matte Beige Marble', 'matte-beige-marble', 'product', 4, 'prod-marble', '{"price_range":{"min":55,"max":85,"unit":"sq_ft"},"thickness_mm":25,"finish":"matte","color":"beige"}', 2, true),

-- Roofing (Sub Category)
('prod-roof', 'Roofing', 'roofing', 'product', 2, 'prod-materials', '{"weather_resistance":"high","installation_complexity":"medium"}', 2, true),

-- Eco-Friendly Tiles (Product Variant)
('prod-tiles', 'Eco-Friendly Tiles', 'eco-friendly-tiles', 'product', 3, 'prod-roof', '{"sustainability_rating":"A+","types":["solar-reflective","waterproof"],"coverage_sqft_per_case":25}', 1, true),

-- Furniture (Main Category)
('prod-furniture', 'Furniture', 'furniture', 'product', 1, NULL, '{"icon":"🪑","description":"Home and office furniture"}', 2, true),

-- Living Room (Sub Category)
('prod-living', 'Living Room', 'living-room', 'product', 2, 'prod-furniture', '{"room_type":"living","style_categories":["modern","classic","contemporary"]}', 1, true),

-- Luxury Sofas (Product Variant)
('prod-sofas', 'Luxury Sofas', 'luxury-sofas', 'product', 3, 'prod-living', '{"materials":["fabric","leather"],"customizable":true,"seating_capacity":[2,3,4,5]}', 1, true);

-- Update vendor_services table to reference the new categories table
ALTER TABLE vendor_services 
ADD COLUMN IF NOT EXISTS category_ref TEXT REFERENCES categories(id);

COMMENT ON TABLE categories IS 'Unified 4-level hierarchy for both products and services';
COMMENT ON COLUMN categories.level IS '1=main category, 2=sub category, 3=service/product name, 4=implementation/attributes';
COMMENT ON COLUMN categories.meta IS 'Type-specific data: pricing, inventory for products; service parameters for services';
COMMENT ON COLUMN categories.type IS 'Either product or service to distinguish category purpose';