-- Step 1: Update all location names to Title Case (Indonesian standard)
UPDATE locations SET 
  province_name = INITCAP(LOWER(province_name)),
  city_name = INITCAP(LOWER(city_name)),
  district_name = INITCAP(LOWER(district_name)),
  subdistrict_name = CASE 
    WHEN subdistrict_name IS NOT NULL THEN INITCAP(LOWER(subdistrict_name))
    ELSE NULL
  END,
  area_name = CASE 
    WHEN area_name IS NOT NULL THEN INITCAP(LOWER(area_name))
    ELSE NULL
  END
WHERE province_name IS NOT NULL;

-- Step 2: Fix English district names to Indonesian for Bali (Denpasar)
UPDATE locations SET 
  district_name = 'Denpasar Selatan'
WHERE LOWER(district_name) = 'south denpasar';

UPDATE locations SET 
  district_name = 'Denpasar Timur'
WHERE LOWER(district_name) = 'east denpasar';

UPDATE locations SET 
  district_name = 'Denpasar Utara'
WHERE LOWER(district_name) = 'north denpasar';

UPDATE locations SET 
  district_name = 'Denpasar Barat'
WHERE LOWER(district_name) = 'west denpasar';

-- Step 3: Create a temporary table with unique locations (keeping one record per unique combination)
CREATE TEMP TABLE locations_unique AS
SELECT DISTINCT ON (
  LOWER(province_name), 
  LOWER(city_name), 
  LOWER(COALESCE(district_name, '')), 
  LOWER(COALESCE(subdistrict_name, ''))
)
  id,
  province_code,
  province_name,
  city_code,
  city_name,
  city_type,
  district_code,
  district_name,
  subdistrict_code,
  subdistrict_name,
  postal_code,
  area_name,
  coordinates,
  population,
  area_km2,
  is_capital,
  is_active,
  created_at,
  updated_at
FROM locations
ORDER BY 
  LOWER(province_name), 
  LOWER(city_name), 
  LOWER(COALESCE(district_name, '')), 
  LOWER(COALESCE(subdistrict_name, '')),
  created_at ASC;

-- Step 4: Delete all records from locations
DELETE FROM locations;

-- Step 5: Re-insert unique records
INSERT INTO locations (
  id, province_code, province_name, city_code, city_name, city_type,
  district_code, district_name, subdistrict_code, subdistrict_name,
  postal_code, area_name, coordinates, population, area_km2, is_capital, is_active, created_at, updated_at
)
SELECT 
  id, province_code, province_name, city_code, city_name, city_type,
  district_code, district_name, subdistrict_code, subdistrict_name,
  postal_code, area_name, coordinates, population, area_km2, is_capital, is_active, created_at, updated_at
FROM locations_unique;

-- Step 6: Drop temporary table
DROP TABLE locations_unique;