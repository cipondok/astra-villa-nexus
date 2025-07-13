-- Add comprehensive Indonesian location data with proper administrative levels
-- First, let's add some sample data for major Indonesian regions with sub-districts

-- DKI Jakarta
INSERT INTO locations (
  province_code, province_name, city_code, city_name, city_type, 
  district_code, district_name, subdistrict_code, subdistrict_name, 
  postal_code, area_name, is_active
) VALUES 
-- Jakarta Pusat
('31', 'DKI JAKARTA', '3171', 'JAKARTA PUSAT', 'KOTA', '317101', 'GAMBIR', '3171011', 'GAMBIR', '10110', 'Gambir', true),
('31', 'DKI JAKARTA', '3171', 'JAKARTA PUSAT', 'KOTA', '317101', 'GAMBIR', '3171012', 'KEBON KELAPA', '10120', 'Kebon Kelapa', true),
('31', 'DKI JAKARTA', '3171', 'JAKARTA PUSAT', 'KOTA', '317101', 'GAMBIR', '3171013', 'PETOJO UTARA', '10130', 'Petojo Utara', true),
('31', 'DKI JAKARTA', '3171', 'JAKARTA PUSAT', 'KOTA', '317102', 'TANAH ABANG', '3171021', 'GELORA', '10270', 'Gelora', true),
('31', 'DKI JAKARTA', '3171', 'JAKARTA PUSAT', 'KOTA', '317102', 'TANAH ABANG', '3171022', 'BENDUNGAN HILIR', '10210', 'Bendungan Hilir', true),
('31', 'DKI JAKARTA', '3171', 'JAKARTA PUSAT', 'KOTA', '317103', 'MENTENG', '3171031', 'MENTENG', '10310', 'Menteng', true),
('31', 'DKI JAKARTA', '3171', 'JAKARTA PUSAT', 'KOTA', '317103', 'MENTENG', '3171032', 'PEGANGSAAN', '10320', 'Pegangsaan', true),
('31', 'DKI JAKARTA', '3171', 'JAKARTA PUSAT', 'KOTA', '317103', 'MENTENG', '3171033', 'CIKINI', '10330', 'Cikini', true),

-- Jakarta Selatan
('31', 'DKI JAKARTA', '3174', 'JAKARTA SELATAN', 'KOTA', '317401', 'KEBAYORAN BARU', '3174011', 'KRAMAT PELA', '12130', 'Kramat Pela', true),
('31', 'DKI JAKARTA', '3174', 'JAKARTA SELATAN', 'KOTA', '317401', 'KEBAYORAN BARU', '3174012', 'GANDARIA UTARA', '12140', 'Gandaria Utara', true),
('31', 'DKI JAKARTA', '3174', 'JAKARTA SELATAN', 'KOTA', '317401', 'KEBAYORAN BARU', '3174013', 'CIPETE UTARA', '12150', 'Cipete Utara', true),
('31', 'DKI JAKARTA', '3174', 'JAKARTA SELATAN', 'KOTA', '317402', 'KEBAYORAN LAMA', '3174021', 'KEBAYORAN LAMA UTARA', '12240', 'Kebayoran Lama Utara', true),
('31', 'DKI JAKARTA', '3174', 'JAKARTA SELATAN', 'KOTA', '317402', 'KEBAYORAN LAMA', '3174022', 'KEBAYORAN LAMA SELATAN', '12250', 'Kebayoran Lama Selatan', true),

-- Jakarta Utara
('31', 'DKI JAKARTA', '3172', 'JAKARTA UTARA', 'KOTA', '317201', 'PENJARINGAN', '3172011', 'PENJARINGAN', '14440', 'Penjaringan', true),
('31', 'DKI JAKARTA', '3172', 'JAKARTA UTARA', 'KOTA', '317201', 'PENJARINGAN', '3172012', 'PLUIT', '14450', 'Pluit', true),
('31', 'DKI JAKARTA', '3172', 'JAKARTA UTARA', 'KOTA', '317202', 'TANJUNG PRIOK', '3172021', 'TANJUNG PRIOK', '14310', 'Tanjung Priok', true),
('31', 'DKI JAKARTA', '3172', 'JAKARTA UTARA', 'KOTA', '317202', 'TANJUNG PRIOK', '3172022', 'KEBON BAWANG', '14320', 'Kebon Bawang', true),

