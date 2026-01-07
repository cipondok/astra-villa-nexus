
-- STEP 3: Fix remaining overly permissive policies
-- Group 1: System logging tables - restrict to authenticated and add user context where possible

-- admin_alerts - restrict to admin role
DROP POLICY IF EXISTS "Allow trigger inserts for admin alerts" ON public.admin_alerts;
CREATE POLICY "Admin and system can insert admin alerts"
ON public.admin_alerts FOR INSERT TO authenticated
WITH CHECK (public.is_admin_secure(auth.uid()) OR auto_generated = true);

-- ai_vendor_suggestions - restrict to authenticated
DROP POLICY IF EXISTS "System can create suggestions" ON public.ai_vendor_suggestions;
CREATE POLICY "Authenticated can create suggestions"
ON public.ai_vendor_suggestions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = vendor_id OR public.is_admin_secure(auth.uid()));

-- astra_reward_claims - users can only claim for themselves
DROP POLICY IF EXISTS "System can create claims" ON public.astra_reward_claims;
CREATE POLICY "Users can create their own claims"
ON public.astra_reward_claims FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- bpjs_verification_logs - restrict to authenticated vendors
DROP POLICY IF EXISTS "System can insert BPJS logs" ON public.bpjs_verification_logs;
CREATE POLICY "Authenticated vendors can insert BPJS logs"
ON public.bpjs_verification_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = vendor_id::uuid OR public.is_admin_secure(auth.uid()));

-- customer_support_tickets - allow public for contact but require email
-- Keep permissive as this is a public contact form

-- error_logs - restrict to authenticated for security
DROP POLICY IF EXISTS "System can insert error logs" ON public.error_logs;
CREATE POLICY "Authenticated users can log errors"
ON public.error_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- feedback_monitoring - keep permissive for public feedback (intentional)

-- filter_analytics, filter_sequences, filter_usage - analytics tracking, keep permissive but restrict to authenticated
DROP POLICY IF EXISTS "Allow insert for all users on analytics" ON public.filter_analytics;
CREATE POLICY "Authenticated can insert filter analytics"
ON public.filter_analytics FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for all users on sequences" ON public.filter_sequences;
CREATE POLICY "Authenticated can insert filter sequences"
ON public.filter_sequences FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Allow insert for all users" ON public.filter_usage;
CREATE POLICY "Authenticated can insert filter usage"
ON public.filter_usage FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- inquiries - keep permissive for public contact forms (intentional)

-- live_chat_participants - users can only add themselves
DROP POLICY IF EXISTS "Anyone can create chat participants" ON public.live_chat_participants;
CREATE POLICY "Users can add themselves as chat participants"
ON public.live_chat_participants FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- load_test_results - admin only
DROP POLICY IF EXISTS "System can insert load test results" ON public.load_test_results;
CREATE POLICY "Admin can insert load test results"
ON public.load_test_results FOR INSERT TO authenticated
WITH CHECK (public.is_admin_secure(auth.uid()));

-- otp_codes - system generated, restrict to authenticated
DROP POLICY IF EXISTS "System can insert OTP codes" ON public.otp_codes;
CREATE POLICY "Authenticated users can generate OTP"
ON public.otp_codes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- search_analytics - authenticated analytics
DROP POLICY IF EXISTS "Admin can insert search analytics" ON public.search_analytics;
CREATE POLICY "Authenticated can insert search analytics"
ON public.search_analytics FOR INSERT TO authenticated
WITH CHECK (true);

-- security_alerts - admin only
DROP POLICY IF EXISTS "System can insert security alerts" ON public.security_alerts;
CREATE POLICY "Admin can insert security alerts"
ON public.security_alerts FOR INSERT TO authenticated
WITH CHECK (public.is_admin_secure(auth.uid()));

-- share_analytics - authenticated only
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.share_analytics;
CREATE POLICY "Authenticated can insert share analytics"
ON public.share_analytics FOR INSERT TO authenticated
WITH CHECK (true);

-- ticket_activities - authenticated only
DROP POLICY IF EXISTS "system_insert_ticket_activities" ON public.ticket_activities;
CREATE POLICY "Authenticated can insert ticket activities"
ON public.ticket_activities FOR INSERT TO authenticated
WITH CHECK (true);

-- user_devices - users can only add their own devices
DROP POLICY IF EXISTS "system_insert_devices" ON public.user_devices;
CREATE POLICY "Users can insert their own devices"
ON public.user_devices FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- user_login_alerts - users only for themselves
DROP POLICY IF EXISTS "system_insert_login_alerts" ON public.user_login_alerts;
CREATE POLICY "Users can insert their own login alerts"
ON public.user_login_alerts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- user_sessions - users only for themselves
DROP POLICY IF EXISTS "System can insert sessions" ON public.user_sessions;
CREATE POLICY "Users can insert their own sessions"
ON public.user_sessions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- validation_logs - authenticated only
DROP POLICY IF EXISTS "System can insert validation logs" ON public.validation_logs;
CREATE POLICY "Authenticated can insert validation logs"
ON public.validation_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- vendor_performance_analytics - vendors and admins
DROP POLICY IF EXISTS "System can insert performance analytics" ON public.vendor_performance_analytics;
CREATE POLICY "Vendors can insert their performance analytics"
ON public.vendor_performance_analytics FOR INSERT TO authenticated
WITH CHECK (auth.uid() = vendor_id OR public.is_admin_secure(auth.uid()));

-- web_analytics - authenticated only
DROP POLICY IF EXISTS "Admin can insert web analytics" ON public.web_analytics;
CREATE POLICY "Authenticated can insert web analytics"
ON public.web_analytics FOR INSERT TO authenticated
WITH CHECK (true);
