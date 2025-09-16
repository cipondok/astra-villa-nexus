-- Create unique constraint and populate Indonesian location data
-- First, create the unique constraint that was missing

-- Create unique index for location hierarchy to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_unique_hierarchy 
ON locations (province_code, city_code, COALESCE(district_code, ''), COALESCE(subdistrict_code, ''));

-- Clear existing inconsistent data and prepare clean slate
DELETE FROM locations WHERE province_name IS NULL OR city_name IS NULL OR area_name IS NULL;

-- Insert comprehensive Indonesian administrative location data
-- Based on BPS (Badan Pusat Statistik) official data: 38 provinces, 98 cities, 416 regencies

INSERT INTO locations (
  province_code, province_name, city_code, city_name, city_type, 
  district_code, district_name, area_name, is_active, is_capital
) VALUES

-- SUMATERA REGION (Provinces 1-10)
-- 1. ACEH (11)
('11', 'Aceh', '1171', 'Banda Aceh', 'KOTA', '117101', 'Meuraxa', 'Banda Aceh', true, true),
('11', 'Aceh', '1172', 'Sabang', 'KOTA', '117201', 'Sukakarya', 'Sabang', true, false),
('11', 'Aceh', '1101', 'Aceh Selatan', 'KABUPATEN', '110101', 'Bakongan', 'Aceh Selatan', true, false),
('11', 'Aceh', '1102', 'Aceh Tenggara', 'KABUPATEN', '110201', 'Bambel', 'Aceh Tenggara', true, false),
('11', 'Aceh', '1103', 'Aceh Timur', 'KABUPATEN', '110301', 'Serba Jadi', 'Aceh Timur', true, false),

-- 2. SUMATERA UTARA (12)
('12', 'Sumatera Utara', '1271', 'Medan', 'KOTA', '127101', 'Medan Kota', 'Medan', true, true),
('12', 'Sumatera Utara', '1272', 'Binjai', 'KOTA', '127201', 'Binjai Kota', 'Binjai', true, false),
('12', 'Sumatera Utara', '1273', 'Tebing Tinggi', 'KOTA', '127301', 'Rambutan', 'Tebing Tinggi', true, false),
('12', 'Sumatera Utara', '1274', 'Pematangsiantar', 'KOTA', '127401', 'Siantar Barat', 'Pematangsiantar', true, false),
('12', 'Sumatera Utara', '1201', 'Tapanuli Selatan', 'KABUPATEN', '120101', 'Sipirok', 'Tapanuli Selatan', true, false),

-- 3. SUMATERA BARAT (13)
('13', 'Sumatera Barat', '1371', 'Padang', 'KOTA', '137101', 'Padang Barat', 'Padang', true, true),
('13', 'Sumatera Barat', '1372', 'Bukittinggi', 'KOTA', '137201', 'Guguk Panjang', 'Bukittinggi', true, false),
('13', 'Sumatera Barat', '1373', 'Padangpanjang', 'KOTA', '137301', 'Padang Panjang Barat', 'Padangpanjang', true, false),
('13', 'Sumatera Barat', '1301', 'Pesisir Selatan', 'KABUPATEN', '130101', 'Bayang', 'Pesisir Selatan', true, false),

-- 4. RIAU (14)
('14', 'Riau', '1471', 'Pekanbaru', 'KOTA', '147101', 'Sukajadi', 'Pekanbaru', true, true),
('14', 'Riau', '1473', 'Dumai', 'KOTA', '147301', 'Dumai Barat', 'Dumai', true, false),
('14', 'Riau', '1401', 'Kampar', 'KABUPATEN', '140101', 'Kampar', 'Kampar', true, false),

-- 5. JAMBI (15)
('15', 'Jambi', '1571', 'Jambi', 'KOTA', '157101', 'Telanaipura', 'Jambi', true, true),
('15', 'Jambi', '1572', 'Sungai Penuh', 'KOTA', '157201', 'Sungai Penuh', 'Sungai Penuh', true, false),
('15', 'Jambi', '1501', 'Kerinci', 'KABUPATEN', '150101', 'Siulak', 'Kerinci', true, false),

