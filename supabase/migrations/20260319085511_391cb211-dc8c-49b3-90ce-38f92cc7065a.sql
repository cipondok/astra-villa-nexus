
-- Market clusters: heat score for ranking
CREATE INDEX IF NOT EXISTS idx_market_clusters_heat
  ON public.market_clusters (market_heat_score DESC NULLS LAST);
