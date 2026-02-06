-- Add company registration number field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_registration_number text,
ADD COLUMN IF NOT EXISTS company_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS company_verified_at timestamp with time zone;