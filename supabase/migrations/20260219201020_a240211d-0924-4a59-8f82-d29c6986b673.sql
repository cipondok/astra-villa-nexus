
CREATE OR REPLACE FUNCTION get_province_property_counts()
RETURNS TABLE (
  province TEXT,
  property_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    CASE
      WHEN lower(public.properties.state) IN ('di yogyakarta', 'diy yogyakarta', 'yogyakarta', 'yogya', 'jogja') THEN 'Yogyakarta'
      WHEN lower(public.properties.state) IN ('dki jakarta', 'jakarta', 'central jakarta', 'south jakarta', 'north jakarta', 'west jakarta', 'east jakarta') THEN 'DKI Jakarta'
      WHEN lower(public.properties.state) IN ('kepulauan bangka belitung', 'bangka belitung') THEN 'Bangka Belitung'
      WHEN lower(public.properties.state) IN ('jawa barat', 'west java') THEN 'Jawa Barat'
      WHEN lower(public.properties.state) IN ('jawa tengah', 'central java') THEN 'Jawa Tengah'
      WHEN lower(public.properties.state) IN ('jawa timur', 'east java') THEN 'Jawa Timur'
      WHEN lower(public.properties.state) IN ('kalimantan barat', 'west kalimantan') THEN 'Kalimantan Barat'
      WHEN lower(public.properties.state) IN ('kalimantan tengah', 'central kalimantan') THEN 'Kalimantan Tengah'
      WHEN lower(public.properties.state) IN ('kalimantan selatan', 'south kalimantan') THEN 'Kalimantan Selatan'
      WHEN lower(public.properties.state) IN ('kalimantan timur', 'east kalimantan') THEN 'Kalimantan Timur'
      WHEN lower(public.properties.state) IN ('kalimantan utara', 'north kalimantan') THEN 'Kalimantan Utara'
      WHEN lower(public.properties.state) IN ('sulawesi utara', 'north sulawesi') THEN 'Sulawesi Utara'
      WHEN lower(public.properties.state) IN ('sulawesi tengah', 'central sulawesi') THEN 'Sulawesi Tengah'
      WHEN lower(public.properties.state) IN ('sulawesi barat', 'west sulawesi') THEN 'Sulawesi Barat'
      WHEN lower(public.properties.state) IN ('sulawesi selatan', 'south sulawesi') THEN 'Sulawesi Selatan'
      WHEN lower(public.properties.state) IN ('sulawesi tenggara', 'southeast sulawesi') THEN 'Sulawesi Tenggara'
      WHEN lower(public.properties.state) IN ('nusa tenggara barat', 'west nusa tenggara', 'ntb') THEN 'Nusa Tenggara Barat'
      WHEN lower(public.properties.state) IN ('nusa tenggara timur', 'east nusa tenggara', 'ntt') THEN 'Nusa Tenggara Timur'
      WHEN lower(public.properties.state) IN ('sumatera utara', 'north sumatra') THEN 'Sumatera Utara'
      WHEN lower(public.properties.state) IN ('sumatera barat', 'west sumatra') THEN 'Sumatera Barat'
      WHEN lower(public.properties.state) IN ('sumatera selatan', 'south sumatra') THEN 'Sumatera Selatan'
      WHEN lower(public.properties.state) IN ('maluku utara', 'north maluku') THEN 'Maluku Utara'
      WHEN lower(public.properties.state) IN ('kepulauan riau', 'riau islands') THEN 'Kepulauan Riau'
      WHEN lower(public.properties.state) IN ('papua barat', 'west papua') THEN 'Papua Barat'
      ELSE public.properties.state
    END AS province,
    COUNT(*) AS property_count
  FROM public.properties
  WHERE public.properties.status = 'active'
    AND public.properties.approval_status = 'approved'
    AND public.properties.state IS NOT NULL
    AND public.properties.state != ''
  GROUP BY 1
  ORDER BY property_count DESC;
$$;
