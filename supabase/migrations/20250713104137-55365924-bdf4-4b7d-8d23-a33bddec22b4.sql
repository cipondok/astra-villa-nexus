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
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367102', 'Karawaci', '36710202', 'Lippo Karawaci', '15811', 'Lippo Karawaci', true),

-- Central Java examples
('33', 'Jawa Tengah', '3371', 'Semarang', 'KOTA', '337101', 'Semarang Tengah', '33710101', 'Pekunden', '50241', 'Pekunden', true),
('33', 'Jawa Tengah', '3371', 'Semarang', 'KOTA', '337101', 'Semarang Tengah', '33710102', 'Pandanaran', '50241', 'Pandanaran', true),
('33', 'Jawa Tengah', '3371', 'Semarang', 'KOTA', '337102', 'Semarang Utara', '33710201', 'Tanjung Mas', '50174', 'Tanjung Mas', true),

-- East Java examples
('35', 'Jawa Timur', '3578', 'Surabaya', 'KOTA', '357801', 'Genteng', '35780101', 'Genteng', '60275', 'Genteng', true),
('35', 'Jawa Timur', '3578', 'Surabaya', 'KOTA', '357801', 'Genteng', '35780102', 'Peneleh', '60274', 'Peneleh', true),
('35', 'Jawa Timur', '3578', 'Surabaya', 'KOTA', '357802', 'Tegalsari', '35780201', 'Tegalsari', '60262', 'Tegalsari', true),

-- Bali examples
('51', 'Bali', '5171', 'Denpasar', 'KOTA', '517101', 'Denpasar Selatan', '51710101', 'Sanur', '80228', 'Sanur', true),
('51', 'Bali', '5171', 'Denpasar', 'KOTA', '517101', 'Denpasar Selatan', '51710102', 'Sanur Kaja', '80227', 'Sanur Kaja', true),
('51', 'Bali', '5171', 'Denpasar', 'KOTA', '517102', 'Denpasar Barat', '51710201', 'Pemecutan', '80119', 'Pemecutan', true)

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