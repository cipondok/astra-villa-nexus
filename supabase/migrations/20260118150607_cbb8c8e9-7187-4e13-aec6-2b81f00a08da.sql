-- Create a function to get accurate location statistics
CREATE OR REPLACE FUNCTION public.get_location_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'provinces', (SELECT COUNT(DISTINCT province_code) FROM locations WHERE province_code IS NOT NULL AND province_code != ''),
    'cities', (SELECT COUNT(DISTINCT city_code) FROM locations WHERE city_code IS NOT NULL AND city_code != ''),
    'districts', (SELECT COUNT(DISTINCT district_code) FROM locations WHERE district_code IS NOT NULL AND district_code != ''),
    'subdistricts', (SELECT COUNT(DISTINCT subdistrict_code) FROM locations WHERE subdistrict_code IS NOT NULL AND subdistrict_code != '')
  ) INTO result;
  
  RETURN result;
END;
$$;