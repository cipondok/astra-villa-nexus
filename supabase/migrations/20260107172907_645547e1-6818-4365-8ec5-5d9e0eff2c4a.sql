
-- STEP 4: Final policy fixes with correct column names

-- 3. filter_analytics - use date-based validation
DROP POLICY IF EXISTS "Authenticated can insert filter analytics" ON public.filter_analytics;
CREATE POLICY "Authenticated can insert filter analytics with date"
ON public.filter_analytics FOR INSERT TO authenticated
WITH CHECK (date IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can update filter analytics" ON public.filter_analytics;
CREATE POLICY "Authenticated can update filter analytics with date"
ON public.filter_analytics FOR UPDATE TO authenticated
USING (date IS NOT NULL) WITH CHECK (date IS NOT NULL);

-- 4. inquiries - uses contact_email and contact_phone
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;
CREATE POLICY "Public can create inquiries with contact info"
ON public.inquiries FOR INSERT TO anon, authenticated
WITH CHECK (contact_email IS NOT NULL OR contact_phone IS NOT NULL);

-- 5. search_analytics
DROP POLICY IF EXISTS "Authenticated can insert search analytics" ON public.search_analytics;
CREATE POLICY "Authenticated with context can insert search analytics"
ON public.search_analytics FOR INSERT TO authenticated
WITH CHECK (session_id IS NOT NULL OR user_id IS NOT NULL OR visitor_id IS NOT NULL);

-- 6. share_analytics
DROP POLICY IF EXISTS "Authenticated can insert share analytics" ON public.share_analytics;
CREATE POLICY "Authenticated with share context can insert share analytics"
ON public.share_analytics FOR INSERT TO authenticated
WITH CHECK (share_id IS NOT NULL);

-- 7. ticket_activities
DROP POLICY IF EXISTS "Authenticated can insert ticket activities" ON public.ticket_activities;
CREATE POLICY "Authenticated can insert their ticket activities"
ON public.ticket_activities FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by OR public.is_admin_secure(auth.uid()));

-- 8. validation_logs
DROP POLICY IF EXISTS "Authenticated can insert validation logs" ON public.validation_logs;
CREATE POLICY "Authenticated with context can insert validation logs"
ON public.validation_logs FOR INSERT TO authenticated
WITH CHECK (application_id IS NOT NULL);

-- 9. web_analytics
DROP POLICY IF EXISTS "Authenticated can insert web analytics" ON public.web_analytics;
CREATE POLICY "Authenticated with session can insert web analytics"
ON public.web_analytics FOR INSERT TO authenticated
WITH CHECK (session_id IS NOT NULL OR visitor_id IS NOT NULL);

-- Fix update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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
