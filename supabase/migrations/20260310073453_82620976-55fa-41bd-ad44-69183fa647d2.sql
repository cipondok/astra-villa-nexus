CREATE OR REPLACE FUNCTION public.get_image_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_properties', (SELECT COUNT(*)::int FROM properties),
    'with_images', (SELECT COUNT(*)::int FROM properties WHERE images IS NOT NULL AND array_length(images, 1) > 0),
    'no_images', (SELECT COUNT(*)::int FROM properties WHERE images IS NULL OR array_length(images, 1) IS NULL OR array_length(images, 1) = 0),
    'total_images', (SELECT COALESCE(SUM(array_length(images, 1)), 0)::int FROM properties WHERE images IS NOT NULL)
  );
$$;