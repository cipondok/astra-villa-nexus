-- Update default from NULL to 0
ALTER TABLE public.properties ALTER COLUMN investment_score SET DEFAULT 0;

-- Use a validation trigger instead of CHECK constraint (Supabase best practice)
CREATE OR REPLACE FUNCTION public.validate_investment_score()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.investment_score IS NOT NULL AND (NEW.investment_score < 0 OR NEW.investment_score > 100) THEN
    RAISE EXCEPTION 'investment_score must be between 0 and 100, got %', NEW.investment_score;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_investment_score ON public.properties;
CREATE TRIGGER trg_validate_investment_score
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_investment_score();