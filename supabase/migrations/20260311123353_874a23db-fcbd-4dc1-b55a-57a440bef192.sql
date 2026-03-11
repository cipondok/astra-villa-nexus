
-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ AI Intelligence Cache Layer + Readiness Score Infrastructure       ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- 1) Unified AI Intelligence Cache
CREATE TABLE IF NOT EXISTS public.ai_intelligence_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  cache_type TEXT NOT NULL, -- 'investment_score','deal_analysis','ai_insight','roi_forecast','hotspot','copilot_alert'
  cache_tier TEXT NOT NULL DEFAULT 'warm', -- 'hot','warm','cold'
  data_snapshot JSONB NOT NULL DEFAULT '{}',
  freshness_score NUMERIC(5,2) DEFAULT 100, -- 0-100, decays over time
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  refresh_priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
  is_stale BOOLEAN DEFAULT false,
  source_table TEXT, -- which table the data came from
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, cache_type)
);

CREATE INDEX idx_ai_cache_type_stale ON public.ai_intelligence_cache(cache_type, is_stale);
CREATE INDEX idx_ai_cache_tier ON public.ai_intelligence_cache(cache_tier, freshness_score DESC);
CREATE INDEX idx_ai_cache_expires ON public.ai_intelligence_cache(expires_at) WHERE NOT is_stale;

-- 2) AI Intelligence Readiness Log
CREATE TABLE IF NOT EXISTS public.ai_readiness_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  readiness_score NUMERIC(5,2) NOT NULL, -- 0-100
  coverage_scored NUMERIC(5,2) DEFAULT 0,
  coverage_roi NUMERIC(5,2) DEFAULT 0,
  coverage_deal NUMERIC(5,2) DEFAULT 0,
  coverage_insight NUMERIC(5,2) DEFAULT 0,
  freshness_avg NUMERIC(5,2) DEFAULT 0,
  alert_health NUMERIC(5,2) DEFAULT 0,
  job_success_rate NUMERIC(5,2) DEFAULT 0,
  component_scores JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_readiness_time ON public.ai_readiness_snapshots(computed_at DESC);

-- 3) Batch Scheduler Lock table (prevents duplicate executions)
CREATE TABLE IF NOT EXISTS public.ai_batch_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL UNIQUE,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_by TEXT DEFAULT 'system',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),
  last_completed_at TIMESTAMPTZ
);

-- 4) RPC: Compute readiness score
CREATE OR REPLACE FUNCTION public.compute_ai_readiness()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_props INTEGER;
  scored_props INTEGER;
  roi_props INTEGER;
  deal_props INTEGER;
  insight_props INTEGER;
  fresh_cache NUMERIC;
  total_cache INTEGER;
  stale_cache INTEGER;
  jobs_completed INTEGER;
  jobs_failed INTEGER;
  recent_alerts INTEGER;
  cov_scored NUMERIC;
  cov_roi NUMERIC;
  cov_deal NUMERIC;
  cov_insight NUMERIC;
  freshness_avg NUMERIC;
  alert_health NUMERIC;
  job_rate NUMERIC;
  final_score NUMERIC;
BEGIN
  -- Total properties
  SELECT count(*) INTO total_props FROM properties WHERE status = 'available';
  IF total_props = 0 THEN total_props := 1; END IF;

  -- Coverage: investment scores
  SELECT count(*) INTO scored_props FROM properties WHERE status = 'available' AND investment_score IS NOT NULL AND investment_score > 0;
  cov_scored := (scored_props::NUMERIC / total_props) * 100;

  -- Coverage: ROI forecasts
  SELECT count(DISTINCT property_id) INTO roi_props FROM property_roi_forecast;
  cov_roi := LEAST((roi_props::NUMERIC / total_props) * 100, 100);

  -- Coverage: deal analysis
  SELECT count(DISTINCT property_id) INTO deal_props FROM property_deal_analysis;
  cov_deal := LEAST((deal_props::NUMERIC / total_props) * 100, 100);

  -- Coverage: AI insights
  SELECT count(DISTINCT property_id) INTO insight_props FROM property_ai_insights;
  cov_insight := LEAST((insight_props::NUMERIC / total_props) * 100, 100);

  -- Freshness from cache
  SELECT count(*), count(*) FILTER (WHERE is_stale = true)
  INTO total_cache, stale_cache
  FROM ai_intelligence_cache;
  IF total_cache > 0 THEN
    freshness_avg := ((total_cache - stale_cache)::NUMERIC / total_cache) * 100;
  ELSE
    freshness_avg := 0;
  END IF;

  -- Alert health (active alerts in last 7 days)
  SELECT count(*) INTO recent_alerts FROM copilot_investment_alerts
  WHERE is_active = true AND generated_at > now() - interval '7 days';
  alert_health := LEAST(recent_alerts * 10, 100);

  -- Job success rate (last 30 days)
  SELECT count(*) FILTER (WHERE status = 'completed'), count(*) FILTER (WHERE status = 'failed')
  INTO jobs_completed, jobs_failed
  FROM ai_jobs WHERE created_at > now() - interval '30 days';
  IF (jobs_completed + jobs_failed) > 0 THEN
    job_rate := (jobs_completed::NUMERIC / (jobs_completed + jobs_failed)) * 100;
  ELSE
    job_rate := 0;
  END IF;

  -- Weighted final score
  final_score := (cov_scored * 0.25) + (cov_roi * 0.20) + (freshness_avg * 0.20) + (alert_health * 0.15) + (job_rate * 0.20);

  -- Save snapshot
  INSERT INTO ai_readiness_snapshots (readiness_score, coverage_scored, coverage_roi, coverage_deal, coverage_insight, freshness_avg, alert_health, job_success_rate, component_scores)
  VALUES (final_score, cov_scored, cov_roi, cov_deal, cov_insight, freshness_avg, alert_health, job_rate,
    jsonb_build_object('coverage_scored', cov_scored, 'coverage_roi', cov_roi, 'coverage_deal', cov_deal, 'coverage_insight', cov_insight, 'freshness', freshness_avg, 'alerts', alert_health, 'jobs', job_rate));

  RETURN jsonb_build_object(
    'readiness_score', round(final_score, 1),
    'coverage_scored', round(cov_scored, 1),
    'coverage_roi', round(cov_roi, 1),
    'coverage_deal', round(cov_deal, 1),
    'coverage_insight', round(cov_insight, 1),
    'freshness_avg', round(freshness_avg, 1),
    'alert_health', round(alert_health, 1),
    'job_success_rate', round(job_rate, 1),
    'total_properties', total_props
  );
