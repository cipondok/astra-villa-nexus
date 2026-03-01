
-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.trigger_investment_score_recalc()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
  _service_key text;
BEGIN
  -- Only proceed if relevant fields changed
  IF
    OLD.price IS DISTINCT FROM NEW.price OR
    OLD.city IS DISTINCT FROM NEW.city OR
    OLD.has_pool IS DISTINCT FROM NEW.has_pool OR
    OLD.garage_count IS DISTINCT FROM NEW.garage_count OR
    OLD.floors IS DISTINCT FROM NEW.floors OR
    OLD.building_area_sqm IS DISTINCT FROM NEW.building_area_sqm OR
    OLD.land_area_sqm IS DISTINCT FROM NEW.land_area_sqm
  THEN
    -- Build the edge function URL
    SELECT decrypted_secret INTO _service_key
      FROM vault.decrypted_secrets
      WHERE name = 'service_role_key'
      LIMIT 1;

    _url := 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/investment-score-engine';

    -- Non-blocking HTTP POST via pg_net
    PERFORM extensions.http_post(
      url := _url,
      body := jsonb_build_object('property_id', NEW.id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(_service_key, current_setting('supabase.service_role_key', true))
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS trg_recalc_investment_score ON public.properties;
CREATE TRIGGER trg_recalc_investment_score
  AFTER UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_investment_score_recalc();
