-- Add pricing model enum and enhance categories table
CREATE TYPE pricing_model AS ENUM ('hourly', 'sqm', 'project', 'per_item', 'daily', 'fixed');

-- Add new fields to existing hierarchy table
ALTER TABLE vendor_categories_hierarchy 
ADD COLUMN IF NOT EXISTS pricing_model pricing_model DEFAULT 'hourly',
ADD COLUMN IF NOT EXISTS service_area_types JSONB DEFAULT '["residential","commercial"]'::jsonb,
ADD COLUMN IF NOT EXISTS base_price_range JSONB DEFAULT '{"min":0,"max":0,"currency":"IDR"}'::jsonb;

-- Update existing categories with pricing models
UPDATE vendor_categories_hierarchy SET 
  pricing_model = 'sqm',
  base_price_range = '{"min":15000,"max":50000,"currency":"IDR"}'
WHERE category_code IN ('cleaning_residential', 'cleaning_commercial');

UPDATE vendor_categories_hierarchy SET 
  pricing_model = 'hourly',
  base_price_range = '{"min":100000,"max":300000,"currency":"IDR"}'
WHERE category_code IN ('split_units', 'central_ac');

UPDATE vendor_categories_hierarchy SET 
  pricing_model = 'daily',
  base_price_range = '{"min":250000,"max":800000,"currency":"IDR"}'
WHERE category_code = 'car_rentals';

UPDATE vendor_categories_hierarchy SET 
  pricing_model = 'project',
  base_price_range = '{"min":500000,"max":2000000,"currency":"IDR"}'
WHERE category_code = 'shifting_services';

UPDATE vendor_categories_hierarchy SET 
  pricing_model = 'per_item',
  base_price_range = '{"min":2000000,"max":15000000,"currency":"IDR"}'
WHERE category_code IN ('sofas', 'beds');

-- Create service area mapping table
CREATE TABLE IF NOT EXISTS service_area_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES vendor_categories_hierarchy(id),
  area_type VARCHAR(50) NOT NULL, -- 'residential', 'commercial', 'industrial'
  size_ranges JSONB DEFAULT '[]'::jsonb, -- [{"min":0,"max":50,"unit":"sqm","label":"Small"}]
  pricing_multiplier DECIMAL(3,2) DEFAULT 1.00,
  special_requirements JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_area_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view area mappings" ON service_area_mappings FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage area mappings" ON service_area_mappings FOR ALL USING (check_admin_access());