
-- First, let's clean up and reorganize the Banten data properly
DELETE FROM public.locations WHERE province_name = 'Banten';

-- Add proper Banten data with correct administrative structure
-- 4 Kota (Cities) in Banten
INSERT INTO public.locations (province_code, province_name, city_code, city_name, city_type, district_code, district_name, area_name, is_capital, postal_code) VALUES
-- Kota Serang (Capital city)
('36', 'Banten', '3673', 'Serang', 'KOTA', '367301', 'Serang', 'Serang', TRUE, '42111'),
('36', 'Banten', '3673', 'Serang', 'KOTA', '367302', 'Walantaka', 'Walantaka', FALSE, '42181'),
('36', 'Banten', '3673', 'Serang', 'KOTA', '367303', 'Curug', 'Curug', FALSE, '42171'),

-- Kota Cilegon
('36', 'Banten', '3672', 'Cilegon', 'KOTA', '367201', 'Cilegon', 'Cilegon', FALSE, '42411'),
('36', 'Banten', '3672', 'Cilegon', 'KOTA', '367202', 'Ciwandan', 'Ciwandan', FALSE, '42443'),
('36', 'Banten', '3672', 'Cilegon', 'KOTA', '367203', 'Jombang', 'Jombang', FALSE, '42416'),

-- Kota Tangerang
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367101', 'Tangerang', 'Babakan', FALSE, '15118'),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367102', 'Karawaci', 'Karawaci', FALSE, '15115'),
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367103', 'Cipondoh', 'Cipondoh', FALSE, '15148'),

-- Kota Tangerang Selatan
('36', 'Banten', '3674', 'Tangerang Selatan', 'KOTA', '367401', 'Serpong', 'Serpong', FALSE, '15310'),
('36', 'Banten', '3674', 'Tangerang Selatan', 'KOTA', '367402', 'Pondok Aren', 'Pondok Aren', FALSE, '15224'),
('36', 'Banten', '3674', 'Tangerang Selatan', 'KOTA', '367403', 'Ciputat', 'Ciputat', FALSE, '15411'),

-- 4 Kabupaten (Regencies) in Banten
-- Kabupaten Serang
('36', 'Banten', '3601', 'Serang', 'KABUPATEN', '360101', 'Ciruas', 'Ciruas', FALSE, '42182'),
('36', 'Banten', '3601', 'Serang', 'KABUPATEN', '360102', 'Petir', 'Petir', FALSE, '42164'),
('36', 'Banten', '3601', 'Serang', 'KABUPATEN', '360103', 'Tirtayasa', 'Tirtayasa', FALSE, '42163'),

-- Kabupaten Tangerang
('36', 'Banten', '3603', 'Tangerang', 'KABUPATEN', '360301', 'Tigaraksa', 'Tigaraksa', FALSE, '15720'),
('36', 'Banten', '3603', 'Tangerang', 'KABUPATEN', '360302', 'Cikupa', 'Cikupa', FALSE, '15710'),
('36', 'Banten', '3603', 'Tangerang', 'KABUPATEN', '360303', 'Kelapa Dua', 'Kelapa Dua', FALSE, '15810'),

-- Kabupaten Lebak
('36', 'Banten', '3602', 'Lebak', 'KABUPATEN', '360201', 'Rangkasbitung', 'Rangkasbitung', FALSE, '42311'),
('36', 'Banten', '3602', 'Lebak', 'KABUPATEN', '360202', 'Maja', 'Maja', FALSE, '42364'),
('36', 'Banten', '3602', 'Lebak', 'KABUPATEN', '360203', 'Warunggunung', 'Warunggunung', FALSE, '42393'),

-- Kabupaten Pandeglang
('36', 'Banten', '3604', 'Pandeglang', 'KABUPATEN', '360401', 'Pandeglang', 'Pandeglang', FALSE, '42212'),
('36', 'Banten', '3604', 'Pandeglang', 'KABUPATEN', '360402', 'Labuan', 'Labuan', FALSE, '42264'),
('36', 'Banten', '3604', 'Pandeglang', 'KABUPATEN', '360403', 'Carita', 'Carita', FALSE, '42264');

