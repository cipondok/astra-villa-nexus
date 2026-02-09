
CREATE OR REPLACE FUNCTION public.get_distinct_provinces()
RETURNS TABLE(province_code text, province_name text) 
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT l.province_code, l.province_name 
  FROM locations l 
  WHERE l.is_active = true 
  ORDER BY l.province_name;
$$;

CREATE OR REPLACE FUNCTION public.get_distinct_cities(p_province_code text DEFAULT NULL)
RETURNS TABLE(city_code text, city_name text, city_type text, province_name text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT l.city_code, l.city_name, l.city_type, l.province_name
  FROM locations l
  WHERE l.is_active = true 
    AND l.city_code IS NOT NULL AND l.city_code != ''
    AND (p_province_code IS NULL OR l.province_code = p_province_code)
  ORDER BY l.city_name;
$$;

CREATE OR REPLACE FUNCTION public.get_distinct_districts(p_province_code text DEFAULT NULL, p_city_code text DEFAULT NULL)
RETURNS TABLE(district_code text, district_name text, city_name text, province_name text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT l.district_code, l.district_name, l.city_name, l.province_name
  FROM locations l
  WHERE l.is_active = true
    AND l.district_code IS NOT NULL AND l.district_code != ''
    AND (p_province_code IS NULL OR l.province_code = p_province_code)
    AND (p_city_code IS NULL OR l.city_code = p_city_code)
  ORDER BY l.district_name;
$$;

CREATE OR REPLACE FUNCTION public.get_distinct_subdistricts(p_province_code text DEFAULT NULL, p_city_code text DEFAULT NULL, p_district_code text DEFAULT NULL)
RETURNS TABLE(subdistrict_code text, subdistrict_name text, district_name text, city_name text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT l.subdistrict_code, l.subdistrict_name, l.district_name, l.city_name
  FROM locations l
  WHERE l.is_active = true
    AND l.subdistrict_code IS NOT NULL AND l.subdistrict_code != ''
    AND (p_province_code IS NULL OR l.province_code = p_province_code)
    AND (p_city_code IS NULL OR l.city_code = p_city_code)
    AND (p_district_code IS NULL OR l.district_code = p_district_code)
  ORDER BY l.subdistrict_name;
$$;
