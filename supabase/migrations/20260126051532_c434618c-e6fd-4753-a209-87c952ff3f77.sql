-- =========================================
-- Security Cleanup Migration
-- Fix property_survey_bookings INSERT policy to require authentication
-- Consolidate overlapping policies on financial tables
-- =========================================

-- 1. FIX property_survey_bookings: Require authentication for inserts
DROP POLICY IF EXISTS "allow_survey_bookings_insert" ON public.property_survey_bookings;

CREATE POLICY "authenticated_users_can_create_survey_bookings"
ON public.property_survey_bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Drop redundant policies on payout_transactions to reduce confusion
-- Keep only the essential policies

-- Drop older redundant SELECT policies (keep logged versions)
DROP POLICY IF EXISTS "Users can view ONLY own payout transactions" ON public.payout_transactions;
DROP POLICY IF EXISTS "Users can view their own payout transactions" ON public.payout_transactions;
DROP POLICY IF EXISTS "Users view own transactions" ON public.payout_transactions;
DROP POLICY IF EXISTS "Admin can view all payout transactions" ON public.payout_transactions;
DROP POLICY IF EXISTS "Financial admins view all transactions" ON public.payout_transactions;

-- Drop redundant DELETE/UPDATE policies (false conditions redundant with other policies)
DROP POLICY IF EXISTS "No deletion of financial transactions" ON public.payout_transactions;
DROP POLICY IF EXISTS "Users cannot delete payout transactions" ON public.payout_transactions;
DROP POLICY IF EXISTS "Users cannot update their payout transactions" ON public.payout_transactions;

-- Drop redundant admin policies (keep v2 versions)
DROP POLICY IF EXISTS "Admins can manage all payout transactions" ON public.payout_transactions;
DROP POLICY IF EXISTS "Admins can delete payout transactions" ON public.payout_transactions;
DROP POLICY IF EXISTS "Admins can update payout transactions" ON public.payout_transactions;
DROP POLICY IF EXISTS "Financial admins can update transactions" ON public.payout_transactions;

-- Drop redundant INSERT policies (keep System can create)
DROP POLICY IF EXISTS "Authorized systems can create payout transactions" ON public.payout_transactions;

-- 3. Drop redundant policies on payout_settings 
-- Keep only essential policies per operation

-- Drop older SELECT policies (keep logged versions)
DROP POLICY IF EXISTS "Admin can view all payout settings" ON public.payout_settings;
DROP POLICY IF EXISTS "Users can view ONLY own payout settings" ON public.payout_settings;
DROP POLICY IF EXISTS "Users can update ONLY own payout settings" ON public.payout_settings;

-- 4. Drop redundant policies on rental_bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.rental_bookings;

-- 5. Add explicit block for anonymous access on remaining tables that might be missing it

-- Ensure invoices block anonymous
DROP POLICY IF EXISTS "block_anonymous_invoices_access" ON public.invoices;
CREATE POLICY "block_anonymous_invoices_access"
ON public.invoices
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Ensure rental_bookings block anonymous
DROP POLICY IF EXISTS "block_anonymous_rental_bookings_access" ON public.rental_bookings;
CREATE POLICY "block_anonymous_rental_bookings_access"
ON public.rental_bookings
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Ensure payout_transactions block anonymous
DROP POLICY IF EXISTS "block_anonymous_payout_transactions_access" ON public.payout_transactions;
CREATE POLICY "block_anonymous_payout_transactions_access"
ON public.payout_transactions
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Ensure property_survey_bookings block anonymous SELECT/UPDATE/DELETE
DROP POLICY IF EXISTS "block_anonymous_survey_bookings_access" ON public.property_survey_bookings;
CREATE POLICY "block_anonymous_survey_bookings_access"
ON public.property_survey_bookings
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

CREATE POLICY "block_anonymous_survey_bookings_update"
ON public.property_survey_bookings
AS RESTRICTIVE
FOR UPDATE
TO anon
USING (false);

CREATE POLICY "block_anonymous_survey_bookings_delete"
ON public.property_survey_bookings
AS RESTRICTIVE
FOR DELETE
TO anon
USING (false);

-- 6. Add admin view policy with logging for property_survey_bookings
DROP POLICY IF EXISTS "admins_view_all_survey_bookings_logged" ON public.property_survey_bookings;
CREATE POLICY "admins_view_all_survey_bookings_logged"
ON public.property_survey_bookings
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role) 
  AND log_security_event(
    auth.uid(), 
    'survey_booking_admin_view'::text, 
    inet_client_addr(), 
    NULL::text, 
    NULL::text, 
    jsonb_build_object('accessed_at', now()), 
    50
  ) IS NOT NULL
);