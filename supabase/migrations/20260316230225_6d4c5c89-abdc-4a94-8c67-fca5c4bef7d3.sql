
-- Worker 1: Opportunity Score Recalculation
CREATE OR REPLACE FUNCTION recalc_opportunity_scores(p_batch_size integer DEFAULT 500)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  WITH batch AS (
    SELECT id,
      COALESCE(roi_projection, 0) AS roi,
      COALESCE(demand_score, 0) AS demand,
      COALESCE(valuation_gap_pct, 0) AS vgap,
      COALESCE(inquiry_velocity, 0) AS velocity,
      COALESCE(rental_yield, 0) AS yield,
      COALESCE(luxury_index_score, 0) AS luxury
    FROM properties
    WHERE status = 'active'
    ORDER BY updated_at DESC
    LIMIT p_batch_size
  )
  UPDATE properties p
  SET opportunity_score = LEAST(100, GREATEST(0,
    b.roi * 0.30 +
    b.demand * 0.20 +
    (100 - ABS(b.vgap)) * 0.20 +
    b.velocity * 0.15 +
    b.yield * 0.10 +
    b.luxury * 0.05
  )),
  updated_at = now()
  FROM batch b
  WHERE p.id = b.id;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Worker 2: Deal Hunter Scanner
CREATE OR REPLACE FUNCTION scan_deal_alerts(p_threshold numeric DEFAULT 75)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  INSERT INTO deal_alerts (property_id, alert_type, alert_score, alert_priority, title, message)
  SELECT
    p.id,
    CASE
      WHEN p.deal_score >= 90 THEN 'elite_deal'
      WHEN p.valuation_gap_pct < -15 THEN 'undervalued'
      ELSE 'high_score'
    END,
    COALESCE(p.deal_score, 0),
    CASE WHEN p.deal_score >= 90 THEN 'critical' ELSE 'high' END,
    CASE
      WHEN p.deal_score >= 90 THEN 'Elite Investment Opportunity'
      WHEN p.valuation_gap_pct < -15 THEN 'Undervalued Property Detected'
      ELSE 'High-Score Deal Found'
    END,
    'AI detected a strong investment signal for ' || COALESCE(p.title, 'property') || ' in ' || COALESCE(p.city, 'unknown')
  FROM properties p
  WHERE p.status = 'active'
    AND (p.deal_score >= p_threshold OR p.valuation_gap_pct < -15)
    AND NOT EXISTS (
      SELECT 1 FROM deal_alerts da
      WHERE da.property_id = p.id
        AND da.created_at > now() - interval '24 hours'
    );

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Worker 3: Market Cluster Aggregator
CREATE OR REPLACE FUNCTION aggregate_market_clusters()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  INSERT INTO market_clusters (city, area, center_lat, center_lng, avg_opportunity_score, market_heat_score, property_count, avg_price_per_sqm, trend_direction, cluster_confidence, updated_at)
  SELECT
    city,
    area,
    AVG(latitude),
    AVG(longitude),
    AVG(COALESCE(opportunity_score, 0)),
    AVG(COALESCE(demand_score, 0)),
    COUNT(*),
    AVG(CASE WHEN COALESCE(building_area, 0) > 0 THEN price / building_area ELSE NULL END),
    CASE
      WHEN AVG(COALESCE(demand_score, 0)) >= 70 THEN 'Rising'
      WHEN AVG(COALESCE(demand_score, 0)) >= 40 THEN 'Stable'
      ELSE 'Cooling'
    END,
    LEAST(1.0, COUNT(*)::numeric / 50.0),
    now()
  FROM properties
  WHERE status = 'active' AND city IS NOT NULL AND area IS NOT NULL
  GROUP BY city, area
  ON CONFLICT (city, area) DO UPDATE SET
    center_lat = EXCLUDED.center_lat,
    center_lng = EXCLUDED.center_lng,
    avg_opportunity_score = EXCLUDED.avg_opportunity_score,
    market_heat_score = EXCLUDED.market_heat_score,
    property_count = EXCLUDED.property_count,
    avg_price_per_sqm = EXCLUDED.avg_price_per_sqm,
    trend_direction = EXCLUDED.trend_direction,
    cluster_confidence = EXCLUDED.cluster_confidence,
    updated_at = now();

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Worker 4: Demand Heat Score Sync
CREATE OR REPLACE FUNCTION sync_demand_heat_scores(p_batch_size integer DEFAULT 500)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE properties p
  SET demand_heat_score = LEAST(100, GREATEST(0,
    COALESCE(p.demand_score, 0) * 0.4 +
    COALESCE(p.inquiry_velocity, 0) * 0.3 +
    COALESCE(mc.market_heat_score, 0) * 0.3
  ))
  FROM market_clusters mc
  WHERE p.city = mc.city AND p.area = mc.area
    AND p.status = 'active';

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Worker 5: Portfolio Intelligence Snapshot
CREATE OR REPLACE FUNCTION compute_portfolio_snapshots()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  INSERT INTO investor_portfolio_snapshots (investor_id, total_value, total_properties, projected_roi, risk_score, opportunity_density, forecast_growth_signal)
  SELECT
    f.user_id,
    SUM(p.price),
    COUNT(*),
    AVG(COALESCE(p.roi_projection, 0)),
    AVG(CASE
      WHEN p.investment_risk_level = 'high' THEN 80
      WHEN p.investment_risk_level = 'medium' THEN 50
      ELSE 20
    END),
    AVG(COALESCE(p.opportunity_score, 0)),
    CASE
      WHEN AVG(COALESCE(p.forecast_score_3m, 0)) >= 70 THEN 'Strong Growth'
      WHEN AVG(COALESCE(p.forecast_score_3m, 0)) >= 40 THEN 'Moderate Growth'
      ELSE 'Stable'
    END
  FROM favorites f
  JOIN properties p ON p.id = f.property_id
  WHERE p.status = 'active'
  GROUP BY f.user_id;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Utility: Get worker status summary
CREATE OR REPLACE FUNCTION get_intelligence_worker_status()
RETURNS TABLE(
  worker_name text,
  last_status text,
  last_rows_affected integer,
  last_duration_ms integer,
  last_run_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (worker_name)
    worker_name,
    status,
    rows_affected,
    duration_ms,
    started_at
  FROM intelligence_worker_runs
  ORDER BY worker_name, started_at DESC;
$$;
