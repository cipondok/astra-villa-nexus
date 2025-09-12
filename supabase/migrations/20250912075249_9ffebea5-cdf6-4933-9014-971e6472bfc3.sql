-- Add location and logo fields to vendor_business_profiles table
ALTER TABLE public.vendor_business_profiles 
ADD COLUMN IF NOT EXISTS business_state text,
ADD COLUMN IF NOT EXISTS business_city text,
ADD COLUMN IF NOT EXISTS business_area text;