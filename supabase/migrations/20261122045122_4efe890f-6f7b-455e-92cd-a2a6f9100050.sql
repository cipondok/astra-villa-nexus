-- market_trend_factors: admin only
DROP POLICY IF EXISTS "Market trends are public" ON public.market_trend_factors;
CREATE POLICY "Admins read market trend factors" ON public.market_trend_factors
  FOR SELECT TO authenticated USING ((SELECT public.is_admin_user()));

-- carousel_settings: only the public-facing carousel config
DROP POLICY IF EXISTS "Anyone can view carousel settings" ON public.carousel_settings;
CREATE POLICY "Public carousel settings are readable" ON public.carousel_settings
  FOR SELECT TO anon, authenticated
  USING (carousel_name = 'featured_properties' OR (SELECT public.is_admin_user()));

-- badge_definitions: active only
DROP POLICY IF EXISTS "Anyone can read badge definitions" ON public.badge_definitions;
CREATE POLICY "Active badge definitions are readable" ON public.badge_definitions
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR (SELECT public.is_admin_user()));

-- articles: published, own, or admin
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON public.articles;
CREATE POLICY "Published articles are readable" ON public.articles
  FOR SELECT TO anon, authenticated
  USING (publish_status = 'published' OR auth.uid() = user_id OR (SELECT public.is_admin_user()));

-- disposable_email_domains: admin only; single-domain check via RPC
DROP POLICY IF EXISTS "Anyone can read disposable domains" ON public.disposable_email_domains;
CREATE POLICY "Admins read disposable domains" ON public.disposable_email_domains
  FOR SELECT TO authenticated USING ((SELECT public.is_admin_user()));

CREATE OR REPLACE FUNCTION public.is_disposable_email_domain(_domain text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.disposable_email_domains
    WHERE domain = lower(trim(coalesce(_domain, '')))
  );
$$;
REVOKE ALL ON FUNCTION public.is_disposable_email_domain(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_disposable_email_domain(text) TO anon, authenticated, service_role;

-- property_facilities: only for published properties, owner/agent, or admin
DROP POLICY IF EXISTS "Anyone can view property facilities" ON public.property_facilities;
CREATE POLICY "Facilities of visible properties are readable" ON public.property_facilities
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_facilities.property_id
        AND (p.status IN ('published', 'active') OR p.owner_id = auth.uid() OR p.agent_id = auth.uid())
    )
    OR (SELECT public.is_admin_user())
  );

-- ab_test_variants: active only
DROP POLICY IF EXISTS "Anyone can read active variants" ON public.ab_test_variants;
CREATE POLICY "Active variants are readable" ON public.ab_test_variants
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR (SELECT public.is_admin_user()));

-- market_story_signals: published and not expired
DROP POLICY IF EXISTS "Authenticated users read market stories" ON public.market_story_signals;
CREATE POLICY "Published market stories are readable" ON public.market_story_signals
  FOR SELECT TO authenticated
  USING (
    (is_published = true AND (expires_at IS NULL OR expires_at > now()))
    OR (SELECT public.is_admin_user())
  );

-- agent_leaderboard_rewards: top ranks public, own row, admin
DROP POLICY IF EXISTS "Public view leaderboard" ON public.agent_leaderboard_rewards;
CREATE POLICY "Top leaderboard ranks are public" ON public.agent_leaderboard_rewards
  FOR SELECT TO anon, authenticated
  USING ((rank IS NOT NULL AND rank <= 50) OR (SELECT public.is_admin_user()));

-- property_rating_aggregates: only for visible properties
DROP POLICY IF EXISTS "Anyone can view rating aggregates" ON public.property_rating_aggregates;
CREATE POLICY "Ratings of visible properties are readable" ON public.property_rating_aggregates
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_rating_aggregates.property_id
        AND (p.status IN ('published', 'active') OR p.owner_id = auth.uid() OR p.agent_id = auth.uid())
    )
    OR (SELECT public.is_admin_user())
  );

-- rental_market_insights: minimum sample size
DROP POLICY IF EXISTS "Anyone can read rental insights" ON public.rental_market_insights;
CREATE POLICY "Rental insights with enough listings are readable" ON public.rental_market_insights
  FOR SELECT TO anon, authenticated
  USING (coalesce(rental_property_count, 0) >= 3 OR (SELECT public.is_admin_user()));

-- ml_valuation_city_stats: minimum sample size
DROP POLICY IF EXISTS "Authenticated read ml_valuation_city_stats" ON public.ml_valuation_city_stats;
CREATE POLICY "Valuation stats with enough samples are readable" ON public.ml_valuation_city_stats
  FOR SELECT TO authenticated
  USING (coalesce(sample_count, 0) >= 3 OR (SELECT public.is_admin_user()));

