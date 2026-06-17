
-- Add REOS profile fields for premium registration flow
DO $$ BEGIN
  CREATE TYPE public.profile_type AS ENUM ('buyer','investor','developer','owner','agent','vendor','lawyer','consultant');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS profile_type public.profile_type,
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;
