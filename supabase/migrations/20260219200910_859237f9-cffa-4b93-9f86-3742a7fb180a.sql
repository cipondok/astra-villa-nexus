
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
    public.properties.state AS province,
    COUNT(*) AS property_count
  FROM public.properties
  WHERE public.properties.status = 'active'
    AND public.properties.approval_status = 'approved'
    AND public.properties.state IS NOT NULL
    AND public.properties.state != ''
  GROUP BY public.properties.state
  ORDER BY property_count DESC;
$$;
