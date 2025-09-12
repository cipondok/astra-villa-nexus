-- Add new detailed address columns to vendor_business_profiles table
ALTER TABLE public.vendor_business_profiles
ADD COLUMN IF NOT EXISTS building_name TEXT,
ADD COLUMN IF NOT EXISTS floor_unit TEXT,
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS business_type_location TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS gps_coordinates TEXT,
ADD COLUMN IF NOT EXISTS gps_address TEXT;

COMMENT ON COLUMN public.vendor_business_profiles.building_name IS 'Name of building or complex where business is located';
COMMENT ON COLUMN public.vendor_business_profiles.floor_unit IS 'Floor and unit number (e.g., 3rd Floor Unit 301)';
COMMENT ON COLUMN public.vendor_business_profiles.street_address IS 'Street address (e.g., Jl. Sudirman No. 123)';
COMMENT ON COLUMN public.vendor_business_profiles.business_type_location IS 'Type of business location (office, shop, warehouse, etc.)';
COMMENT ON COLUMN public.vendor_business_profiles.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN public.vendor_business_profiles.landmark IS 'Nearby landmarks or additional location notes';
COMMENT ON COLUMN public.vendor_business_profiles.gps_coordinates IS 'GPS coordinates for service area mapping';
COMMENT ON COLUMN public.vendor_business_profiles.gps_address IS 'Reverse geocoded address from GPS coordinates';