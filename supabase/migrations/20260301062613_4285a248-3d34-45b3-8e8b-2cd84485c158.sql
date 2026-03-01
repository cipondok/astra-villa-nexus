-- Fix 1: Recreate views with security_invoker=on

-- public_profiles
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker=on) AS
SELECT id, full_name, avatar_url, verification_status, user_level_id
FROM profiles;

-- public_properties  
DROP VIEW IF EXISTS public.public_properties;
CREATE VIEW public.public_properties
WITH (security_invoker=on) AS
SELECT id, title, description, price, property_type, listing_type, location, city, area, state,
  bedrooms, bathrooms, area_sqm, images, image_urls, status, created_at, updated_at,
  property_features, development_status, seo_title, seo_description, thumbnail_url,
  three_d_model_url, virtual_tour_url, rental_periods, minimum_rental_days,
  online_booking_enabled, booking_type, advance_booking_days, rental_terms,
  available_from, available_until
FROM properties
WHERE status = 'available' AND approval_status = 'approved';

-- ai_reaction_analytics
DROP VIEW IF EXISTS public.ai_reaction_analytics;
CREATE VIEW public.ai_reaction_analytics
WITH (security_invoker=on) AS
SELECT date_trunc('day', created_at) AS date,
  reaction_type,
  count(*) AS reaction_count,
  count(DISTINCT user_id) AS unique_users,
  count(DISTINCT conversation_id) AS unique_conversations
FROM ai_message_reactions
GROUP BY date_trunc('day', created_at), reaction_type
ORDER BY date_trunc('day', created_at) DESC;

-- bpjs_verifications_safe
DROP VIEW IF EXISTS public.bpjs_verifications_safe;
CREATE VIEW public.bpjs_verifications_safe
WITH (security_invoker=on) AS
SELECT id, vendor_id, bpjs_type, verification_status, is_valid, expires_at, verified_at,
  created_at, updated_at,
  CASE WHEN verification_response IS NOT NULL 
    THEN jsonb_build_object(
      'status', verification_response->>'status',
      'verified', verification_response->>'verified',
      'expiry_date', verification_response->>'expiry_date')
    ELSE NULL::jsonb
  END AS verification_summary
FROM bpjs_verifications;

-- transaction_summary
DROP VIEW IF EXISTS public.transaction_summary;
CREATE VIEW public.transaction_summary
WITH (security_invoker=on) AS
SELECT date_trunc('day', created_at) AS date,
  transaction_type,
  count(*) AS total_transactions,
  count(*) FILTER (WHERE status = 'completed') AS completed,
  count(*) FILTER (WHERE status = 'pending') AS pending,
  count(*) FILTER (WHERE status = 'cancelled') AS cancelled,
  sum(base_amount) AS total_base_amount,
  sum(total_tax) AS total_tax_collected,
  sum(service_charges) AS total_service_charges,
  sum(total_amount) AS total_revenue
FROM unified_transactions
GROUP BY date_trunc('day', created_at), transaction_type;

-- Fix 2: Tighten overly permissive INSERT policies
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.in_app_notifications;
CREATE POLICY "Authenticated users insert own notifications"
ON public.in_app_notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert alerts" ON public.property_alerts;
CREATE POLICY "Authenticated users insert own alerts"
ON public.property_alerts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix 3: Set search_path on function missing it
CREATE OR REPLACE FUNCTION public.update_maintenance_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;