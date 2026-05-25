
-- Restore missing legacy columns referenced by app code
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS listed_at timestamptz,
  ADD COLUMN IF NOT EXISTS ai_estimated_price numeric,
  ADD COLUMN IF NOT EXISTS demand_score numeric,
  ADD COLUMN IF NOT EXISTS demand_heat_score numeric,
  ADD COLUMN IF NOT EXISTS has_pool boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS land_area_sqm numeric;

-- Mirror values from canonical columns where available
UPDATE public.properties
  SET listed_at = COALESCE(listed_at, created_at),
      land_area_sqm = COALESCE(land_area_sqm, land_sqm);

-- Add FK so PostgREST exposes in_app_notifications.property embed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'in_app_notifications_property_id_fkey'
  ) THEN
    ALTER TABLE public.in_app_notifications
      ADD CONSTRAINT in_app_notifications_property_id_fkey
      FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL NOT VALID;
  END IF;
END$$;

-- Create public_properties view used by tour planner
CREATE OR REPLACE VIEW public.public_properties
WITH (security_invoker = true) AS
SELECT
  id, title, description, property_type, listing_type, status,
  price, price_idr, city, state, address, location, area, area_sqm,
  land_sqm, building_sqm, bedrooms, bathrooms, cover_image, thumbnail_url,
  images, image_urls, featured, slug, created_at, updated_at, listed_at,
  demand_score, demand_heat_score, ai_estimated_price, has_pool,
  land_area_sqm, investment_score, opportunity_score, days_on_market,
  predicted_days_to_sell, owner_id, agent_id
FROM public.properties
WHERE status IN ('active','available','for_sale','for_rent','published');

GRANT SELECT ON public.public_properties TO anon, authenticated;

-- Trigger to keep new mirrored columns in sync on insert/update
CREATE OR REPLACE FUNCTION public.properties_sync_extra_legacy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.listed_at IS NULL THEN NEW.listed_at := NEW.created_at; END IF;
  IF NEW.land_area_sqm IS NULL THEN NEW.land_area_sqm := NEW.land_sqm; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS properties_sync_extra_legacy_trg ON public.properties;
CREATE TRIGGER properties_sync_extra_legacy_trg
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.properties_sync_extra_legacy();
