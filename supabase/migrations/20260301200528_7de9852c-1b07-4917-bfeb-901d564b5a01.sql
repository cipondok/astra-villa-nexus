CREATE OR REPLACE FUNCTION public.validate_investment_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.investment_score IS NOT NULL AND (NEW.investment_score < 0 OR NEW.investment_score > 100) THEN
    RAISE EXCEPTION 'investment_score must be between 0 and 100, got %', NEW.investment_score;
  END IF;
  RETURN NEW;
END;
$$;