END;
$$;

-- 5) RPC: Acquire batch lock (prevents duplicate job execution)
CREATE OR REPLACE FUNCTION public.acquire_batch_lock(p_job_type TEXT, p_ttl_minutes INTEGER DEFAULT 30)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete expired locks
  DELETE FROM ai_batch_locks WHERE expires_at < now();
  
  -- Try to acquire lock
  INSERT INTO ai_batch_locks (job_type, locked_at, expires_at)
  VALUES (p_job_type, now(), now() + (p_ttl_minutes || ' minutes')::interval)
  ON CONFLICT (job_type) DO NOTHING;
  
  RETURN FOUND;
END;
$$;

-- 6) RPC: Release batch lock
CREATE OR REPLACE FUNCTION public.release_batch_lock(p_job_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ai_batch_locks SET last_completed_at = now() WHERE job_type = p_job_type;
  DELETE FROM ai_batch_locks WHERE job_type = p_job_type;
END;
$$;

-- 7) RPC: Get AI health metrics
CREATE OR REPLACE FUNCTION public.get_ai_health_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_props INTEGER;
  scored INTEGER;
  roi INTEGER;
  deal INTEGER;
  insight INTEGER;
  pending_jobs INTEGER;
  running_jobs INTEGER;
  avg_latency NUMERIC;
  stale_items JSONB;
  recent_alert_freq INTEGER;
BEGIN
  SELECT count(*) INTO total_props FROM properties WHERE status = 'available';
  IF total_props = 0 THEN total_props := 1; END IF;

  SELECT count(*) INTO scored FROM properties WHERE status = 'available' AND investment_score IS NOT NULL AND investment_score > 0;
  SELECT count(DISTINCT property_id) INTO roi FROM property_roi_forecast;
  SELECT count(DISTINCT property_id) INTO deal FROM property_deal_analysis;
  SELECT count(DISTINCT property_id) INTO insight FROM property_ai_insights;

  SELECT count(*) INTO pending_jobs FROM ai_jobs WHERE status = 'pending';
  SELECT count(*) INTO running_jobs FROM ai_jobs WHERE status = 'running';
  
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))), 0)
  INTO avg_latency
  FROM ai_jobs WHERE status = 'completed' AND completed_at IS NOT NULL AND started_at IS NOT NULL AND created_at > now() - interval '7 days';

  SELECT count(*) INTO recent_alert_freq FROM copilot_investment_alerts WHERE generated_at > now() - interval '24 hours';

  -- Stale intelligence items
  SELECT COALESCE(jsonb_agg(jsonb_build_object('type', cache_type, 'property_id', property_id, 'last_computed', last_computed_at, 'freshness', freshness_score)), '[]'::jsonb)
  INTO stale_items
  FROM ai_intelligence_cache WHERE is_stale = true ORDER BY freshness_score ASC LIMIT 20;

  RETURN jsonb_build_object(
    'total_properties', total_props,
    'pct_scored', round((scored::NUMERIC / total_props) * 100, 1),
    'pct_roi', round(LEAST((roi::NUMERIC / total_props) * 100, 100), 1),
    'pct_deal', round(LEAST((deal::NUMERIC / total_props) * 100, 100), 1),
    'pct_insight', round(LEAST((insight::NUMERIC / total_props) * 100, 100), 1),
    'pending_jobs', pending_jobs,
    'running_jobs', running_jobs,
    'avg_latency_sec', round(avg_latency, 1),
    'alert_freq_24h', recent_alert_freq,
    'stale_items', stale_items
  );
END;
$$;

-- Enable RLS
ALTER TABLE public.ai_intelligence_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_readiness_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_batch_locks ENABLE ROW LEVEL SECURITY;

-- Policies (admin-only via service role, public read for readiness)
CREATE POLICY "Allow authenticated read on cache" ON public.ai_intelligence_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on readiness" ON public.ai_readiness_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on locks" ON public.ai_batch_locks FOR SELECT TO authenticated USING (true);
