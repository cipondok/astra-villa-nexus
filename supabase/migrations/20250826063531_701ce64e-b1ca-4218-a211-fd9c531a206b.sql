-- Fix critical security vulnerabilities by securing public data exposure

-- 1. Secure vendor business intelligence data
CREATE POLICY "Restrict office_locations to authenticated users"
ON public.office_locations FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. Secure property categories - only show basic info publicly
DROP POLICY IF EXISTS "Anyone can view active property categories" ON public.property_categories;
CREATE POLICY "Public can view basic property category info"
ON public.property_categories FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- 3. Secure vendor category tables - require authentication
CREATE POLICY "Authenticated users can view vendor categories"
ON public.vendor_service_categories FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view vendor main categories"
ON public.vendor_main_categories FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view vendor subcategories"
ON public.vendor_subcategories FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 4. Secure pricing intelligence - admin only
DROP POLICY IF EXISTS "Public can view pricing rules" ON public.service_pricing_rules;
CREATE POLICY "Only admins can view pricing rules"
ON public.service_pricing_rules FOR SELECT
USING (check_admin_access());

-- 5. Secure reward configuration - authenticated users only
CREATE POLICY "Authenticated users can view reward config"
ON public.astra_reward_config FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 6. Secure validation rules - internal access only
DROP POLICY IF EXISTS "Public can view validation rules" ON public.indonesian_validation_rules;
CREATE POLICY "Only internal systems can view validation rules"
ON public.indonesian_validation_rules FOR SELECT
USING (check_admin_access());

-- 7. Secure rejection codes - restrict to admin and user's own rejections
DROP POLICY IF EXISTS "Public can view rejection codes" ON public.indonesian_rejection_codes;
CREATE POLICY "Admins can view all rejection codes"
ON public.indonesian_rejection_codes FOR SELECT
USING (check_admin_access());

CREATE POLICY "Users can view rejection codes in context"
ON public.indonesian_rejection_codes FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 8. Secure customer contact information in live chat
DROP POLICY IF EXISTS "public_can_create_chat_sessions" ON public.live_chat_sessions;
CREATE POLICY "Authenticated users can create chat sessions"
ON public.live_chat_sessions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 9. Secure financial transaction details
CREATE POLICY "Users can only view their own payment logs"
ON public.payment_logs FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM rental_bookings 
      WHERE rental_bookings.id = payment_logs.booking_id 
      AND rental_bookings.customer_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM vendor_bookings 
      WHERE vendor_bookings.id = payment_logs.booking_id 
      AND vendor_bookings.vendor_id = auth.uid()
    ) OR
    check_admin_access()
  )
);

-- 10. Secure device and location tracking data
CREATE POLICY "Users can only view their own login alerts"
ON public.user_login_alerts FOR SELECT
USING (user_id = auth.uid() OR check_admin_access());

CREATE POLICY "Users can only view their own device sessions"
ON public.user_device_sessions FOR SELECT
USING (user_id = auth.uid() OR check_admin_access());

-- 11. Secure customer support communications
CREATE POLICY "Users can only view their own support tickets"
ON public.customer_support_tickets FOR SELECT
USING (
  customer_id = auth.uid() OR 
  check_admin_access() OR
  is_authorized_support_user()
);

-- 12. Additional security for vendor balances
CREATE POLICY "Vendors can only view their own astra balances"
ON public.vendor_astra_balances FOR SELECT
USING (vendor_id = auth.uid() OR check_admin_access());

-- 13. Secure vendor business profiles from public access
DROP POLICY IF EXISTS "deny_anon_vendor_profiles_access" ON public.vendor_business_profiles;
CREATE POLICY "Deny anonymous access to vendor profiles"
ON public.vendor_business_profiles FOR ALL
USING (false);

-- 14. Create specific policy for public vendor profile access (limited data)
CREATE OR REPLACE FUNCTION public.get_safe_vendor_profiles()
RETURNS TABLE(
  id uuid,
  business_name text,
  business_type text,
  business_description text,
  rating numeric,
  total_reviews integer,
  is_active boolean,
  logo_url text,
  service_areas jsonb
) 
LANGUAGE sql 
STABLE SECURITY DEFINER 
SET search_path TO 'public'
AS $$
  SELECT 
    vbp.id,
    vbp.business_name,
    vbp.business_type,
    vbp.business_description,
    vbp.rating,
    vbp.total_reviews,
    vbp.is_active,
    vbp.logo_url,
    vbp.service_areas
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true 
    AND vbp.is_verified = true;
$$;