-- Phase 2 & 3: Complete Security Fixes (Drop existing policies first)

-- PART 1: Secure Vendor Business Profiles  
DROP POLICY IF EXISTS "vendors_select_own_profile" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_insert_own_profile" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_update_own_profile" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_delete_own_profile" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "admins_manage_vendor_profiles" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "block_direct_public_access_to_vendor_profiles" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "Only CS and Admin can unlock main category" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "Vendors can view their main category" ON public.vendor_business_profiles;

CREATE POLICY "vendors_view_own_full_profile_v2"
ON public.vendor_business_profiles FOR SELECT TO authenticated
USING (vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "vendors_create_own_profile_v2"
ON public.vendor_business_profiles FOR INSERT TO authenticated
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "vendors_update_own_profile_v2"
ON public.vendor_business_profiles FOR UPDATE TO authenticated
USING (vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "vendors_delete_own_profile_v2"
ON public.vendor_business_profiles FOR DELETE TO authenticated
USING (vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- PART 2: Secure Financial Data
DROP POLICY IF EXISTS "Users can only view their own payment logs" ON public.payout_transactions;
DROP POLICY IF EXISTS "Users can view their own payment logs" ON public.payout_transactions;
DROP POLICY IF EXISTS "Admins can manage all payment logs" ON public.payout_transactions;
DROP POLICY IF EXISTS "System can manage payment logs" ON public.payout_transactions;

CREATE POLICY "users_view_own_payouts_logged_v2"
ON public.payout_transactions FOR SELECT TO authenticated
USING (user_id = auth.uid() AND (SELECT log_financial_access('payout_transactions', 'SELECT_OWN')) IS NOT NULL);

CREATE POLICY "admins_view_all_payouts_logged_v2"
ON public.payout_transactions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND (SELECT log_financial_access('payout_transactions', 'SELECT_ADMIN')) IS NOT NULL);

CREATE POLICY "only_admins_modify_payouts_v2"
ON public.payout_transactions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PART 3: Protect Property Owner Data
DROP VIEW IF EXISTS public.public_properties CASCADE;

CREATE VIEW public.public_properties AS
SELECT 
  id, title, description, price, property_type, listing_type,
  location, city, area, state, bedrooms, bathrooms, area_sqm,
  images, image_urls, status, created_at, updated_at,
  property_features, development_status, seo_title, seo_description,
  thumbnail_url, three_d_model_url, virtual_tour_url,
  rental_periods, minimum_rental_days, online_booking_enabled,
  booking_type, advance_booking_days, rental_terms,
  available_from, available_until
FROM public.properties
WHERE status = 'available' AND (approval_status = 'approved' OR approval_status IS NULL);

GRANT SELECT ON public.public_properties TO authenticated, anon;

-- Drop ALL existing properties policies
DROP POLICY IF EXISTS "Public can view available properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;
DROP POLICY IF EXISTS "Properties viewable by everyone" ON public.properties;
DROP POLICY IF EXISTS "only_owners_view_full_property" ON public.properties;
DROP POLICY IF EXISTS "owners_manage_own_properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can manage their properties" ON public.properties;
DROP POLICY IF EXISTS "Agents can manage their properties" ON public.properties;

CREATE POLICY "owners_view_full_property_details"
ON public.properties FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR agent_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owners_manage_properties"
ON public.properties FOR ALL TO authenticated
USING (owner_id = auth.uid() OR agent_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (owner_id = auth.uid() OR agent_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- PART 4: Secure GPS Locations
DROP POLICY IF EXISTS "public_select_active_locations" ON public.locations;
DROP POLICY IF EXISTS "admins_manage_locations" ON public.locations;

CREATE POLICY "only_admins_view_locations_v2"
ON public.locations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "only_admins_manage_locations_v2"
ON public.locations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));