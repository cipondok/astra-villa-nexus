
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS listed_at timestamptz,
  ADD COLUMN IF NOT EXISTS sold_at timestamptz,
  ADD COLUMN IF NOT EXISTS days_on_market integer;
