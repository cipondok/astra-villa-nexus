-- Update existing locations to add subdistrict_name values where missing
-- This fills in the 4th level (kelurahan/desa) data

-- Bali - Denpasar
UPDATE public.locations 
SET subdistrict_name = 'Pemecutan Klod', subdistrict_code = '5171020001'
WHERE province_name = 'Bali' AND city_name = 'Denpasar' AND district_name = 'Denpasar Barat' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Peguyangan', subdistrict_code = '5171040001'
WHERE province_name = 'Bali' AND city_name = 'Denpasar' AND district_name = 'Denpasar Utara' AND subdistrict_name IS NULL;

-- Bali - Badung
UPDATE public.locations 
SET subdistrict_name = 'Abiansemal', subdistrict_code = '5102030001'
WHERE province_name = 'Bali' AND city_name = 'Badung' AND district_name = 'Abiansemal' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Mengwi', subdistrict_code = '5102020001'
WHERE province_name = 'Bali' AND city_name = 'Badung' AND district_name = 'Mengwi' AND subdistrict_name IS NULL;

-- Bali - Gianyar
UPDATE public.locations 
SET subdistrict_name = 'Blahbatuh', subdistrict_code = '5103020001'
WHERE province_name = 'Bali' AND city_name = 'Gianyar' AND district_name = 'Blahbatuh' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Sukawati', subdistrict_code = '5103010001'
WHERE province_name = 'Bali' AND city_name = 'Gianyar' AND district_name = 'Sukawati' AND subdistrict_name IS NULL;

-- Bali - Buleleng
UPDATE public.locations 
SET subdistrict_name = 'Singaraja', subdistrict_code = '5106010001'
WHERE province_name = 'Bali' AND city_name = 'Buleleng' AND district_name = 'Singaraja' AND subdistrict_name IS NULL;

-- Bali - Other locations
UPDATE public.locations 
SET subdistrict_name = 'Negara', subdistrict_code = '5101010001'
WHERE province_name = 'Bali' AND city_name = 'Jembrana' AND district_name = 'Negara' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Karangasem', subdistrict_code = '5105010001'
WHERE province_name = 'Bali' AND city_name = 'Karangasem' AND district_name = 'Karangasem' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Nusa Penida', subdistrict_code = '5104010001'
WHERE province_name = 'Bali' AND city_name = 'Klungkung' AND district_name = 'Nusa Penida' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Tabanan', subdistrict_code = '5102010001'
WHERE province_name = 'Bali' AND city_name = 'Tabanan' AND district_name = 'Tabanan' AND subdistrict_name IS NULL;

-- Jawa Barat - Bandung
UPDATE public.locations 
SET subdistrict_name = 'Andir', subdistrict_code = '3273030001'
WHERE province_name = 'Jawa Barat' AND city_name = 'Bandung' AND district_name = 'Andir' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Dago', subdistrict_code = '3273020001'
WHERE province_name = 'Jawa Barat' AND city_name = 'Bandung' AND district_name = 'Coblong' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Cidadap', subdistrict_code = '3273020002'
WHERE province_name = 'Jawa Barat' AND city_name = 'Bandung' AND district_name = 'Cidadap' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Sukasari', subdistrict_code = '3273010001'
WHERE province_name = 'Jawa Barat' AND city_name = 'Bandung' AND district_name = 'Sukasari' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Bandung Kulon', subdistrict_code = '3273010002'
WHERE province_name = 'Jawa Barat' AND city_name = 'Bandung' AND district_name = 'Bandung Kulon' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Soreang', subdistrict_code = '3204010001'
WHERE province_name = 'Jawa Barat' AND city_name = 'Bandung' AND city_type = 'KABUPATEN' AND district_name = 'Soreang' AND subdistrict_name IS NULL;

