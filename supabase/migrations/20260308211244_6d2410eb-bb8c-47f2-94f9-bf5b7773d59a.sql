CREATE OR REPLACE FUNCTION public.get_province_property_counts()
RETURNS TABLE(province text, property_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    CASE
      WHEN state ILIKE '%aceh%' THEN 'Aceh'
      WHEN state ILIKE '%sumatera utara%' THEN 'Sumatera Utara'
      WHEN state ILIKE '%sumatera barat%' THEN 'Sumatera Barat'
      WHEN state ILIKE '%kepulauan riau%' THEN 'Kepulauan Riau'
      WHEN state ILIKE '%riau%' THEN 'Riau'
      WHEN state ILIKE '%jambi%' THEN 'Jambi'
      WHEN state ILIKE '%sumatera selatan%' THEN 'Sumatera Selatan'
      WHEN state ILIKE '%bengkulu%' THEN 'Bengkulu'
      WHEN state ILIKE '%bangka%' OR state ILIKE '%belitung%' THEN 'Bangka Belitung'
      WHEN state ILIKE '%lampung%' THEN 'Lampung'
      WHEN state ILIKE '%banten%' THEN 'Banten'
      WHEN state ILIKE '%jakarta%' THEN 'DKI Jakarta'
      WHEN state ILIKE '%jawa barat%' THEN 'Jawa Barat'
      WHEN state ILIKE '%jawa tengah%' THEN 'Jawa Tengah'
      WHEN state ILIKE '%yogyakarta%' THEN 'Yogyakarta'
      WHEN state ILIKE '%jawa timur%' THEN 'Jawa Timur'
      WHEN state ILIKE '%kalimantan barat%' THEN 'Kalimantan Barat'
      WHEN state ILIKE '%kalimantan tengah%' THEN 'Kalimantan Tengah'
      WHEN state ILIKE '%kalimantan selatan%' THEN 'Kalimantan Selatan'
      WHEN state ILIKE '%kalimantan timur%' THEN 'Kalimantan Timur'
      WHEN state ILIKE '%kalimantan utara%' THEN 'Kalimantan Utara'
      WHEN state ILIKE '%sulawesi utara%' THEN 'Sulawesi Utara'
      WHEN state ILIKE '%gorontalo%' THEN 'Gorontalo'
      WHEN state ILIKE '%sulawesi tengah%' THEN 'Sulawesi Tengah'
      WHEN state ILIKE '%sulawesi barat%' THEN 'Sulawesi Barat'
      WHEN state ILIKE '%sulawesi selatan%' THEN 'Sulawesi Selatan'
      WHEN state ILIKE '%sulawesi tenggara%' THEN 'Sulawesi Tenggara'
      WHEN state ILIKE '%bali%' THEN 'Bali'
      WHEN state ILIKE '%nusa tenggara barat%' OR state ILIKE '%lombok%' THEN 'Nusa Tenggara Barat'
      WHEN state ILIKE '%nusa tenggara timur%' THEN 'Nusa Tenggara Timur'
      WHEN state ILIKE '%maluku utara%' THEN 'Maluku Utara'
      WHEN state ILIKE '%maluku%' THEN 'Maluku'
      WHEN state ILIKE '%papua barat%' THEN 'Papua Barat'
      WHEN state ILIKE '%papua%' THEN 'Papua'
      ELSE state
    END AS province,
    count(*) AS property_count
  FROM properties
  WHERE status = 'active' AND state IS NOT NULL AND state != ''
  GROUP BY 1
  ORDER BY property_count DESC;
$$;