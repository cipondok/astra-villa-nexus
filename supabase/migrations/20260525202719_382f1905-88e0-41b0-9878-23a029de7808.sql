ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS agent_id               uuid,
  ADD COLUMN IF NOT EXISTS online_booking_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS minimum_rental_days    integer,
  ADD COLUMN IF NOT EXISTS rental_periods         text[],
  ADD COLUMN IF NOT EXISTS booking_type           text,
  ADD COLUMN IF NOT EXISTS sold_at                timestamptz,
  ADD COLUMN IF NOT EXISTS opportunity_score      numeric,
  ADD COLUMN IF NOT EXISTS investment_score       numeric;

ALTER TABLE public.properties ALTER COLUMN slug DROP NOT NULL;