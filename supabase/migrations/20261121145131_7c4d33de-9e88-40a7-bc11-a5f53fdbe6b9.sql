CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
ALTER FUNCTION public.can_view_market_intelligence() SET SCHEMA private;
REVOKE EXECUTE ON FUNCTION private.can_view_market_intelligence() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_view_market_intelligence() TO authenticated, service_role;
COMMENT ON FUNCTION public.get_investor_leaderboard(integer) IS 'Intentionally public: returns only leaderboard fields (name, avatar, reputation numbers).';