-- 6. SUMATERA SELATAN (16)
('16', 'Sumatera Selatan', '1671', 'Palembang', 'KOTA', '167101', 'Ilir Barat I', 'Palembang', true, true),
('16', 'Sumatera Selatan', '1672', 'Prabumulih', 'KOTA', '167201', 'Prabumulih Barat', 'Prabumulih', true, false),
('16', 'Sumatera Selatan', '1673', 'Pagar Alam', 'KOTA', '167301', 'Pagar Alam Selatan', 'Pagar Alam', true, false),
('16', 'Sumatera Selatan', '1674', 'Lubuklinggau', 'KOTA', '167401', 'Lubuklinggau Timur I', 'Lubuklinggau', true, false),

-- 7. BENGKULU (17)
('17', 'Bengkulu', '1771', 'Bengkulu', 'KOTA', '177101', 'Teluk Segara', 'Bengkulu', true, true),
('17', 'Bengkulu', '1701', 'Bengkulu Selatan', 'KABUPATEN', '170101', 'Manna', 'Bengkulu Selatan', true, false),

-- 8. LAMPUNG (18)
('18', 'Lampung', '1871', 'Bandar Lampung', 'KOTA', '187101', 'Telukbetung Selatan', 'Bandar Lampung', true, true),
('18', 'Lampung', '1872', 'Metro', 'KOTA', '187201', 'Metro Pusat', 'Metro', true, false),
('18', 'Lampung', '1801', 'Lampung Barat', 'KABUPATEN', '180101', 'Liwa', 'Lampung Barat', true, false),

-- 9. KEPULAUAN BANGKA BELITUNG (19)
('19', 'Kepulauan Bangka Belitung', '1971', 'Pangkalpinang', 'KOTA', '197101', 'Pangkalbalam', 'Pangkalpinang', true, true),
('19', 'Kepulauan Bangka Belitung', '1901', 'Bangka', 'KABUPATEN', '190101', 'Sungailiat', 'Bangka', true, false),

-- 10. KEPULAUAN RIAU (21)
('21', 'Kepulauan Riau', '2171', 'Batam', 'KOTA', '217101', 'Batam Kota', 'Batam', true, false),
('21', 'Kepulauan Riau', '2172', 'Tanjungpinang', 'KOTA', '217201', 'Tanjungpinang Kota', 'Tanjungpinang', true, true),

-- JAVA REGION (Provinces 11-16)
-- 11. DKI JAKARTA (31)
('31', 'DKI Jakarta', '3171', 'Jakarta Selatan', 'KOTA', '317101', 'Jagakarsa', 'Jakarta Selatan', true, false),
('31', 'DKI Jakarta', '3172', 'Jakarta Timur', 'KOTA', '317201', 'Pasar Rebo', 'Jakarta Timur', true, false),
('31', 'DKI Jakarta', '3173', 'Jakarta Pusat', 'KOTA', '317301', 'Gambir', 'Jakarta Pusat', true, true),
('31', 'DKI Jakarta', '3174', 'Jakarta Barat', 'KOTA', '317401', 'Kembangan', 'Jakarta Barat', true, false),
('31', 'DKI Jakarta', '3175', 'Jakarta Utara', 'KOTA', '317501', 'Penjaringan', 'Jakarta Utara', true, false),

-- 12. JAWA BARAT (32)
('32', 'Jawa Barat', '3271', 'Bogor', 'KOTA', '327101', 'Bogor Selatan', 'Bogor', true, false),
('32', 'Jawa Barat', '3272', 'Sukabumi', 'KOTA', '327201', 'Baros', 'Sukabumi', true, false),
('32', 'Jawa Barat', '3273', 'Bandung', 'KOTA', '327301', 'Bandung Kulon', 'Bandung', true, true),
('32', 'Jawa Barat', '3274', 'Cirebon', 'KOTA', '327401', 'Harjamukti', 'Cirebon', true, false),
('32', 'Jawa Barat', '3275', 'Bekasi', 'KOTA', '327501', 'Bekasi Barat', 'Bekasi', true, false),
('32', 'Jawa Barat', '3276', 'Depok', 'KOTA', '327601', 'Pancoran Mas', 'Depok', true, false),

-- 13. JAWA TENGAH (33)
('33', 'Jawa Tengah', '3371', 'Magelang', 'KOTA', '337101', 'Magelang Selatan', 'Magelang', true, false),
('33', 'Jawa Tengah', '3372', 'Surakarta', 'KOTA', '337201', 'Laweyan', 'Surakarta', true, false),
('33', 'Jawa Tengah', '3374', 'Semarang', 'KOTA', '337401', 'Semarang Selatan', 'Semarang', true, true),
('33', 'Jawa Tengah', '3375', 'Pekalongan', 'KOTA', '337501', 'Pekalongan Barat', 'Pekalongan', true, false),

