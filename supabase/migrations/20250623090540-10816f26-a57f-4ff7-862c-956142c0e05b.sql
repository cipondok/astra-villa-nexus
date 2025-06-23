
-- Add more comprehensive Indonesian location data
INSERT INTO public.locations (province_code, province_name, city_code, city_name, city_type, district_code, district_name, area_name, is_capital, postal_code) VALUES

-- Aceh
('11', 'Aceh', '1171', 'Banda Aceh', 'KOTA', '117101', 'Baiturrahman', 'Baiturrahman', TRUE, '23111'),
('11', 'Aceh', '1171', 'Banda Aceh', 'KOTA', '117102', 'Banda Raya', 'Banda Raya', FALSE, '23125'),
('11', 'Aceh', '1171', 'Banda Aceh', 'KOTA', '117103', 'Jaya Baru', 'Jaya Baru', FALSE, '23132'),
('11', 'Aceh', '1101', 'Aceh Besar', 'KABUPATEN', '110101', 'Lembah Seulawah', 'Lampisang', FALSE, '23351'),

-- Sumatera Utara (expand existing)
('12', 'Sumatera Utara', '1275', 'Binjai', 'KOTA', '127501', 'Binjai Kota', 'Binjai Kota', FALSE, '20712'),
('12', 'Sumatera Utara', '1276', 'Tebing Tinggi', 'KOTA', '127601', 'Tebing Tinggi Kota', 'Tebing Tinggi Kota', FALSE, '20632'),
('12', 'Sumatera Utara', '1277', 'Pematang Siantar', 'KOTA', '127701', 'Siantar Barat', 'Siantar Barat', FALSE, '21111'),

-- Sumatera Selatan
('16', 'Sumatera Selatan', '1671', 'Palembang', 'KOTA', '167101', 'Ilir Barat I', 'Lorok Pakjo', TRUE, '30111'),
('16', 'Sumatera Selatan', '1671', 'Palembang', 'KOTA', '167102', 'Ilir Timur I', 'Bukit Lama', FALSE, '30118'),
('16', 'Sumatera Selatan', '1671', 'Palembang', 'KOTA', '167103', 'Seberang Ulu I', 'Seberang Ulu I', FALSE, '30252'),

-- Lampung
('18', 'Lampung', '1871', 'Bandar Lampung', 'KOTA', '187101', 'Teluk Betung Selatan', 'Gunung Mas', TRUE, '35211'),
('18', 'Lampung', '1871', 'Bandar Lampung', 'KOTA', '187102', 'Tanjung Karang Pusat', 'Pasir Gintung', FALSE, '35115'),
('18', 'Lampung', '1872', 'Metro', 'KOTA', '187201', 'Metro Pusat', 'Metro', FALSE, '34111'),

-- Kepulauan Bangka Belitung
('19', 'Kepulauan Bangka Belitung', '1971', 'Pangkal Pinang', 'KOTA', '197101', 'Bukit Intan', 'Bukit Intan', TRUE, '33115'),
('19', 'Kepulauan Bangka Belitung', '1901', 'Bangka', 'KABUPATEN', '190101', 'Sungai Liat', 'Sungai Liat', FALSE, '33211'),

-- Kepulauan Riau
('21', 'Kepulauan Riau', '2171', 'Batam', 'KOTA', '217101', 'Batam Kota', 'Teluk Tering', TRUE, '29432'),
('21', 'Kepulauan Riau', '2172', 'Tanjung Pinang', 'KOTA', '217201', 'Tanjung Pinang Kota', 'Tanjung Pinang Kota', FALSE, '29111'),

-- Jambi
('15', 'Jambi', '1571', 'Jambi', 'KOTA', '157101', 'Telanaipura', 'Telanaipura', TRUE, '36122'),
('15', 'Jambi', '1571', 'Jambi', 'KOTA', '157102', 'Jambi Selatan', 'Legok', FALSE, '36138'),

-- Bengkulu
('17', 'Bengkulu', '1771', 'Bengkulu', 'KOTA', '177101', 'Teluk Segara', 'Kampung Jawa', TRUE, '38211'),
('17', 'Bengkulu', '1771', 'Bengkulu', 'KOTA', '177102', 'Ratu Agung', 'Ratu Agung', FALSE, '38222'),

-- Jawa Barat (expand existing)
('32', 'Jawa Barat', '3275', 'Bekasi', 'KOTA', '327501', 'Bekasi Barat', 'Kranji', FALSE, '17134'),
('32', 'Jawa Barat', '3275', 'Bekasi', 'KOTA', '327502', 'Bekasi Timur', 'Margahayu', FALSE, '17113'),
('32', 'Jawa Barat', '3276', 'Depok', 'KOTA', '327601', 'Pancoran Mas', 'Pancoran Mas', FALSE, '16431'),
('32', 'Jawa Barat', '3276', 'Depok', 'KOTA', '327602', 'Beji', 'Beji', FALSE, '16421'),
('32', 'Jawa Barat', '3278', 'Cirebon', 'KOTA', '327801', 'Kejaksan', 'Kejaksan', FALSE, '45121'),
('32', 'Jawa Barat', '3279', 'Sukabumi', 'KOTA', '327901', 'Cikole', 'Cikole', FALSE, '43111'),

