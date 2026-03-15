
CREATE OR REPLACE FUNCTION public.detect_market_anomalies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  r record;
  prev_demand numeric;
  demand_drop numeric;
  growth_delta numeric;
  severity text;
BEGIN
  -- 1. Demand Shock: demand_score dropped significantly vs city median
  FOR r IN
    SELECT
      lmi.city,
      lmi.demand_score,
      lmi.listing_volume,
      ih.hotspot_score,
      ih.growth_score
    FROM location_market_insights lmi
    LEFT JOIN investment_hotspots ih ON ih.city = lmi.city
    WHERE lmi.demand_score IS NOT NULL
  LOOP
    -- Compare demand vs platform average
    SELECT avg(demand_score) INTO prev_demand
    FROM location_market_insights
    WHERE demand_score IS NOT NULL AND city != r.city;

    IF prev_demand IS NOT NULL AND prev_demand > 0 THEN
      demand_drop := ((prev_demand - COALESCE(r.demand_score, 0)) / prev_demand) * 100;

      IF demand_drop > 30 THEN
        severity := 'ALERT';
      ELSIF demand_drop > 15 THEN
        severity := 'WATCH';
      ELSE
        severity := 'NORMAL';
      END IF;

      IF severity != 'NORMAL' THEN
        result := result || jsonb_build_object(
          'anomaly_type', 'DEMAND_SHOCK',
          'affected_area', r.city,
          'severity', severity,
          'metric_value', round(demand_drop, 1),
          'insight_summary', format('%s demand is %s%% below platform average — potential demand contraction', r.city, round(demand_drop, 1)),
          'recommended_admin_action', CASE
            WHEN severity = 'ALERT' THEN 'Investigate root cause; consider promotional campaigns or price adjustments'
            ELSE 'Monitor weekly; compare with regional trends'
          END
        );
      END IF;
    END IF;

    -- 2. Oversupply Zone: high listing volume but low demand
    IF COALESCE(r.listing_volume, 0) > 50 AND COALESCE(r.demand_score, 0) < 40 THEN
      severity := CASE
        WHEN r.demand_score < 20 THEN 'ALERT'
        WHEN r.demand_score < 40 THEN 'WATCH'
        ELSE 'NORMAL'
      END;
      IF severity != 'NORMAL' THEN
        result := result || jsonb_build_object(
          'anomaly_type', 'OVERSUPPLY_ZONE',
          'affected_area', r.city,
          'severity', severity,
          'metric_value', jsonb_build_object('listings', r.listing_volume, 'demand', r.demand_score),
          'insight_summary', format('%s has %s listings but only %s demand score — supply outpacing buyer interest', r.city, r.listing_volume, r.demand_score),
          'recommended_admin_action', CASE
            WHEN severity = 'ALERT' THEN 'Flag to sales team; reduce featured listings in this area'
            ELSE 'Track supply-demand ratio weekly'
          END
        );
      END IF;
    END IF;

    -- 3. Price Overheating: growth_score rising too rapidly
    IF COALESCE(r.growth_score, 0) > 75 THEN
      severity := CASE
        WHEN r.growth_score > 90 THEN 'ALERT'
        WHEN r.growth_score > 75 THEN 'WATCH'
        ELSE 'NORMAL'
      END;
      IF severity != 'NORMAL' THEN
        result := result || jsonb_build_object(
          'anomaly_type', 'PRICE_OVERHEATING',
          'affected_area', r.city,
          'severity', severity,
          'metric_value', r.growth_score,
          'insight_summary', format('%s growth score at %s — potential price overheating risk', r.city, r.growth_score),
          'recommended_admin_action', CASE
            WHEN severity = 'ALERT' THEN 'Issue bubble risk warning; review pricing benchmarks'
            ELSE 'Watch price trajectories for correction signals'
          END
        );
      END IF;
    END IF;

    -- 4. Liquidity Freeze: low hotspot score indicates illiquid market
    IF COALESCE(r.hotspot_score, 0) < 25 AND COALESCE(r.listing_volume, 0) > 20 THEN
      severity := CASE
        WHEN r.hotspot_score < 10 THEN 'ALERT'
        WHEN r.hotspot_score < 25 THEN 'WATCH'
        ELSE 'NORMAL'
      END;
      IF severity != 'NORMAL' THEN
        result := result || jsonb_build_object(
          'anomaly_type', 'LIQUIDITY_FREEZE',
          'affected_area', r.city,
          'severity', severity,
          'metric_value', r.hotspot_score,
          'insight_summary', format('%s hotspot score at %s with %s listings — market liquidity declining', r.city, r.hotspot_score, r.listing_volume),
          'recommended_admin_action', CASE
            WHEN severity = 'ALERT' THEN 'Reduce inventory push; notify agents to adjust expectations'
            ELSE 'Monitor transaction velocity trends'
          END
        );
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'anomalies', result,
    'total_detected', jsonb_array_length(result),
    'alert_count', (SELECT count(*) FROM jsonb_array_elements(result) e WHERE e->>'severity' = 'ALERT'),
    'watch_count', (SELECT count(*) FROM jsonb_array_elements(result) e WHERE e->>'severity' = 'WATCH'),
    'scanned_at', now()
  );
END;
$$;
