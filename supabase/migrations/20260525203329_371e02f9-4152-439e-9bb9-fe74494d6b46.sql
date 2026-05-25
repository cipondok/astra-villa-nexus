
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS floors integer,
  ADD COLUMN IF NOT EXISTS market_heat_score numeric,
  ADD COLUMN IF NOT EXISTS risk_level text;

UPDATE public.properties SET is_featured = COALESCE(is_featured, featured, false);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'property_bookings_property_id_fkey'
  ) THEN
    ALTER TABLE public.property_bookings
      ADD CONSTRAINT property_bookings_property_id_fkey
      FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE NOT VALID;
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.properties_sync_extra_legacy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.listed_at IS NULL THEN NEW.listed_at := NEW.created_at; END IF;
  IF NEW.land_area_sqm IS NULL THEN NEW.land_area_sqm := NEW.land_sqm; END IF;
  IF NEW.building_area_sqm IS NULL THEN NEW.building_area_sqm := NEW.building_sqm; END IF;
  IF NEW.is_featured IS NULL THEN NEW.is_featured := COALESCE(NEW.featured, false); END IF;
  RETURN NEW;
END;
$$;
