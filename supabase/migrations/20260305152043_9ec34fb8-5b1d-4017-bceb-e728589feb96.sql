
CREATE OR REPLACE FUNCTION public.calculate_days_on_market()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.sold_at IS NOT NULL AND NEW.listed_at IS NOT NULL THEN
    NEW.days_on_market := GREATEST(1, EXTRACT(DAY FROM (NEW.sold_at - NEW.listed_at))::integer);
  END IF;
  IF TG_OP = 'INSERT' AND NEW.listed_at IS NULL THEN
    NEW.listed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_calculate_days_on_market ON public.properties;
CREATE TRIGGER trg_calculate_days_on_market
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.calculate_days_on_market();
