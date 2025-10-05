-- Fix Security Definer View linter warning
-- Recreate public_properties view with explicit SECURITY INVOKER

DROP VIEW IF EXISTS public.public_properties CASCADE;

CREATE VIEW public.public_properties 
WITH (security_invoker = true) AS
SELECT 
  id, title, description, price, property_type, listing_type,
  location, city, area, state, bedrooms, bathrooms, area_sqm,
  images, image_urls, status, created_at, updated_at,
  property_features, development_status, seo_title, seo_description,
  thumbnail_url, three_d_model_url, virtual_tour_url,
  rental_periods, minimum_rental_days, online_booking_enabled,
  booking_type, advance_booking_days, rental_terms,
  available_from, available_until
FROM properties
WHERE status = 'available' AND approval_status = 'approved';

-- Grant appropriate access to the view
GRANT SELECT ON public.public_properties TO authenticated;
GRANT SELECT ON public.public_properties TO anon;