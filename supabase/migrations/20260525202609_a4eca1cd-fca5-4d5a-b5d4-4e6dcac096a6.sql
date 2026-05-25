ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS state                  text,
  ADD COLUMN IF NOT EXISTS area                   text,
  ADD COLUMN IF NOT EXISTS days_on_market         numeric,
  ADD COLUMN IF NOT EXISTS predicted_days_to_sell numeric,
  ADD COLUMN IF NOT EXISTS image_urls             text[],
  ADD COLUMN IF NOT EXISTS construction_phase     text,
  ADD COLUMN IF NOT EXISTS development_status     text,
  ADD COLUMN IF NOT EXISTS owner_type             text,
  ADD COLUMN IF NOT EXISTS approval_status        text,
  ADD COLUMN IF NOT EXISTS three_d_model_url      text,
  ADD COLUMN IF NOT EXISTS virtual_tour_url       text;

UPDATE public.properties
   SET image_urls = COALESCE(image_urls, images);

-- Extend the legacy-sync trigger to cover the new mirror columns.
CREATE OR REPLACE FUNCTION public.properties_sync_legacy_cols()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.price IS NULL THEN NEW.price := NEW.price_idr; END IF;
  IF NEW.thumbnail_url IS NULL THEN NEW.thumbnail_url := NEW.cover_image; END IF;
  IF NEW.area_sqm IS NULL THEN NEW.area_sqm := NEW.building_sqm; END IF;
  IF NEW.location IS NULL THEN NEW.location := NEW.city; END IF;
  IF NEW.image_urls IS NULL THEN NEW.image_urls := NEW.images; END IF;
  RETURN NEW;
END;
$$;