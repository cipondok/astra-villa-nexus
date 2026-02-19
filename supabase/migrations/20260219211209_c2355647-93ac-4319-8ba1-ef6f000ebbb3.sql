
-- ============================================================
-- SECURITY FIX: Step 1 - Database Security Hardening
-- ============================================================

-- ----------------------------------------------------------------
-- FIX 1: Add SET search_path = public to all functions missing it
-- Prevents search_path injection attacks
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_property_counts_by_province()
 RETURNS TABLE(province text, property_type text, count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    COALESCE(p.state, 'Unknown') as province,
    COALESCE(p.property_type, 'other') as property_type,
    COUNT(*)::bigint as count
  FROM properties p
  WHERE p.status = 'active'
  GROUP BY p.state, p.property_type
  ORDER BY province, property_type;
$function$;

CREATE OR REPLACE FUNCTION public.get_property_views_by_location(days_back integer DEFAULT 30)
 RETURNS TABLE(page_path text, country text, city text, view_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    wa.page_path,
    COALESCE(wa.country, 'Unknown') as country,
    COALESCE(wa.city, 'Unknown') as city,
    COUNT(*)::bigint as view_count
  FROM web_analytics wa
  WHERE wa.created_at >= NOW() - (days_back || ' days')::interval
    AND wa.page_path LIKE '/property%'
  GROUP BY wa.page_path, wa.country, wa.city
  ORDER BY view_count DESC
  LIMIT 100;
$function$;

CREATE OR REPLACE FUNCTION public.get_search_keyword_analytics(days_back integer DEFAULT 30)
 RETURNS TABLE(search_query text, search_count bigint, avg_results numeric, last_searched timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    sa.search_query,
    COUNT(*)::bigint as search_count,
    ROUND(AVG(sa.results_count)::numeric, 1) as avg_results,
    MAX(sa.created_at) as last_searched
  FROM search_analytics sa
  WHERE sa.created_at >= NOW() - (days_back || ' days')::interval
    AND sa.search_query IS NOT NULL
    AND sa.search_query != ''
  GROUP BY sa.search_query
  ORDER BY search_count DESC
  LIMIT 100;
$function$;

CREATE OR REPLACE FUNCTION public.get_visitor_location_analytics(days_back integer DEFAULT 30)
 RETURNS TABLE(country text, city text, visitor_count bigint, page_views bigint, avg_duration numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    COALESCE(wa.country, 'Unknown') as country,
    COALESCE(wa.city, 'Unknown') as city,
    COUNT(DISTINCT wa.visitor_id)::bigint as visitor_count,
    COUNT(*)::bigint as page_views,
    ROUND(AVG(wa.visit_duration)::numeric, 1) as avg_duration
  FROM web_analytics wa
  WHERE wa.created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY wa.country, wa.city
  ORDER BY visitor_count DESC
  LIMIT 100;
$function$;

CREATE OR REPLACE FUNCTION public.update_cloudflare_settings_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_event_attendee_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.media_events 
    SET current_attendees = current_attendees + 1, updated_at = now()
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.media_events 
    SET current_attendees = current_attendees - 1, updated_at = now()
    WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_newsletter_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.media_analytics (date, channel, metric_type, metric_value)
  VALUES (CURRENT_DATE, 'newsletter', 'new_subscribers', 1)
  ON CONFLICT (date, channel, metric_type) 
  DO UPDATE SET metric_value = media_analytics.metric_value + 1;
  RETURN NEW;
END;
$function$;


-- ----------------------------------------------------------------
-- FIX 2: Fix overly-permissive RLS policies (USING/WITH CHECK = true)
-- Replace with proper authenticated-user scoped policies
-- ----------------------------------------------------------------

-- customer_support_tickets: restrict INSERT to authenticated users only
DROP POLICY IF EXISTS "Allow secure ticket creation" ON public.customer_support_tickets;
CREATE POLICY "Allow secure ticket creation"
  ON public.customer_support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- feedback_monitoring: restrict INSERT to authenticated users
DROP POLICY IF EXISTS "Allow public feedback submissions" ON public.feedback_monitoring;
CREATE POLICY "Allow public feedback submissions"
  ON public.feedback_monitoring
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- in_app_notifications: service role only for insert (keep existing intent but scope properly)
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.in_app_notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.in_app_notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- innovation_experiments: restrict ALL to admin role only
DROP POLICY IF EXISTS "Experiments managed by authenticated" ON public.innovation_experiments;
CREATE POLICY "Experiments managed by authenticated"
  ON public.innovation_experiments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

-- innovation_feature_metrics: system/admin only
DROP POLICY IF EXISTS "Metrics managed by system" ON public.innovation_feature_metrics;
CREATE POLICY "Metrics managed by system"
  ON public.innovation_feature_metrics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

-- innovation_user_assignments: admin only
DROP POLICY IF EXISTS "System manages assignments" ON public.innovation_user_assignments;
CREATE POLICY "System manages assignments"
  ON public.innovation_user_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

-- innovation_user_feedback: admin can manage all
DROP POLICY IF EXISTS "Admins manage all feedback" ON public.innovation_user_feedback;
CREATE POLICY "Admins manage all feedback"
  ON public.innovation_user_feedback
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

-- media_event_registrations: allow any authenticated user to register
DROP POLICY IF EXISTS "Anyone can register for events" ON public.media_event_registrations;
CREATE POLICY "Anyone can register for events"
  ON public.media_event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- media_newsletter_subscribers: authenticated users can subscribe
DROP POLICY IF EXISTS "Users can subscribe to newsletter" ON public.media_newsletter_subscribers;
CREATE POLICY "Users can subscribe to newsletter"
  ON public.media_newsletter_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- mobile_iap_products: admin only
DROP POLICY IF EXISTS "Products managed by authenticated" ON public.mobile_iap_products;
CREATE POLICY "Products managed by authenticated"
  ON public.mobile_iap_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

-- mobile_neighborhoods: admin only
DROP POLICY IF EXISTS "Neighborhoods managed by authenticated" ON public.mobile_neighborhoods;
CREATE POLICY "Neighborhoods managed by authenticated"
  ON public.mobile_neighborhoods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

-- mortgage_preapproval_requests: scoped to authenticated user
DROP POLICY IF EXISTS "Users can create preapproval requests" ON public.mortgage_preapproval_requests;
CREATE POLICY "Users can create preapproval requests"
  ON public.mortgage_preapproval_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- mortgage_simulations: authenticated only
DROP POLICY IF EXISTS "Anyone can create simulations" ON public.mortgage_simulations;
CREATE POLICY "Anyone can create simulations"
  ON public.mortgage_simulations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- seo_internal_searches: authenticated only (prevents anonymous data pollution)
DROP POLICY IF EXISTS "Anyone can log searches" ON public.seo_internal_searches;
CREATE POLICY "Anyone can log searches"
  ON public.seo_internal_searches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- tour_analytics: authenticated only
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.tour_analytics;
CREATE POLICY "Anyone can insert analytics"
  ON public.tour_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- user_session_tracking: scope to own session only
DROP POLICY IF EXISTS "System can manage sessions" ON public.user_session_tracking;
CREATE POLICY "System can manage sessions"
  ON public.user_session_tracking
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- virtual_tour_bookings: authenticated users can create own bookings
DROP POLICY IF EXISTS "Users can create tour bookings" ON public.virtual_tour_bookings;
CREATE POLICY "Users can create tour bookings"
  ON public.virtual_tour_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);


-- ----------------------------------------------------------------
-- FIX 3: Add RLS policies to platform_commission_settings (admin-only table)
-- Currently has RLS enabled but ZERO policies = nobody can access it
-- ----------------------------------------------------------------

CREATE POLICY "Admins can view commission settings"
  ON public.platform_commission_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

CREATE POLICY "Admins can manage commission settings"
  ON public.platform_commission_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );
