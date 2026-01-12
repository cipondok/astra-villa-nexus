-- 1) Delete true duplicate rows (same codes + names + postal + area_name)
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY
        province_code,
        province_name,
        city_code,
        city_name,
        city_type,
        COALESCE(district_code, ''),
        COALESCE(district_name, ''),
        COALESCE(subdistrict_code, ''),
        COALESCE(subdistrict_name, ''),
        COALESCE(postal_code, ''),
        COALESCE(area_name, '')
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.locations
)
DELETE FROM public.locations l
USING ranked r
WHERE l.id = r.id
  AND r.rn > 1;

-- 2) Prevent future duplicates (same tuple as above)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'locations'
      AND indexname = 'locations_no_true_duplicates_uidx'
  ) THEN
    EXECUTE $q$
      CREATE UNIQUE INDEX locations_no_true_duplicates_uidx
      ON public.locations (
        province_code,
        province_name,
        city_code,
        city_name,
        city_type,
        COALESCE(district_code, ''),
        COALESCE(district_name, ''),
        COALESCE(subdistrict_code, ''),
        COALESCE(subdistrict_name, ''),
        COALESCE(postal_code, ''),
        COALESCE(area_name, '')
      );
    $q$;
  END IF;
END $$;