-- Add complete Kelurahan/Desa (subdistrict) data for Banten province

-- Update existing records with missing subdistricts
UPDATE public.locations 
SET subdistrict_name = 'Rangkasbitung', subdistrict_code = '3601010001'
WHERE province_name = 'Banten' AND city_name = 'Lebak' AND district_name = 'Rangkasbitung' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Leuwidamar', subdistrict_code = '3601020001'
WHERE province_name = 'Banten' AND city_name = 'Lebak' AND district_name = 'Leuwidamar' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Lebakgedong', subdistrict_code = '3601030001'
WHERE province_name = 'Banten' AND city_name = 'Lebak' AND district_name = 'Lebakgedong' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Kalanganyar', subdistrict_code = '3601040001'
WHERE province_name = 'Banten' AND city_name = 'Lebak' AND district_name = 'Kalanganyar' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Cijaku', subdistrict_code = '3601050001'
WHERE province_name = 'Banten' AND city_name = 'Lebak' AND district_name = 'Cijaku' AND subdistrict_name IS NULL;

-- Pandeglang
UPDATE public.locations 
SET subdistrict_name = 'Pandeglang', subdistrict_code = '3602010001'
WHERE province_name = 'Banten' AND city_name = 'Pandeglang' AND district_name = 'Pandeglang' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Cadasari', subdistrict_code = '3602020001'
WHERE province_name = 'Banten' AND city_name = 'Pandeglang' AND district_name = 'Cadasari' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Cigeulis', subdistrict_code = '3602030001'
WHERE province_name = 'Banten' AND city_name = 'Pandeglang' AND district_name = 'Cigeulis' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Labuan', subdistrict_code = '3602040001'
WHERE province_name = 'Banten' AND city_name = 'Pandeglang' AND district_name = 'Labuan' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Sumur', subdistrict_code = '3602050001'
WHERE province_name = 'Banten' AND city_name = 'Pandeglang' AND district_name = 'Sumur' AND subdistrict_name IS NULL;

-- Serang Kabupaten
UPDATE public.locations 
SET subdistrict_name = 'Anyar', subdistrict_code = '3604010001'
WHERE province_name = 'Banten' AND city_name = 'Serang' AND district_name = 'Anyar' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Cikande', subdistrict_code = '3604020001'
WHERE province_name = 'Banten' AND city_name = 'Serang' AND district_name = 'Cikande' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Cinangka', subdistrict_code = '3604030001'
WHERE province_name = 'Banten' AND city_name = 'Serang' AND district_name = 'Cinangka' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Ciruas', subdistrict_code = '3604040001'
WHERE province_name = 'Banten' AND city_name = 'Serang' AND district_name = 'Ciruas' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Kramatwatu', subdistrict_code = '3604050001'
WHERE province_name = 'Banten' AND city_name = 'Serang' AND district_name = 'Kramatwatu' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Pabuaran', subdistrict_code = '3604060001'
WHERE province_name = 'Banten' AND city_name = 'Serang' AND district_name = 'Pabuaran' AND subdistrict_name IS NULL;

-- Tangerang Kota
UPDATE public.locations 
SET subdistrict_name = 'Tangerang', subdistrict_code = '3671010001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Tangerang' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Batuceper', subdistrict_code = '3671020001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Batuceper' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Benda', subdistrict_code = '3671030001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Benda' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Ciledug', subdistrict_code = '3671040001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Ciledug' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Cipondoh', subdistrict_code = '3671050001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Cipondoh' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Jatiuwung', subdistrict_code = '3671060001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Jatiuwung' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Karawaci', subdistrict_code = '3671070001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Karawaci' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Larangan', subdistrict_code = '3671080001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Larangan' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Neglasari', subdistrict_code = '3671090001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Neglasari' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Periuk', subdistrict_code = '3671100001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Periuk' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Pinang', subdistrict_code = '3671110001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND district_name = 'Pinang' AND subdistrict_name IS NULL;

-- Tangerang Kabupaten
UPDATE public.locations 
SET subdistrict_name = 'Balaraja', subdistrict_code = '3603010001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Balaraja' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Cisoka', subdistrict_code = '3603020001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Cisoka' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Curug', subdistrict_code = '3603030001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Curug' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Kelapa Dua', subdistrict_code = '3603040001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Kelapa Dua' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Kosambi', subdistrict_code = '3603050001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Kosambi' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Legok', subdistrict_code = '3603060001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Legok' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Pagedangan', subdistrict_code = '3603070001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Pagedangan' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Pasar Kemis', subdistrict_code = '3603080001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Pasar Kemis' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Rajeg', subdistrict_code = '3603090001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Rajeg' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Teluknaga', subdistrict_code = '3603100001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Teluknaga' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Tigaraksa', subdistrict_code = '3603110001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang' AND city_type = 'KABUPATEN' AND district_name = 'Tigaraksa' AND subdistrict_name IS NULL;

-- Tangerang Selatan
UPDATE public.locations 
SET subdistrict_name = 'Ciputat', subdistrict_code = '3674010001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang Selatan' AND district_name = 'Ciputat' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Ciputat Timur', subdistrict_code = '3674020001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang Selatan' AND district_name = 'Ciputat Timur' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Pamulang', subdistrict_code = '3674030001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang Selatan' AND district_name = 'Pamulang' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Pondok Aren', subdistrict_code = '3674040001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang Selatan' AND district_name = 'Pondok Aren' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Serpong', subdistrict_code = '3674050001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang Selatan' AND district_name = 'Serpong' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Serpong Utara', subdistrict_code = '3674060001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang Selatan' AND district_name = 'Serpong Utara' AND subdistrict_name IS NULL;

UPDATE public.locations 
SET subdistrict_name = 'Setu', subdistrict_code = '3674070001'
WHERE province_name = 'Banten' AND city_name = 'Tangerang Selatan' AND district_name = 'Setu' AND subdistrict_name IS NULL;