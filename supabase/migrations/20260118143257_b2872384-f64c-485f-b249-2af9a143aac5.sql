-- Delete all Level 4 (Kelurahan/Desa) entries - subdistricts where subdistrict_code is not empty
DELETE FROM locations WHERE subdistrict_code != '' AND subdistrict_code IS NOT NULL;