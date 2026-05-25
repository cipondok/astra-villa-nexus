-- Restore legacy columns that the app still references.
-- All are nullable so existing rows remain valid.

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS property_type text,
  ADD COLUMN IF NOT EXISTS location      text,
  ADD COLUMN IF NOT EXISTS owner_id      uuid,
  ADD COLUMN IF NOT EXISTS price         numeric,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS area_sqm      numeric;

-- Backfill from canonical columns where empty.
UPDATE public.properties
   SET price         = COALESCE(price, price_idr),
       thumbnail_url = COALESCE(thumbnail_url, cover_image),
       area_sqm      = COALESCE(area_sqm, building_sqm),
       location      = COALESCE(location, city);

-- Keep legacy mirrors in sync going forward.
CREATE OR REPLACE FUNCTION public.properties_sync_legacy_cols()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.price IS NULL THEN
    NEW.price := NEW.price_idr;
  END IF;
  IF NEW.thumbnail_url IS NULL THEN
    NEW.thumbnail_url := NEW.cover_image;
  END IF;
  IF NEW.area_sqm IS NULL THEN
    NEW.area_sqm := NEW.building_sqm;
  END IF;
  IF NEW.location IS NULL THEN
    NEW.location := NEW.city;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_properties_sync_legacy ON public.properties;
CREATE TRIGGER trg_properties_sync_legacy
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.properties_sync_legacy_cols();