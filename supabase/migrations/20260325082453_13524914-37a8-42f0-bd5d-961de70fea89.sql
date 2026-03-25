
-- 1. Fix ai_image_gen_config: Remove public-writable policy, add admin-only policy
DROP POLICY IF EXISTS "Service role access on ai_image_gen_config" ON public.ai_image_gen_config;

CREATE POLICY "Admin access on ai_image_gen_config"
ON public.ai_image_gen_config
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Fix user_gamification_stats: Replace USING(true) SELECT with owner-only
DROP POLICY IF EXISTS "Users can read own gamification stats" ON public.user_gamification_stats;

CREATE POLICY "Users can read own gamification stats"
ON public.user_gamification_stats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Fix property_engagement_scores: Restrict public SELECT to authenticated users only
DROP POLICY IF EXISTS "Public read access on property_engagement_scores" ON public.property_engagement_scores;
DROP POLICY IF EXISTS "Anyone can read engagement scores" ON public.property_engagement_scores;
DROP POLICY IF EXISTS "Public can read engagement scores" ON public.property_engagement_scores;
DROP POLICY IF EXISTS "Allow public read access" ON public.property_engagement_scores;

CREATE POLICY "Authenticated read engagement scores"
ON public.property_engagement_scores
FOR SELECT
TO authenticated
USING (true);
