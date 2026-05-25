
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS rental_yield numeric,
  ADD COLUMN IF NOT EXISTS rental_yield_percentage numeric,
  ADD COLUMN IF NOT EXISTS building_area_sqm numeric,
  ADD COLUMN IF NOT EXISTS wna_eligible boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS property_features jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS liquidity_score numeric,
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saves_count integer DEFAULT 0;

UPDATE public.properties
  SET building_area_sqm = COALESCE(building_area_sqm, building_sqm);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'favorites_property_id_fkey'
  ) THEN
    ALTER TABLE public.favorites
      ADD CONSTRAINT favorites_property_id_fkey
      FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE NOT VALID;
  END IF;
END$$;

-- Extend sync trigger
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
  RETURN NEW;
END;
$$;
