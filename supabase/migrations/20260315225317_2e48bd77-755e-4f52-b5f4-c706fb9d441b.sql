
create or replace function public.get_market_intelligence_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_top_area          text;
  v_top_area_score    numeric;
  v_top_area_count    bigint;
  v_avg_hotspot       numeric;
  v_market_heat       text;
  v_avg_liquidity     numeric;
  v_avg_liquidity_prev numeric;
  v_liquidity_trend   text;
  v_growth_hint       text;
  v_best_growth_city  text;
  v_sparkline         jsonb;
begin
  -- Top performing area by growth_score
  select city, coalesce(growth_score, 0), coalesce(property_count, 0)
  into v_top_area, v_top_area_score, v_top_area_count
  from investment_hotspots
  where growth_score is not null
  order by growth_score desc
  limit 1;

  v_top_area := coalesce(v_top_area, 'N/A');
  v_top_area_score := coalesce(v_top_area_score, 0);

  -- Average hotspot score across all areas for market heat
  select coalesce(round(avg(coalesce(hotspot_score, 0))::numeric, 1), 0)
  into v_avg_hotspot
  from investment_hotspots;

  v_market_heat := case
    when v_avg_hotspot >= 65 then 'HOT'
    when v_avg_hotspot >= 35 then 'ACTIVE'
    else 'SLOW'
  end;

  -- Liquidity trend: avg liquidity from recent vs older scores
  select coalesce(round(avg(coalesce(liquidity_score, 0))::numeric, 1), 0)
  into v_avg_liquidity
  from property_investment_scores
  where last_updated >= now() - interval '30 days';

  select coalesce(round(avg(coalesce(liquidity_score, 0))::numeric, 1), 0)
  into v_avg_liquidity_prev
  from property_investment_scores
  where last_updated >= now() - interval '60 days'
    and last_updated < now() - interval '30 days';

  v_liquidity_trend := case
    when v_avg_liquidity_prev = 0 and v_avg_liquidity > 0 then 'IMPROVING'
    when v_avg_liquidity_prev = 0 then 'STABLE'
    when v_avg_liquidity >= v_avg_liquidity_prev * 1.1 then 'IMPROVING'
    when v_avg_liquidity >= v_avg_liquidity_prev * 0.9 then 'STABLE'
    else 'WEAKENING'
  end;

  -- Growth opportunity: city with highest growth but low property count
  select city into v_best_growth_city
  from investment_hotspots
  where growth_score is not null and property_count is not null
  order by (coalesce(growth_score, 0) * 1.0 / greatest(coalesce(property_count, 1), 1)) desc
  limit 1;

  v_growth_hint := case
    when v_best_growth_city is not null
      then 'Expand inventory in ' || v_best_growth_city || ' — high growth, low supply'
    else 'Insufficient data for growth recommendation'
  end;

  -- Sparkline: top 8 cities by hotspot_score for mini-chart
  select coalesce(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb)
  into v_sparkline
  from (
    select city as name, coalesce(hotspot_score, 0) as score
    from investment_hotspots
    where hotspot_score is not null
    order by hotspot_score desc
    limit 8
  ) t;

  return jsonb_build_object(
    'top_area',         v_top_area,
    'top_area_score',   v_top_area_score,
    'top_area_count',   v_top_area_count,
    'market_heat',      v_market_heat,
    'avg_hotspot_score', v_avg_hotspot,
    'avg_liquidity',    v_avg_liquidity,
    'liquidity_trend',  v_liquidity_trend,
    'growth_hint',      v_growth_hint,
    'sparkline_data',   v_sparkline
  );
end;
$$;