-- city_network_density: admin only
DROP POLICY IF EXISTS "Public read city_network_density" ON public.city_network_density;
CREATE POLICY "Admins read city_network_density" ON public.city_network_density
  FOR SELECT TO authenticated USING ((SELECT public.is_admin_user()));

-- pmne_category_narrative: admin only
DROP POLICY IF EXISTS "Auth read pmne_category_narrative" ON public.pmne_category_narrative;
CREATE POLICY "Admins read pmne_category_narrative" ON public.pmne_category_narrative
  FOR SELECT TO authenticated USING ((SELECT public.is_admin_user()));

-- platform_countries: launched countries only
DROP POLICY IF EXISTS "Anyone can view countries" ON public.platform_countries;
DROP POLICY IF EXISTS "Service role manages countries_read" ON public.platform_countries;
CREATE POLICY "Launched countries are readable" ON public.platform_countries
  FOR SELECT TO anon, authenticated
  USING (launched_at IS NOT NULL OR (SELECT public.is_admin_user()));

-- market_clusters: minimum sample size
DROP POLICY IF EXISTS "Allow authenticated read market_clusters" ON public.market_clusters;
CREATE POLICY "Market clusters with enough listings are readable" ON public.market_clusters
  FOR SELECT TO authenticated
  USING (coalesce(property_count, 0) >= 3 OR (SELECT public.is_admin_user()));

-- location_price_trends: minimum sample size
DROP POLICY IF EXISTS "Anyone can read location price trends" ON public.location_price_trends;
CREATE POLICY "Price trends with enough listings are readable" ON public.location_price_trends
  FOR SELECT TO anon, authenticated
  USING (coalesce(property_count, 0) >= 3 OR (SELECT public.is_admin_user()));

-- locations: active only (admins keep existing admin view policy)
DROP POLICY IF EXISTS "allow_public_read_locations" ON public.locations;
CREATE POLICY "Active locations are readable" ON public.locations
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- market_heat_clusters: minimum sample size
DROP POLICY IF EXISTS "Market heat clusters are publicly readable" ON public.market_heat_clusters;
CREATE POLICY "Heat clusters with enough listings are readable" ON public.market_heat_clusters
  FOR SELECT TO authenticated
  USING (coalesce(property_count, 0) >= 3 OR (SELECT public.is_admin_user()));

-- flash_deals: active, own, or admin
DROP POLICY IF EXISTS "Flash deals are publicly readable" ON public.flash_deals;
CREATE POLICY "Active flash deals are readable" ON public.flash_deals
  FOR SELECT TO anon, authenticated
  USING (status = 'active' OR auth.uid() = seller_id OR (SELECT public.is_admin_user()));

-- global_regions: active only
DROP POLICY IF EXISTS "Authenticated read regions" ON public.global_regions;
CREATE POLICY "Active regions are readable" ON public.global_regions
  FOR SELECT TO authenticated
  USING (is_active = true OR (SELECT public.is_admin_user()));

-- mobile_live_auctions: published statuses, creator, or admin
DROP POLICY IF EXISTS "Auctions are publicly readable" ON public.mobile_live_auctions;
DROP POLICY IF EXISTS "Auctions viewable by all" ON public.mobile_live_auctions;
CREATE POLICY "Published auctions are readable" ON public.mobile_live_auctions
  FOR SELECT TO anon, authenticated
  USING (
    status IN ('scheduled', 'upcoming', 'live', 'active', 'ended', 'closed', 'completed', 'sold')
    OR created_by = auth.uid()
    OR (SELECT public.is_admin_user())
  );

-- market_price_trends: minimum transaction volume
DROP POLICY IF EXISTS "Anyone can read market trends" ON public.market_price_trends;
CREATE POLICY "Price trends with enough transactions are readable" ON public.market_price_trends
  FOR SELECT TO anon, authenticated
  USING (coalesce(transaction_volume, 0) >= 3 OR (SELECT public.is_admin_user()));

-- market_liquidity_metrics: area-wide rows or visible properties
DROP POLICY IF EXISTS "Authenticated users can read liquidity metrics" ON public.market_liquidity_metrics;
CREATE POLICY "Liquidity metrics for areas or visible properties are readable" ON public.market_liquidity_metrics
  FOR SELECT TO authenticated
  USING (
    property_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = market_liquidity_metrics.property_id
        AND (p.status IN ('published', 'active') OR p.owner_id = auth.uid() OR p.agent_id = auth.uid())
    )
    OR (SELECT public.is_admin_user())
  );

-- market_trends: admin only (existing admin ALL policy covers reads)
DROP POLICY IF EXISTS "Allow public read-only access on trends" ON public.market_trends;