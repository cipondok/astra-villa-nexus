-- Clean up duplicate and incomplete Serang entries
-- Delete the old incomplete Serang entries (both KOTA and KABUPATEN types that are incomplete)
DELETE FROM public.locations 
WHERE province_name = 'Banten' 
  AND city_name = 'Serang' 
  AND (subdistrict_name IS NULL OR subdistrict_name = '');