-- Let's also fix some other major provinces to have proper separation
-- Clean up and add proper Jakarta data
DELETE FROM public.locations WHERE province_name = 'DKI Jakarta';

INSERT INTO public.locations (province_code, province_name, city_code, city_name, city_type, district_code, district_name, area_name, is_capital, postal_code) VALUES
-- DKI Jakarta - 5 Kota Administrasi + 1 Kabupaten Administrasi
-- Jakarta Pusat
('31', 'DKI Jakarta', '3171', 'Jakarta Pusat', 'KOTA', '317101', 'Gambir', 'Gambir', TRUE, '10110'),
('31', 'DKI Jakarta', '3171', 'Jakarta Pusat', 'KOTA', '317102', 'Sawah Besar', 'Sawah Besar', FALSE, '10710'),
('31', 'DKI Jakarta', '3171', 'Jakarta Pusat', 'KOTA', '317103', 'Kemayoran', 'Kemayoran', FALSE, '10610'),

-- Jakarta Utara
('31', 'DKI Jakarta', '3172', 'Jakarta Utara', 'KOTA', '317201', 'Penjaringan', 'Penjaringan', FALSE, '14450'),
('31', 'DKI Jakarta', '3172', 'Jakarta Utara', 'KOTA', '317202', 'Tanjung Priok', 'Tanjung Priok', FALSE, '14310'),
('31', 'DKI Jakarta', '3172', 'Jakarta Utara', 'KOTA', '317203', 'Kelapa Gading', 'Kelapa Gading', FALSE, '14240'),

-- Jakarta Barat
('31', 'DKI Jakarta', '3173', 'Jakarta Barat', 'KOTA', '317301', 'Kebon Jeruk', 'Kebon Jeruk', FALSE, '11530'),
('31', 'DKI Jakarta', '3173', 'Jakarta Barat', 'KOTA', '317302', 'Palmerah', 'Palmerah', FALSE, '11480'),
('31', 'DKI Jakarta', '3173', 'Jakarta Barat', 'KOTA', '317303', 'Cengkareng', 'Cengkareng', FALSE, '11730'),

-- Jakarta Selatan
('31', 'DKI Jakarta', '3174', 'Jakarta Selatan', 'KOTA', '317401', 'Kebayoran Baru', 'Kebayoran Baru', FALSE, '12110'),
('31', 'DKI Jakarta', '3174', 'Jakarta Selatan', 'KOTA', '317402', 'Kebayoran Lama', 'Kebayoran Lama', FALSE, '12240'),
('31', 'DKI Jakarta', '3174', 'Jakarta Selatan', 'KOTA', '317403', 'Pondok Indah', 'Pondok Indah', FALSE, '12310'),

-- Jakarta Timur
('31', 'DKI Jakarta', '3175', 'Jakarta Timur', 'KOTA', '317501', 'Matraman', 'Matraman', FALSE, '13140'),
('31', 'DKI Jakarta', '3175', 'Jakarta Timur', 'KOTA', '317502', 'Pulogadung', 'Pulogadung', FALSE, '13260'),
('31', 'DKI Jakarta', '3175', 'Jakarta Timur', 'KOTA', '317503', 'Cakung', 'Cakung', FALSE, '13910'),

-- Kepulauan Seribu (Kabupaten Administrasi)
('31', 'DKI Jakarta', '3101', 'Kepulauan Seribu', 'KABUPATEN', '310101', 'Pulau Seribu Utara', 'Pulau Kelapa', FALSE, '14520'),
('31', 'DKI Jakarta', '3101', 'Kepulauan Seribu', 'KABUPATEN', '310102', 'Pulau Seribu Selatan', 'Pulau Tidung', FALSE, '14520');
