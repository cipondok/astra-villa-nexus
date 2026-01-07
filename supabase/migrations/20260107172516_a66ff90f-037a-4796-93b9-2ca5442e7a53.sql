
-- STEP 2: Fix Security Definer View issue and tighten critical policies

-- Recreate views with explicit SECURITY INVOKER (more secure)
DROP VIEW IF EXISTS public.public_properties;
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

DROP VIEW IF EXISTS public.ai_reaction_analytics;
CREATE VIEW public.ai_reaction_analytics 
WITH (security_invoker = true) AS
SELECT 
    date_trunc('day', created_at) AS date,
    reaction_type,
    count(*) AS reaction_count,
    count(DISTINCT user_id) AS unique_users,
    count(DISTINCT conversation_id) AS unique_conversations
FROM ai_message_reactions
GROUP BY date_trunc('day', created_at), reaction_type
ORDER BY date_trunc('day', created_at) DESC;

-- Grant select on views
GRANT SELECT ON public.public_properties TO anon, authenticated;
GRANT SELECT ON public.ai_reaction_analytics TO authenticated;

-- Fix critical INSERT policies
-- 1. activity_logs - authenticated users for themselves
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
CREATE POLICY "Authenticated users can insert their activity logs"
ON public.activity_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. ai_chat_logs - users can insert their own logs
DROP POLICY IF EXISTS "Anyone can create chat logs" ON public.ai_chat_logs;
CREATE POLICY "Users can insert their own chat logs"
ON public.ai_chat_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. chat_messages - users can insert messages as themselves
DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can create chat messages"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id OR sender_id IS NULL);

-- 4. live_chat_messages - uses sender_user_id column
DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.live_chat_messages;
CREATE POLICY "Authenticated users can create live chat messages"
ON public.live_chat_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_user_id OR sender_user_id IS NULL);

-- 5. filter_analytics - restrict updates to authenticated
DROP POLICY IF EXISTS "Allow update for all users on analytics" ON public.filter_analytics;
CREATE POLICY "Authenticated can update filter analytics"
ON public.filter_analytics FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);