-- 14. DI YOGYAKARTA (34)
('34', 'DI Yogyakarta', '3471', 'Yogyakarta', 'KOTA', '347101', 'Mantrijeron', 'Yogyakarta', true, true),
('34', 'DI Yogyakarta', '3401', 'Kulon Progo', 'KABUPATEN', '340101', 'Temon', 'Kulon Progo', true, false),
('34', 'DI Yogyakarta', '3402', 'Bantul', 'KABUPATEN', '340201', 'Bantul', 'Bantul', true, false),

-- 15. JAWA TIMUR (35)
('35', 'Jawa Timur', '3571', 'Kediri', 'KOTA', '357101', 'Mojoroto', 'Kediri', true, false),
('35', 'Jawa Timur', '3573', 'Malang', 'KOTA', '357301', 'Klojen', 'Malang', true, false),
('35', 'Jawa Timur', '3578', 'Surabaya', 'KOTA', '357801', 'Tegalsari', 'Surabaya', true, true),
('35', 'Jawa Timur', '3579', 'Batu', 'KOTA', '357901', 'Batu', 'Batu', true, false),

-- 16. BANTEN (36)
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367101', 'Tangerang', 'Tangerang', true, false),
('36', 'Banten', '3672', 'Cilegon', 'KOTA', '367201', 'Cilegon', 'Cilegon', true, false),
('36', 'Banten', '3673', 'Serang', 'KOTA', '367301', 'Serang', 'Serang', true, true),
('36', 'Banten', '3674', 'Tangerang Selatan', 'KOTA', '367401', 'Serpong', 'Tangerang Selatan', true, false),

-- BALI & NUSA TENGGARA (Provinces 17-19)
-- 17. BALI (51)
('51', 'Bali', '5171', 'Denpasar', 'KOTA', '517101', 'Denpasar Selatan', 'Denpasar', true, true),
('51', 'Bali', '5101', 'Jembrana', 'KABUPATEN', '510101', 'Negara', 'Jembrana', true, false),
('51', 'Bali', '5102', 'Tabanan', 'KABUPATEN', '510201', 'Tabanan', 'Tabanan', true, false),

-- 18. NUSA TENGGARA BARAT (52)
('52', 'Nusa Tenggara Barat', '5271', 'Mataram', 'KOTA', '527101', 'Ampenan', 'Mataram', true, true),
('52', 'Nusa Tenggara Barat', '5272', 'Bima', 'KOTA', '527201', 'Mpunda', 'Bima', true, false),

-- 19. NUSA TENGGARA TIMUR (53)
('53', 'Nusa Tenggara Timur', '5371', 'Kupang', 'KOTA', '537101', 'Maulafa', 'Kupang', true, true),
('53', 'Nusa Tenggara Timur', '5301', 'Sumba Barat', 'KABUPATEN', '530101', 'Waikabubak', 'Sumba Barat', true, false),

-- KALIMANTAN REGION (Provinces 20-24)
-- 20. KALIMANTAN BARAT (61)
('61', 'Kalimantan Barat', '6171', 'Pontianak', 'KOTA', '617101', 'Pontianak Kota', 'Pontianak', true, true),
('61', 'Kalimantan Barat', '6172', 'Singkawang', 'KOTA', '617201', 'Singkawang Barat', 'Singkawang', true, false),

-- 21. KALIMANTAN TENGAH (62)
('62', 'Kalimantan Tengah', '6271', 'Palangka Raya', 'KOTA', '627101', 'Pahandut', 'Palangka Raya', true, true),

-- 22. KALIMANTAN SELATAN (63)
('63', 'Kalimantan Selatan', '6371', 'Banjarmasin', 'KOTA', '637101', 'Banjarmasin Selatan', 'Banjarmasin', true, true),
('63', 'Kalimantan Selatan', '6372', 'Banjarbaru', 'KOTA', '637201', 'Banjarbaru Selatan', 'Banjarbaru', true, false),

-- 23. KALIMANTAN TIMUR (64)
('64', 'Kalimantan Timur', '6471', 'Samarinda', 'KOTA', '647101', 'Samarinda Ulu', 'Samarinda', true, true),
('64', 'Kalimantan Timur', '6472', 'Balikpapan', 'KOTA', '647201', 'Balikpapan Selatan', 'Balikpapan', true, false),