-- Jawa Barat - Bandung
('32', 'JAWA BARAT', '3273', 'BANDUNG', 'KOTA', '327301', 'SUKASARI', '3273011', 'GEGER KALONG', '40153', 'Geger Kalong', true),
('32', 'JAWA BARAT', '3273', 'BANDUNG', 'KOTA', '327301', 'SUKASARI', '3273012', 'ISOLA', '40154', 'Isola', true),
('32', 'JAWA BARAT', '3273', 'BANDUNG', 'KOTA', '327301', 'SUKASARI', '3273013', 'SARIJADI', '40151', 'Sarijadi', true),
('32', 'JAWA BARAT', '3273', 'BANDUNG', 'KOTA', '327302', 'COBLONG', '3273021', 'COBLONG', '40132', 'Coblong', true),
('32', 'JAWA BARAT', '3273', 'BANDUNG', 'KOTA', '327302', 'COBLONG', '3273022', 'LEBAK GEDE', '40132', 'Lebak Gede', true),
('32', 'JAWA BARAT', '3273', 'BANDUNG', 'KOTA', '327302', 'COBLONG', '3273023', 'SADANG SERANG', '40133', 'Sadang Serang', true),

-- Jawa Timur - Surabaya
('35', 'JAWA TIMUR', '3578', 'SURABAYA', 'KOTA', '357801', 'TEGALSARI', '3578011', 'TEGALSARI', '60262', 'Tegalsari', true),
('35', 'JAWA TIMUR', '3578', 'SURABAYA', 'KOTA', '357801', 'TEGALSARI', '3578012', 'WONOREJO', '60263', 'Wonorejo', true),
('35', 'JAWA TIMUR', '3578', 'SURABAYA', 'KOTA', '357801', 'TEGALSARI', '3578013', 'KEPUTRAN', '60261', 'Keputran', true),
('35', 'JAWA TIMUR', '3578', 'SURABAYA', 'KOTA', '357802', 'GUBENG', '3578021', 'GUBENG', '60281', 'Gubeng', true),
('35', 'JAWA TIMUR', '3578', 'SURABAYA', 'KOTA', '357802', 'GUBENG', '3578022', 'AIRLANGGA', '60286', 'Airlangga', true),

-- Bali - Denpasar
('51', 'BALI', '5171', 'DENPASAR', 'KOTA', '517101', 'SOUTH DENPASAR', '5171011', 'SANUR', '80228', 'Sanur', true),
('51', 'BALI', '5171', 'DENPASAR', 'KOTA', '517101', 'SOUTH DENPASAR', '5171012', 'RENON', '80235', 'Renon', true),
('51', 'BALI', '5171', 'DENPASAR', 'KOTA', '517101', 'SOUTH DENPASAR', '5171013', 'SESETAN', '80223', 'Sesetan', true),
('51', 'BALI', '5171', 'DENPASAR', 'KOTA', '517102', 'EAST DENPASAR', '5171021', 'KESIMAN', '80237', 'Kesiman', true),
('51', 'BALI', '5171', 'DENPASAR', 'KOTA', '517102', 'EAST DENPASAR', '5171022', 'PENATIH', '80238', 'Penatih', true),

-- Sumatera Utara - Medan
('12', 'SUMATERA UTARA', '1275', 'MEDAN', 'KOTA', '127501', 'MEDAN KOTA', '1275011', 'GAHARU', '20212', 'Gaharu', true),
('12', 'SUMATERA UTARA', '1275', 'MEDAN', 'KOTA', '127501', 'MEDAN KOTA', '1275012', 'KAMPUNG BARU', '20213', 'Kampung Baru', true),
('12', 'SUMATERA UTARA', '1275', 'MEDAN', 'KOTA', '127501', 'MEDAN KOTA', '1275013', 'PUSAT PASAR', '20212', 'Pusat Pasar', true),
('12', 'SUMATERA UTARA', '1275', 'MEDAN', 'KOTA', '127502', 'MEDAN BARU', '1275021', 'BABURA', '20153', 'Babura', true),
('12', 'SUMATERA UTARA', '1275', 'MEDAN', 'KOTA', '127502', 'MEDAN BARU', '1275022', 'MERDEKA', '20111', 'Merdeka', true)

ON CONFLICT (id) DO NOTHING;