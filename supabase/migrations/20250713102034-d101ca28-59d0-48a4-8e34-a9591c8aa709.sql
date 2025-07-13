-- Ensure locations table has complete Indonesian administrative structure
-- Add any missing indexes for better performance

-- Create indexes for better query performance on location fields
CREATE INDEX IF NOT EXISTS idx_locations_province_code ON public.locations(province_code);
CREATE INDEX IF NOT EXISTS idx_locations_city_code ON public.locations(city_code);
CREATE INDEX IF NOT EXISTS idx_locations_district_code ON public.locations(district_code);
CREATE INDEX IF NOT EXISTS idx_locations_subdistrict_code ON public.locations(subdistrict_code);
CREATE INDEX IF NOT EXISTS idx_locations_postal_code ON public.locations(postal_code);

-- Add a comprehensive index for location hierarchy queries
CREATE INDEX IF NOT EXISTS idx_locations_hierarchy ON public.locations(province_code, city_code, district_code, subdistrict_code);

-- Ensure all required fields are present and properly typed
-- Add constraint to ensure postal_code follows Indonesian format (5 digits)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'locations_postal_code_format'
    ) THEN
        ALTER TABLE public.locations 
        ADD CONSTRAINT locations_postal_code_format 
        CHECK (postal_code IS NULL OR postal_code ~ '^[0-9]{5}$');
    END IF;
END $$;

-- Add sample complete Indonesian location data with all administrative levels
-- This ensures we have complete hierarchy: Province -> City -> District -> Subdistrict -> Area

INSERT INTO public.locations (
    province_code, province_name, city_code, city_name, city_type,
    district_code, district_name, subdistrict_code, subdistrict_name,
    postal_code, area_name, is_active
) VALUES 
-- Jakarta examples with complete hierarchy
('31', 'DKI Jakarta', '3171', 'Jakarta Pusat', 'KOTA', '317101', 'Gambir', '31710101', 'Gambir', '10110', 'Gambir', true),
('31', 'DKI Jakarta', '3171', 'Jakarta Pusat', 'KOTA', '317101', 'Gambir', '31710102', 'Cideng', '10150', 'Cideng', true),
('31', 'DKI Jakarta', '3171', 'Jakarta Pusat', 'KOTA', '317102', 'Tanah Abang', '31710201', 'Gelora', '10270', 'Gelora', true),
('31', 'DKI Jakarta', '3171', 'Jakarta Pusat', 'KOTA', '317102', 'Tanah Abang', '31710202', 'Bendungan Hilir', '10210', 'Bendungan Hilir', true),

-- West Java examples with complete hierarchy  
('32', 'Jawa Barat', '3273', 'Bandung', 'KOTA', '327301', 'Coblong', '32730101', 'Lebak Gede', '40132', 'Lebak Gede', true),
('32', 'Jawa Barat', '3273', 'Bandung', 'KOTA', '327301', 'Coblong', '32730102', 'Lebak Siliwangi', '40132', 'Lebak Siliwangi', true),
('32', 'Jawa Barat', '3273', 'Bandung', 'KOTA', '327302', 'Cidadap', '32730201', 'Hegarmanah', '40141', 'Hegarmanah', true),
('32', 'Jawa Barat', '3273', 'Bandung', 'KOTA', '327302', 'Cidadap', '32730202', 'Ledeng', '40143', 'Ledeng', true),

-- Banten examples with complete hierarchy
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367101', 'Tangerang', '36710101', 'Sukasari', '15111', 'Sukasari', true),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367101', 'Tangerang', '36710102', 'Babakan', '15118', 'Babakan', true),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367102', 'Karawaci', '36710201', 'Karawaci', '15115', 'Karawaci', true),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367102', 'Karawaci', '36710202', 'Lippo Karawaci', '15811', 'Lippo Karawaci', true)

ON CONFLICT (province_code, city_code, district_code, subdistrict_code) DO UPDATE SET
    province_name = EXCLUDED.province_name,
    city_name = EXCLUDED.city_name,
    city_type = EXCLUDED.city_type,
    district_name = EXCLUDED.district_name,
    subdistrict_name = EXCLUDED.subdistrict_name,
    postal_code = EXCLUDED.postal_code,
    area_name = EXCLUDED.area_name,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Update existing records to ensure they have proper codes if missing
UPDATE public.locations 
SET 
    district_code = CASE 
        WHEN district_code IS NULL AND district_name IS NOT NULL 
        THEN city_code || LPAD((ROW_NUMBER() OVER (PARTITION BY city_code ORDER BY district_name))::text, 2, '0')
        ELSE district_code 
    END,
    subdistrict_code = CASE 
        WHEN subdistrict_code IS NULL AND subdistrict_name IS NOT NULL 
        THEN district_code || LPAD((ROW_NUMBER() OVER (PARTITION BY district_code ORDER BY subdistrict_name))::text, 2, '0')
        ELSE subdistrict_code 
    END
WHERE district_code IS NULL OR subdistrict_code IS NULL;