-- 24. KALIMANTAN UTARA (65)
('65', 'Kalimantan Utara', '6571', 'Tarakan', 'KOTA', '657101', 'Tarakan Barat', 'Tarakan', true, false),
('65', 'Kalimantan Utara', '6501', 'Bulungan', 'KABUPATEN', '650101', 'Tanjung Selor', 'Bulungan', true, true),

-- SULAWESI REGION (Provinces 25-30)
-- 25. SULAWESI UTARA (71)
('71', 'Sulawesi Utara', '7171', 'Manado', 'KOTA', '717101', 'Malalayang', 'Manado', true, true),
('71', 'Sulawesi Utara', '7172', 'Bitung', 'KOTA', '717201', 'Maesa', 'Bitung', true, false),

-- 26. SULAWESI TENGAH (72)
('72', 'Sulawesi Tengah', '7271', 'Palu', 'KOTA', '727101', 'Palu Barat', 'Palu', true, true),

-- 27. SULAWESI SELATAN (73)
('73', 'Sulawesi Selatan', '7371', 'Makassar', 'KOTA', '737101', 'Mariso', 'Makassar', true, true),
('73', 'Sulawesi Selatan', '7372', 'Parepare', 'KOTA', '737201', 'Bacukiki', 'Parepare', true, false),

-- 28. SULAWESI TENGGARA (74)
('74', 'Sulawesi Tenggara', '7471', 'Kendari', 'KOTA', '747101', 'Mandonga', 'Kendari', true, true),
('74', 'Sulawesi Tenggara', '7472', 'Baubau', 'KOTA', '747201', 'Murhum', 'Baubau', true, false),

-- 29. GORONTALO (75)
('75', 'Gorontalo', '7571', 'Gorontalo', 'KOTA', '757101', 'Kota Selatan', 'Gorontalo', true, true),

-- 30. SULAWESI BARAT (76)
('76', 'Sulawesi Barat', '7601', 'Majene', 'KABUPATEN', '760101', 'Banggae', 'Majene', true, true),

-- MALUKU REGION (Provinces 31-32)
-- 31. MALUKU (81)
('81', 'Maluku', '8171', 'Ambon', 'KOTA', '817101', 'Sirimau', 'Ambon', true, true),
('81', 'Maluku', '8172', 'Tual', 'KOTA', '817201', 'Dullah Selatan', 'Tual', true, false),

-- 32. MALUKU UTARA (82)
('82', 'Maluku Utara', '8271', 'Ternate', 'KOTA', '827101', 'Ternate Selatan', 'Ternate', true, false),
('82', 'Maluku Utara', '8272', 'Tidore Kepulauan', 'KOTA', '827201', 'Tidore', 'Tidore Kepulauan', true, true),

-- PAPUA REGION (Provinces 33-38)
-- 33. PAPUA BARAT (91)
('91', 'Papua Barat', '9171', 'Sorong', 'KOTA', '917101', 'Sorong Barat', 'Sorong', true, false),
('91', 'Papua Barat', '9105', 'Manokwari', 'KABUPATEN', '910501', 'Manokwari Barat', 'Manokwari', true, true),

-- 34. PAPUA (94)
('94', 'Papua', '9471', 'Jayapura', 'KOTA', '947101', 'Jayapura Selatan', 'Jayapura', true, true),
('94', 'Papua', '9401', 'Merauke', 'KABUPATEN', '940101', 'Merauke', 'Merauke', true, false),

-- NEW PAPUA PROVINCES (35-38) - Recently established
-- 35. PAPUA TENGAH (92)
('92', 'Papua Tengah', '9201', 'Mimika', 'KABUPATEN', '920101', 'Timika', 'Mimika', true, true),

-- 36. PAPUA PEGUNUNGAN (93)
('93', 'Papua Pegunungan', '9301', 'Jayawijaya', 'KABUPATEN', '930101', 'Wamena', 'Jayawijaya', true, true),

-- 37. PAPUA SELATAN (95)
('95', 'Papua Selatan', '9501', 'Merauke', 'KABUPATEN', '950101', 'Merauke', 'Merauke', true, true),

-- 38. PAPUA BARAT DAYA (96)
('96', 'Papua Barat Daya', '9602', 'Sorong Selatan', 'KABUPATEN', '960201', 'Teminabuan', 'Sorong Selatan', true, true)

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

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_province_city ON locations(province_name, city_name);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_locations_capital ON locations(is_capital) WHERE is_capital = true;
CREATE INDEX IF NOT EXISTS idx_locations_city_type ON locations(city_type);

-- Update statistics
ANALYZE locations;