-- Banten
('36', 'Banten', '3671', 'Tangerang', 'KOTA', '367101', 'Tangerang', 'Babakan', FALSE, '15118'),
('36', 'Banten', '3672', 'Cilegon', 'KOTA', '367201', 'Cilegon', 'Cilegon', FALSE, '42411'),
('36', 'Banten', '3673', 'Serang', 'KOTA', '367301', 'Serang', 'Serang', TRUE, '42111'),
('36', 'Banten', '3674', 'Tangerang Selatan', 'KOTA', '367401', 'Serpong', 'Serpong', FALSE, '15310'),
('36', 'Banten', '3674', 'Tangerang Selatan', 'KOTA', '367402', 'Pondok Aren', 'Pondok Aren', FALSE, '15224'),

-- Jawa Tengah (expand existing)
('33', 'Jawa Tengah', '3372', 'Surakarta', 'KOTA', '337201', 'Laweyan', 'Laweyan', FALSE, '57142'),
('33', 'Jawa Tengah', '3373', 'Tegal', 'KOTA', '337301', 'Tegal Timur', 'Tegal Timur', FALSE, '52124'),
('33', 'Jawa Tengah', '3376', 'Pekalongan', 'KOTA', '337601', 'Pekalongan Barat', 'Pekalongan Barat', FALSE, '51119'),

-- Jawa Timur (expand existing)
('35', 'Jawa Timur', '3574', 'Batu', 'KOTA', '357401', 'Batu', 'Batu', FALSE, '65311'),
('35', 'Jawa Timur', '3575', 'Blitar', 'KOTA', '357501', 'Sukorejo', 'Sukorejo', FALSE, '66124'),
('35', 'Jawa Timur', '3576', 'Kediri', 'KOTA', '357601', 'Mojoroto', 'Mojoroto', FALSE, '64112'),
('35', 'Jawa Timur', '3577', 'Madiun', 'KOTA', '357701', 'Taman', 'Taman', FALSE, '63133'),
('35', 'Jawa Timur', '3579', 'Pasuruan', 'KOTA', '357901', 'Purworejo', 'Purworejo', FALSE, '67117'),

-- Bali (expand existing)
('51', 'Bali', '5174', 'Tabanan', 'KABUPATEN', '517401', 'Tabanan', 'Tabanan', FALSE, '82111'),
('51', 'Bali', '5105', 'Karangasem', 'KABUPATEN', '510501', 'Karangasem', 'Karangasem', FALSE, '80811'),
('51', 'Bali', '5106', 'Buleleng', 'KABUPATEN', '510601', 'Singaraja', 'Singaraja', FALSE, '81111'),

-- Nusa Tenggara Barat
('52', 'Nusa Tenggara Barat', '5271', 'Mataram', 'KOTA', '527101', 'Ampenan', 'Ampenan', TRUE, '83114'),
('52', 'Nusa Tenggara Barat', '5271', 'Mataram', 'KOTA', '527102', 'Mataram', 'Mataram', FALSE, '83125'),
('52', 'Nusa Tenggara Barat', '5272', 'Bima', 'KOTA', '527201', 'Rasanae Barat', 'Rasanae Barat', FALSE, '84114'),

-- Nusa Tenggara Timur
('53', 'Nusa Tenggara Timur', '5371', 'Kupang', 'KOTA', '537101', 'Alak', 'Alak', TRUE, '85228'),
('53', 'Nusa Tenggara Timur', '5371', 'Kupang', 'KOTA', '537102', 'Maulafa', 'Maulafa', FALSE, '85148'),

-- Kalimantan Barat
('61', 'Kalimantan Barat', '6171', 'Pontianak', 'KOTA', '617101', 'Pontianak Kota', 'Sungai Bangkong', TRUE, '78113'),
('61', 'Kalimantan Barat', '6171', 'Pontianak', 'KOTA', '617102', 'Pontianak Barat', 'Sungai Beliung', FALSE, '78124'),
('61', 'Kalimantan Barat', '6172', 'Singkawang', 'KOTA', '617201', 'Singkawang Barat', 'Pasiran', FALSE, '79123'),

-- Kalimantan Tengah
('62', 'Kalimantan Tengah', '6271', 'Palangka Raya', 'KOTA', '627101', 'Jekan Raya', 'Palangka', TRUE, '73111'),
('62', 'Kalimantan Tengah', '6271', 'Palangka Raya', 'KOTA', '627102', 'Pahandut', 'Pahandut', FALSE, '73112'),

