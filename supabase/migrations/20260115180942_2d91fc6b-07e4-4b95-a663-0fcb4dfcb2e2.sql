-- Update existing DKI Jakarta locations with Kelurahan/Desa data (only records without subdistrict)

UPDATE public.locations SET subdistrict_name = 'Cengkareng Barat', subdistrict_code = '3173011' WHERE id = 'e19d249c-dbb2-4a03-a36c-d0f0457b6b8d' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Kembangan Utara', subdistrict_code = '3173021' WHERE id = 'f2cbb423-d20c-41f1-af96-624c2d48f205' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Palmerah', subdistrict_code = '3173031' WHERE id = '44a226e7-909b-432c-aa83-03c0401e38bf' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Duri Pulo', subdistrict_code = '3171014' WHERE id = 'ca9ad942-bb88-4f16-ad5e-105edf8efc76' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Kemayoran', subdistrict_code = '3171051' WHERE id = '88849d2a-d651-45f9-b1b0-6fb6e01fde67' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Pasar Baru', subdistrict_code = '3171041' WHERE id = '9c9da9cd-94e5-4472-8f53-d366c54fe6a5' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Jagakarsa', subdistrict_code = '3174101' WHERE id = 'fffb4b34-1f15-4d7c-b24e-c6fca9165c51' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Pondok Pinang', subdistrict_code = '3174023' WHERE id = 'a8f1b5df-7912-4d3d-bb5a-691aaf9e3f88' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Pondok Indah', subdistrict_code = '3174031' WHERE id = '4355a806-e8eb-4bbc-8229-4c6c7fb6be72' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Cakung Barat', subdistrict_code = '3175011' WHERE id = 'e4abb274-7174-4582-9a63-e674f356dc08' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Gedong', subdistrict_code = '3175021' WHERE id = '2133899f-0679-4194-aacc-89ea6b941e5a' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Pulogadung', subdistrict_code = '3175031' WHERE id = 'b9425bbf-7922-407a-9729-488b088a2fef' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Kelapa Gading Barat', subdistrict_code = '3172011' WHERE id = 'a79c48a6-0b65-4de8-933b-289053d3f40f' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'Penjaringan', subdistrict_code = '3172021' WHERE id = 'a2264944-b162-4928-b56a-a4c3c06dace1' AND subdistrict_name IS NULL;
UPDATE public.locations SET subdistrict_name = 'DKI Jakarta', subdistrict_code = '31' WHERE id = 'cf021cab-b301-48d6-9ea0-abafbded6ab2' AND subdistrict_name IS NULL;