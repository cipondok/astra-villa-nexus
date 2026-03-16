
-- ═══════════════════════════════════════════════════════════════
-- ASTRA VILLA — Production Data Architecture & Worker System
-- ═══════════════════════════════════════════════════════════════

-- ══ 1. Missing computed intelligence columns on properties ══
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS market_heat_score smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS luxury_index_score smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS investment_risk_level text DEFAULT 'medium';

-- ══ 2. Missing indexes for high-performance queries ══
CREATE INDEX IF NOT EXISTS idx_properties_deal_score ON properties(deal_score DESC) WHERE deal_score > 0;
CREATE INDEX IF NOT EXISTS idx_properties_demand_score ON properties(demand_score DESC) WHERE demand_score > 0;
CREATE INDEX IF NOT EXISTS idx_properties_market_heat ON properties(market_heat_score DESC) WHERE market_heat_score > 0;
CREATE INDEX IF NOT EXISTS idx_properties_risk_level ON properties(investment_risk_level) WHERE investment_risk_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_luxury_index ON properties(luxury_index_score DESC) WHERE luxury_index_score > 0;
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_score_updated ON properties(score_updated_at DESC NULLS LAST);

-- ══ 3. Portfolio Intelligence Table ══
CREATE TABLE IF NOT EXISTS public.portfolio_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_value bigint DEFAULT 0,
  total_properties int DEFAULT 0,
  projected_roi numeric DEFAULT 0,
  risk_score numeric DEFAULT 0,
  opportunity_density numeric DEFAULT 0,
  avg_opportunity_score numeric DEFAULT 0,
  forecast_growth_signal text DEFAULT 'Stable',
  concentration_risk boolean DEFAULT false,
  top_city text,
  top_city_pct numeric DEFAULT 0,
  weakest_asset_id uuid,
  strongest_asset_id uuid,
  last_analysis_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.portfolio_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own portfolio intelligence"
  ON public.portfolio_intelligence FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can upsert portfolio intelligence"
  ON public.portfolio_intelligence FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ══ 4. Deal Alert Intelligence Table ══
CREATE TABLE IF NOT EXISTS public.deal_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  alert_score smallint DEFAULT 0,
  alert_priority text DEFAULT 'medium',
  title text NOT NULL,
  message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.deal_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own deal alerts"
  ON public.deal_alerts FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users update own deal alerts"
  ON public.deal_alerts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_deal_alerts_user ON deal_alerts(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_alerts_property ON deal_alerts(property_id);
CREATE INDEX IF NOT EXISTS idx_deal_alerts_type ON deal_alerts(alert_type, alert_priority);

-- ══ 5. Worker Run Log Table ══
CREATE TABLE IF NOT EXISTS public.autopilot_worker_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_name text NOT NULL,
  status text DEFAULT 'running',
  items_processed int DEFAULT 0,
  duration_ms int DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_worker_runs_name ON autopilot_worker_runs(worker_name, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_worker_runs_status ON autopilot_worker_runs(status, started_at DESC);

-- ══ 6. Autopilot orchestration RPC ══
CREATE OR REPLACE FUNCTION public.get_autopilot_status()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'workers', (
        SELECT jsonb_agg(row_to_json(w))
        FROM (
          SELECT DISTINCT ON (worker_name)
            worker_name, status, items_processed, duration_ms,
            started_at, completed_at, error_message
          FROM autopilot_worker_runs
          ORDER BY worker_name, started_at DESC
        ) w
      ),
      'property_stats', jsonb_build_object(
        'total_active', (SELECT count(*) FROM properties WHERE status='active'),
        'scored', (SELECT count(*) FROM properties WHERE status='active' AND opportunity_score > 0),
        'predicted', (SELECT count(*) FROM properties WHERE status='active' AND ai_estimated_price IS NOT NULL),
        'heat_mapped', (SELECT count(*) FROM properties WHERE status='active' AND market_heat_score > 0)
      ),
      'cluster_count', (SELECT count(*) FROM market_heat_clusters),
      'deal_alerts_24h', (SELECT count(*) FROM deal_alerts WHERE created_at > now() - interval '24 hours'),
      'portfolio_snapshots', (SELECT count(*) FROM portfolio_intelligence),
      'timestamp', now()
    )
  );
END;
$$;

-- ══ 7. Generate deal alerts RPC ══
CREATE OR REPLACE FUNCTION public.generate_deal_alerts(p_limit int DEFAULT 50)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start timestamptz := clock_timestamp();
  v_count int := 0;
  v_prop record;
