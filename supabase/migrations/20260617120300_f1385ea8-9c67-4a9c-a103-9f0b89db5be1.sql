-- Add preferred_theme column to profiles for cross-device ASTRA theme sync
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_theme text
  NOT NULL DEFAULT 'astra-black-gold';

-- Restrict to the two supported ASTRA themes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_preferred_theme_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_preferred_theme_check
      CHECK (preferred_theme IN ('astra-black-gold', 'astra-pearl-white'));
  END IF;
END $$;