-- Kalimantan Selatan
('63', 'Kalimantan Selatan', '6371', 'Banjarmasin', 'KOTA', '637101', 'Banjarmasin Selatan', 'Pemurus Baru', TRUE, '70234'),
('63', 'Kalimantan Selatan', '6371', 'Banjarmasin', 'KOTA', '637102', 'Banjarmasin Tengah', 'Gadang', FALSE, '70232'),
('63', 'Kalimantan Selatan', '6372', 'Banjarbaru', 'KOTA', '637201', 'Banjarbaru Selatan', 'Guntung Manggis', FALSE, '70714'),

-- Kalimantan Utara
('65', 'Kalimantan Utara', '6571', 'Tarakan', 'KOTA', '657101', 'Tarakan Barat', 'Karang Balik', TRUE, '77111'),
('65', 'Kalimantan Utara', '6571', 'Tarakan', 'KOTA', '657102', 'Tarakan Timur', 'Mamburungan', FALSE, '77124'),

-- Sulawesi Utara
('71', 'Sulawesi Utara', '7171', 'Manado', 'KOTA', '717101', 'Malalayang', 'Malalayang', TRUE, '95166'),
('71', 'Sulawesi Utara', '7171', 'Manado', 'KOTA', '717102', 'Sario', 'Sario', FALSE, '95112'),
('71', 'Sulawesi Utara', '7172', 'Bitung', 'KOTA', '717201', 'Maesa', 'Maesa', FALSE, '95512'),
('71', 'Sulawesi Utara', '7173', 'Tomohon', 'KOTA', '717301', 'Tomohon Selatan', 'Tomohon', FALSE, '95416'),

-- Sulawesi Tengah
('72', 'Sulawesi Tengah', '7271', 'Palu', 'KOTA', '727101', 'Palu Barat', 'Lere', TRUE, '94111'),
('72', 'Sulawesi Tengah', '7271', 'Palu', 'KOTA', '727102', 'Palu Timur', 'Kawatuna', FALSE, '94112'),

-- Sulawesi Tenggara
('74', 'Sulawesi Tenggara', '7471', 'Kendari', 'KOTA', '747101', 'Mandonga', 'Mandonga', TRUE, '93232'),
('74', 'Sulawesi Tenggara', '7471', 'Kendari', 'KOTA', '747102', 'Baruga', 'Baruga', FALSE, '93791'),
('74', 'Sulawesi Tenggara', '7472', 'Bau-Bau', 'KOTA', '747201', 'Murhum', 'Murhum', FALSE, '93719'),

-- Gorontalo
('75', 'Gorontalo', '7571', 'Gorontalo', 'KOTA', '757101', 'Kota Selatan', 'Bugis', TRUE, '96115'),
('75', 'Gorontalo', '7571', 'Gorontalo', 'KOTA', '757102', 'Kota Utara', 'Biawao', FALSE, '96138'),

-- Sulawesi Barat
('76', 'Sulawesi Barat', '7671', 'Mamuju', 'KABUPATEN', '767101', 'Mamuju', 'Mamuju', TRUE, '91511'),

-- Maluku
('81', 'Maluku', '8171', 'Ambon', 'KOTA', '817101', 'Sirimau', 'Mardika', TRUE, '97124'),
('81', 'Maluku', '8171', 'Ambon', 'KOTA', '817102', 'Baguala', 'Poka', FALSE, '97233'),
('81', 'Maluku', '8172', 'Tual', 'KOTA', '817201', 'Dullah Selatan', 'Dullah Selatan', FALSE, '97612'),

-- Maluku Utara
('82', 'Maluku Utara', '8271', 'Ternate', 'KOTA', '827101', 'Ternate Selatan', 'Mangga Dua', TRUE, '97714'),
('82', 'Maluku Utara', '8271', 'Ternate', 'KOTA', '827102', 'Ternate Utara', 'Sulamadaha', FALSE, '97728'),
('82', 'Maluku Utara', '8272', 'Tidore Kepulauan', 'KOTA', '827201', 'Tidore', 'Tidore', FALSE, '97815'),

-- Papua Barat
('91', 'Papua Barat', '9171', 'Sorong', 'KOTA', '917101', 'Sorong Barat', 'Sorong Barat', TRUE, '98411'),
('91', 'Papua Barat', '9171', 'Sorong', 'KOTA', '917102', 'Sorong Timur', 'Sorong Timur', FALSE, '98414'),

-- Papua
('94', 'Papua', '9471', 'Jayapura', 'KOTA', '947101', 'Jayapura Selatan', 'Tanjung Ria', TRUE, '99114'),
('94', 'Papua', '9471', 'Jayapura', 'KOTA', '947102', 'Jayapura Utara', 'Bhayangkara', FALSE, '99112');