BEGIN
  FOR v_prop IN
    SELECT id, title, city, price, opportunity_score, deal_score,
           valuation_label, valuation_gap_pct, price_trend_signal,
           price_action_hint, demand_trend, risk_level,
           ai_estimated_price, ai_price_confidence
    FROM properties
    WHERE status = 'active'
      AND opportunity_score > 0
      AND score_updated_at > now() - interval '7 days'
    ORDER BY opportunity_score DESC
    LIMIT p_limit
  LOOP
    -- Elite opportunity alert
    IF v_prop.opportunity_score >= 85 AND NOT EXISTS (
      SELECT 1 FROM deal_alerts WHERE property_id = v_prop.id
        AND alert_type = 'elite_opportunity' AND created_at > now() - interval '24 hours'
    ) THEN
      INSERT INTO deal_alerts (property_id, alert_type, alert_score, alert_priority, title, message, metadata)
      VALUES (
        v_prop.id, 'elite_opportunity', v_prop.opportunity_score, 'high',
        'Elite Investment Opportunity',
        format('Property "%s" in %s scored %s/100 — top-tier investment signal', v_prop.title, v_prop.city, v_prop.opportunity_score),
        jsonb_build_object('city', v_prop.city, 'score', v_prop.opportunity_score, 'price', v_prop.price)
      );
      v_count := v_count + 1;
    END IF;

    -- Flip opportunity alert
    IF v_prop.price_action_hint = 'Potential flip opportunity' AND NOT EXISTS (
      SELECT 1 FROM deal_alerts WHERE property_id = v_prop.id
        AND alert_type = 'flip_opportunity' AND created_at > now() - interval '48 hours'
    ) THEN
      INSERT INTO deal_alerts (property_id, alert_type, alert_score, alert_priority, title, message, metadata)
      VALUES (
        v_prop.id, 'flip_opportunity', v_prop.deal_score, 'high',
        'Flip Opportunity Detected',
        format('"%s" is deeply undervalued (gap: %s%%) with strong growth forecast', v_prop.title, v_prop.valuation_gap_pct),
        jsonb_build_object('city', v_prop.city, 'gap_pct', v_prop.valuation_gap_pct, 'trend', v_prop.price_trend_signal)
      );
      v_count := v_count + 1;
    END IF;

    -- Risk zone alert
    IF v_prop.price_action_hint = 'Short-term risk zone' AND NOT EXISTS (
      SELECT 1 FROM deal_alerts WHERE property_id = v_prop.id
        AND alert_type = 'risk_warning' AND created_at > now() - interval '72 hours'
    ) THEN
      INSERT INTO deal_alerts (property_id, alert_type, alert_score, alert_priority, title, message, metadata)
      VALUES (
        v_prop.id, 'risk_warning', 100 - v_prop.opportunity_score, 'critical',
        'Risk Zone Warning',
        format('"%s" shows declining signals — consider exit strategy', v_prop.title),
        jsonb_build_object('city', v_prop.city, 'risk_level', v_prop.risk_level, 'trend', v_prop.price_trend_signal)
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'alerts_generated', v_count,
    'duration_ms', ROUND(EXTRACT(EPOCH FROM (clock_timestamp() - v_start)) * 1000),
    'timestamp', now()
  );
END;
$$;

-- ══ 8. Sync market_heat_score to properties from clusters ══
CREATE OR REPLACE FUNCTION public.sync_heat_scores_to_properties()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start timestamptz := clock_timestamp();
  v_updated int := 0;
BEGIN
  UPDATE properties p
  SET market_heat_score = LEAST(100, GREATEST(0, c.heat_score))::smallint
  FROM market_heat_clusters c
  WHERE p.city = c.city
    AND p.status = 'active'
    AND (p.market_heat_score IS DISTINCT FROM LEAST(100, GREATEST(0, c.heat_score))::smallint);

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  RETURN jsonb_build_object(
    'properties_updated', v_updated,
    'duration_ms', ROUND(EXTRACT(EPOCH FROM (clock_timestamp() - v_start)) * 1000),
    'timestamp', now()
  );
END;
$$;

-- ══ 9. Compute investment_risk_level from existing signals ══
CREATE OR REPLACE FUNCTION public.compute_risk_levels(p_limit int DEFAULT 200)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start timestamptz := clock_timestamp();
  v_updated int := 0;
BEGIN
  WITH risk_calc AS (
    SELECT id,
      CASE
        WHEN COALESCE(valuation_gap_pct, 0) > 25 OR price_trend_signal = 'Decline Risk' OR demand_trend = 'cooling' THEN 'high'
        WHEN COALESCE(opportunity_score, 0) >= 65 AND demand_trend IN ('hot', 'stable') THEN 'low'
        ELSE 'medium'
      END AS computed_risk
    FROM properties
    WHERE status = 'active' AND opportunity_score > 0
    ORDER BY score_updated_at DESC NULLS LAST
    LIMIT p_limit
  )
  UPDATE properties p
  SET investment_risk_level = r.computed_risk
  FROM risk_calc r
  WHERE p.id = r.id AND p.investment_risk_level IS DISTINCT FROM r.computed_risk;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  RETURN jsonb_build_object(
    'properties_updated', v_updated,
    'duration_ms', ROUND(EXTRACT(EPOCH FROM (clock_timestamp() - v_start)) * 1000),
    'timestamp', now()
  );
END;
$$;
