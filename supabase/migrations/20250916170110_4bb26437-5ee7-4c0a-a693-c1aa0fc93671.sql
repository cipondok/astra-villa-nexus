-- Complete Banten Province Administrative Divisions Update - Fixed
-- Adding all missing regencies and cities with correct city codes

INSERT INTO locations (
  province_code, province_name, city_code, city_name, city_type, 
  district_code, district_name, area_name, is_active, is_capital
) VALUES

-- 4 REGENCIES (KABUPATEN) 
-- 1. Lebak Regency - Capital: Rangkasbitung
('36', 'Banten', '3601', 'Lebak', 'KABUPATEN', '360101', 'Rangkasbitung', 'Rangkasbitung', true, false),
('36', 'Banten', '3601', 'Lebak', 'KABUPATEN', '360102', 'Leuwidamar', 'Leuwidamar', true, false),
('36', 'Banten', '3601', 'Lebak', 'KABUPATEN', '360103', 'Lebakgedong', 'Lebakgedong', true, false),
('36', 'Banten', '3601', 'Lebak', 'KABUPATEN', '360104', 'Kalanganyar', 'Kalanganyar', true, false),
('36', 'Banten', '3601', 'Lebak', 'KABUPATEN', '360105', 'Cijaku', 'Cijaku', true, false),

-- 2. Pandeglang Regency - Capital: Pandeglang
('36', 'Banten', '3602', 'Pandeglang', 'KABUPATEN', '360201', 'Pandeglang', 'Pandeglang', true, false),
('36', 'Banten', '3602', 'Pandeglang', 'KABUPATEN', '360202', 'Cadasari', 'Cadasari', true, false),
('36', 'Banten', '3602', 'Pandeglang', 'KABUPATEN', '360203', 'Cigeulis', 'Cigeulis', true, false),
('36', 'Banten', '3602', 'Pandeglang', 'KABUPATEN', '360204', 'Labuan', 'Labuan', true, false),
('36', 'Banten', '3602', 'Pandeglang', 'KABUPATEN', '360205', 'Sumur', 'Sumur', true, false),

-- 3. Serang Regency - Capital: Ciruas  
('36', 'Banten', '3603', 'Serang', 'KABUPATEN', '360301', 'Ciruas', 'Ciruas', true, false),
('36', 'Banten', '3603', 'Serang', 'KABUPATEN', '360302', 'Petir', 'Petir', true, false),
('36', 'Banten', '3603', 'Serang', 'KABUPATEN', '360303', 'Tirtayasa', 'Tirtayasa', true, false),
('36', 'Banten', '3603', 'Serang', 'KABUPATEN', '360304', 'Kramatwatu', 'Kramatwatu', true, false),
('36', 'Banten', '3603', 'Serang', 'KABUPATEN', '360305', 'Waringinkurung', 'Waringinkurung', true, false),

-- 4. Tangerang Regency - Capital: Tigaraksa
('36', 'Banten', '3604', 'Tangerang', 'KABUPATEN', '360401', 'Tigaraksa', 'Tigaraksa', true, false),
('36', 'Banten', '3604', 'Tangerang', 'KABUPATEN', '360402', 'Cisauk', 'Cisauk', true, false),
('36', 'Banten', '3604', 'Tangerang', 'KABUPATEN', '360403', 'Serpong', 'Serpong', true, false),
('36', 'Banten', '3604', 'Tangerang', 'KABUPATEN', '360404', 'Cikupa', 'Cikupa', true, false),
('36', 'Banten', '3604', 'Tangerang', 'KABUPATEN', '360405', 'Pagedangan', 'Pagedangan', true, false),

-- Additional districts for CITIES (KOTA) - Adding missing districts
-- 1. Tangerang City (3671) - Adding missing districts 
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367101', 'Tangerang', 'Tangerang', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367102', 'Karawaci', 'Karawaci', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367103', 'Jatiuwung', 'Jatiuwung', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367104', 'Benda', 'Benda', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367105', 'Batuceper', 'Batuceper', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367106', 'Neglasari', 'Neglasari', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367107', 'Karang Tengah', 'Karang Tengah', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367108', 'Cipondoh', 'Cipondoh', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367109', 'Pinang', 'Pinang', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367110', 'Periuk', 'Periuk', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367111', 'Ciledug', 'Ciledug', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367112', 'Larangan', 'Larangan', true, false),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367113', 'Cibodas', 'Cibodas', true, false),

-- 2. Cilegon City (3672) - Adding missing districts
('36', 'Banten', '3672', 'Cilegon', 'KOTA', '367204', 'Gerogol', 'Gerogol', true, false),
('36', 'Banten', '3672', 'Cilegon', 'KOTA', '367205', 'Purwakarta', 'Purwakarta', true, false),
('36', 'Banten', '3672', 'Cilegon', 'KOTA', '367206', 'Citangkil', 'Citangkil', true, false),
('36', 'Banten', '3672', 'Cilegon', 'KOTA', '367207', 'Cibeber', 'Cibeber', true, false),
('36', 'Banten', '3672', 'Cilegon', 'KOTA', '367208', 'Grogol', 'Grogol', true, false),

-- 3. Serang City (3673) - Capital of Banten, adding missing districts
('36', 'Banten', '3673', 'Serang', 'KOTA', '367301', 'Serang', 'Serang', true, true),
('36', 'Banten', '3673', 'Serang', 'KOTA', '367302', 'Kasemen', 'Kasemen', true, false),
('36', 'Banten', '3673', 'Serang', 'KOTA', '367303', 'Walantaka', 'Walantaka', true, false),
('36', 'Banten', '3673', 'Serang', 'KOTA', '367306', 'Taktakan', 'Taktakan', true, false)

ON CONFLICT (province_code, city_code, COALESCE(district_code, ''), COALESCE(subdistrict_code, '')) 
DO UPDATE SET 
  province_name = EXCLUDED.province_name,
  city_name = EXCLUDED.city_name,
  city_type = EXCLUDED.city_type,
  district_name = EXCLUDED.district_name,
  area_name = EXCLUDED.area_name,
  is_active = EXCLUDED.is_active,
  is_capital = EXCLUDED.is_capital,
  updated_at = now();

-- Create indexes for better performance on Banten data
CREATE INDEX IF NOT EXISTS idx_locations_banten ON locations(province_code) WHERE province_code = '36';
CREATE INDEX IF NOT EXISTS idx_locations_banten_city_type ON locations(province_code, city_type) WHERE province_code = '36';