-- Helper: who may read premium market intelligence (professional roles + admins)
CREATE OR REPLACE FUNCTION public.can_view_market_intelligence()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('investor','agent','developer','property_owner','admin','super_admin')
  )
$$;
REVOKE EXECUTE ON FUNCTION public.can_view_market_intelligence() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_market_intelligence() TO authenticated, service_role;

-- Market intelligence tables: replace open reads with role-gated reads
DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'hedging_macro_risk','hedging_portfolio_exposure','hedging_safe_havens','hedging_strategies',
    'portfolio_optimizer_allocations','portfolio_optimizer_diversification','portfolio_optimizer_performance',
    'portfolio_optimizer_rebalancing','portfolio_optimizer_scenarios',
    'liquidity_absorption','liquidity_crisis_resilience','liquidity_demand_elasticity','liquidity_exit_timing',
    'ai_investment_recommendations','ml_valuation_predictions'
  ] LOOP
    FOR p IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename=t AND cmd='SELECT' AND qual='true' LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format(
      'CREATE POLICY "Professionals and admins can read market intelligence" ON public.%I FOR SELECT TO authenticated USING (public.can_view_market_intelligence())', t);
  END LOOP;
END $$;

-- Investor follows: only the people involved (and admins) can see a follow
DROP POLICY IF EXISTS "Anyone can read follows" ON public.investor_follows;
CREATE POLICY "Users see follows they are part of" ON public.investor_follows
  FOR SELECT TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id OR public.is_admin_user());

-- Investor credibility: owners and admins read the raw rows
DROP POLICY IF EXISTS "Anyone can read credibility" ON public.investor_credibility;
CREATE POLICY "Users read own credibility" ON public.investor_credibility
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_user());

-- Public leaderboard exposes only reputation fields, name and avatar
CREATE OR REPLACE FUNCTION public.get_investor_leaderboard(_limit integer DEFAULT 20)
RETURNS TABLE (
  user_id uuid, full_name text, avatar_url text, reputation_score integer, tier text,
  deals_shared integer, total_likes_received integer, follower_count integer, following_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.user_id, p.full_name, p.avatar_url, c.reputation_score, c.tier,
         c.deals_shared, c.total_likes_received, c.follower_count, c.following_count
  FROM public.investor_credibility c
  LEFT JOIN public.profiles p ON p.id = c.user_id
  ORDER BY c.reputation_score DESC NULLS LAST
  LIMIT LEAST(GREATEST(COALESCE(_limit, 20), 1), 50)
$$;
REVOKE EXECUTE ON FUNCTION public.get_investor_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_investor_leaderboard(integer) TO anon, authenticated, service_role;

-- Property recommendations: only visible when both listings are visible to the viewer
DROP POLICY IF EXISTS "Anyone can read recommendations" ON public.property_recommendations;
CREATE POLICY "Recommendations visible with their listings" ON public.property_recommendations
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.properties s WHERE s.id = property_recommendations.property_id)
    AND EXISTS (SELECT 1 FROM public.properties r WHERE r.id = property_recommendations.recommended_property_id)
  );