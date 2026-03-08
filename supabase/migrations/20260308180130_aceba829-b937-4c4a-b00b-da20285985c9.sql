
CREATE OR REPLACE FUNCTION public.get_weak_seo_properties(
  p_threshold integer DEFAULT 60,
  p_limit integer DEFAULT 10,
  p_state text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_area text DEFAULT NULL
)
RETURNS TABLE (
  property_id uuid,
  seo_score integer,
  title text,
  description text,
  property_type text,
  listing_type text,
  location text,
  city text,
  state text,
  bedrooms integer,
  bathrooms integer,
  price numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    psa.property_id,
    psa.seo_score::integer,
    p.title,
    p.description,
    p.property_type,
    p.listing_type,
    p.location,
    p.city,
    p.state,
    p.bedrooms,
    p.bathrooms,
    p.price
  FROM property_seo_analysis psa
  INNER JOIN properties p ON p.id = psa.property_id
  WHERE psa.seo_score < p_threshold
    AND (p_state IS NULL OR p.state = p_state)
    AND (p_city IS NULL OR p.city = p_city)
    AND (p_area IS NULL OR p.location ILIKE '%' || p_area || '%')
  ORDER BY psa.seo_score ASC
  LIMIT p_limit;
$$;