-- Jawa Barat - Bekasi
UPDATE public.locations 
SET subdistrict_name = 'Bekasi Barat', subdistrict_code = '3275010001'
WHERE province_name = 'Jawa Barat' AND city_name = 'Bekasi' AND district_name = 'Bekasi Barat' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Bekasi Timur', subdistrict_code = '3275020001'
WHERE province_name = 'Jawa Barat' AND city_name = 'Bekasi' AND district_name = 'Bekasi Timur' AND subdistrict_name IS NULL;

-- Jawa Barat - Bogor
UPDATE public.locations 
SET subdistrict_name = 'Bogor Selatan', subdistrict_code = '3271010001'
WHERE province_name = 'Jawa Barat' AND city_name = 'Bogor' AND district_name = 'Bogor Selatan' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Cibinong', subdistrict_code = '3201010001'
WHERE province_name = 'Jawa Barat' AND city_name = 'Bogor' AND district_name = 'Cibinong' AND subdistrict_name IS NULL;

-- Jawa Barat - Depok
UPDATE public.locations 
SET subdistrict_name = 'Beji', subdistrict_code = '3276020001'
WHERE province_name = 'Jawa Barat' AND city_name = 'Depok' AND district_name = 'Beji' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Pancoran Mas', subdistrict_code = '3276010001'
WHERE province_name = 'Jawa Barat' AND city_name = 'Depok' AND district_name = 'Pancoran Mas' AND subdistrict_name IS NULL;

-- Aceh
UPDATE public.locations 
SET subdistrict_name = 'Bakongan', subdistrict_code = '1101010001'
WHERE province_name = 'Aceh' AND city_name = 'Aceh Selatan' AND district_name = 'Bakongan' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Bambel', subdistrict_code = '1102010001'
WHERE province_name = 'Aceh' AND city_name = 'Aceh Tenggara' AND district_name = 'Bambel' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Serba Jadi', subdistrict_code = '1103010001'
WHERE province_name = 'Aceh' AND city_name = 'Aceh Timur' AND district_name = 'Serba Jadi' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Banda Raya', subdistrict_code = '1171010001'
WHERE province_name = 'Aceh' AND city_name = 'Banda Aceh' AND district_name = 'Banda Raya' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Jaya Baru', subdistrict_code = '1171020001'
WHERE province_name = 'Aceh' AND city_name = 'Banda Aceh' AND district_name = 'Jaya Baru' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Meuraxa', subdistrict_code = '1171030001'
WHERE province_name = 'Aceh' AND city_name = 'Banda Aceh' AND district_name = 'Meuraxa' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Sukakarya', subdistrict_code = '1172010001'
WHERE province_name = 'Aceh' AND city_name = 'Sabang' AND district_name = 'Sukakarya' AND subdistrict_name IS NULL;

-- Banten
UPDATE public.locations 
SET subdistrict_name = 'Cibeber', subdistrict_code = '3672010001'
WHERE province_name = 'Banten' AND city_name = 'Cilegon' AND district_name = 'Cibeber' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Cilegon', subdistrict_code = '3672020001'
WHERE province_name = 'Banten' AND city_name = 'Cilegon' AND district_name = 'Cilegon' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Citangkil', subdistrict_code = '3672030001'
WHERE province_name = 'Banten' AND city_name = 'Cilegon' AND district_name = 'Citangkil' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Ciwandan', subdistrict_code = '3672040001'
WHERE province_name = 'Banten' AND city_name = 'Cilegon' AND district_name = 'Ciwandan' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Grogol', subdistrict_code = '3672050001'
WHERE province_name = 'Banten' AND city_name = 'Cilegon' AND district_name IN ('Gerogol', 'Grogol') AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Jombang', subdistrict_code = '3672060001'
WHERE province_name = 'Banten' AND city_name = 'Cilegon' AND district_name = 'Jombang' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Purwakarta', subdistrict_code = '3672070001'
WHERE province_name = 'Banten' AND city_name = 'Cilegon' AND district_name = 'Purwakarta' AND subdistrict_name IS NULL;