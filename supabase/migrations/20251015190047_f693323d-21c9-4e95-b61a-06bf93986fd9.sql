-- Fix Missing RLS Policies for Tables with RLS Enabled but No Policies
-- This addresses CRITICAL security issue: tables are completely inaccessible

-- 1. vendor_membership_progress - Vendors can view their own progress, admins can view all
CREATE POLICY "Vendors can view own membership progress"
ON vendor_membership_progress
FOR SELECT
USING (vendor_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage vendor membership progress"
ON vendor_membership_progress
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 2. api_settings - Super admin only (highly sensitive)
CREATE POLICY "Super admin full access to api_settings"
ON api_settings
FOR ALL
USING (check_super_admin_email());

-- 3. indonesian_rejection_codes - Public read, admin manage
CREATE POLICY "Public can view rejection codes"
ON indonesian_rejection_codes
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin can manage rejection codes"
ON indonesian_rejection_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 4. indonesian_validation_rules - Admin only (sensitive business logic)
CREATE POLICY "Admin can manage validation rules"
ON indonesian_validation_rules
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 5. bpjs_verification_logs - Super admin only (contains PII)
CREATE POLICY "Super admin can view BPJS logs"
ON bpjs_verification_logs
FOR SELECT
USING (check_super_admin_email());

CREATE POLICY "System can insert BPJS logs"
ON bpjs_verification_logs
FOR INSERT
WITH CHECK (true);

-- 6. vendor_access_permissions - Vendors view own, admin manages
CREATE POLICY "Vendors can view own access permissions"
ON vendor_access_permissions
FOR SELECT
USING (vendor_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage vendor access permissions"
ON vendor_access_permissions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 7. admin_users - Super admin only
CREATE POLICY "Super admin can manage admin users"
ON admin_users
FOR ALL
USING (check_super_admin_email());

-- 8. vendor_performance_analytics - Vendors view own, admin views all
CREATE POLICY "Vendors can view own performance analytics"
ON vendor_performance_analytics
FOR SELECT
USING (vendor_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert performance analytics"
ON vendor_performance_analytics
FOR INSERT
WITH CHECK (true);

-- 9. user_verification - Users view own, admin manages
CREATE POLICY "Users can view own verification status"
ON user_verification
FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage user verification"
ON user_verification
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 10. service_pricing_rules - Admin only (sensitive business logic)
CREATE POLICY "Admin can manage service pricing rules"
ON service_pricing_rules
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Vendors can view pricing rules"
ON service_pricing_rules
FOR SELECT
USING (is_active = true);

-- 11. bpjs_verifications - Vendors view own, admin manages
CREATE POLICY "Vendors can view own BPJS verifications"
ON bpjs_verifications
FOR SELECT
USING (vendor_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage BPJS verifications"
ON bpjs_verifications
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 12. property_categories - Public read, admin manage
CREATE POLICY "Public can view active property categories"
ON property_categories
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin can manage property categories"
ON property_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Tighten Financial Data Exposure (payout_settings, payout_transactions, vendor_astra_balances)
-- Note: These tables may already have policies, so we'll drop and recreate to ensure strictness

-- Drop existing permissive policies on financial tables if they exist
DROP POLICY IF EXISTS "Users can view own payout settings" ON payout_settings;
DROP POLICY IF EXISTS "Users can view own transactions" ON payout_transactions;
DROP POLICY IF EXISTS "Vendors view own balance" ON vendor_astra_balances;

-- Recreate strict policies for payout_settings
CREATE POLICY "Users can view ONLY own payout settings"
ON payout_settings
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update ONLY own payout settings"
ON payout_settings
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all payout settings"
ON payout_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Recreate strict policies for payout_transactions
CREATE POLICY "Users can view ONLY own payout transactions"
ON payout_transactions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admin can view all payout transactions"
ON payout_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Recreate strict policies for vendor_astra_balances
CREATE POLICY "Vendors can view ONLY own balance"
ON vendor_astra_balances
FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "Admin can view all vendor balances"
ON vendor_astra_balances
FOR SELECT
USING (has_role(auth.uid(), 'admin'));