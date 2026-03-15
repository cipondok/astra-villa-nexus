
create or replace function public.get_geo_expansion_intelligence()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_top_demand_city   text;
  v_top_demand_score  numeric;
  v_top_demand_volume bigint;
  v_gap_cities        jsonb;
  v_expansion_zones   jsonb;
begin
  -- Top demand city by demand_score
  select city, coalesce(demand_score, 0), coalesce(listing_volume, 0)
  into v_top_demand_city, v_top_demand_score, v_top_demand_volume
  from location_market_insights
  where demand_score is not null
  order by demand_score desc
  limit 1;

  v_top_demand_city := coalesce(v_top_demand_city, 'N/A');

  -- Inventory gap: cities where demand_score is high but listing_volume is low
  select coalesce(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb)
  into v_gap_cities
  from (
    select
      m.city,
      coalesce(m.demand_score, 0) as demand,
      coalesce(m.listing_volume, 0) as supply,
      case when coalesce(m.listing_volume, 0) = 0 then 999
        else round((coalesce(m.demand_score, 0)::numeric / greatest(m.listing_volume, 1)), 2)
      end as gap_ratio
    from location_market_insights m
    where m.demand_score is not null and m.demand_score > 30
    order by gap_ratio desc
    limit 5
  ) t;

  -- Expansion zones: combine demand + growth + liquidity into opportunity score
  -- Formula: 40% demand_score + 30% growth_score + 30% hotspot_score
  select coalesce(jsonb_agg(row_to_json(z)::jsonb), '[]'::jsonb)
  into v_expansion_zones
  from (
    select
      m.city,
      coalesce(m.demand_score, 0) as demand_score,
      coalesce(h.growth_score, 0) as growth_score,
      coalesce(h.hotspot_score, 0) as hotspot_score,
      coalesce(m.listing_volume, 0) as listing_volume,
      coalesce(h.property_count, 0) as property_count,
      round((
        coalesce(m.demand_score, 0) * 0.4 +
        coalesce(h.growth_score, 0) * 0.3 +
        coalesce(h.hotspot_score, 0) * 0.3
      )::numeric, 1) as opportunity_score,
      case
        when (coalesce(m.demand_score, 0) * 0.4 + coalesce(h.growth_score, 0) * 0.3 + coalesce(h.hotspot_score, 0) * 0.3) >= 65
          then 'IMMEDIATE'
        when (coalesce(m.demand_score, 0) * 0.4 + coalesce(h.growth_score, 0) * 0.3 + coalesce(h.hotspot_score, 0) * 0.3) >= 35
          then 'MONITOR'
        else 'LOW_PRIORITY'
      end as expansion_priority,
      coalesce(m.market_growth_rate, 0) as market_growth_rate
    from location_market_insights m
    left join investment_hotspots h on lower(h.city) = lower(m.city)
    where m.demand_score is not null
    order by opportunity_score desc
    limit 8
  ) z;

  return jsonb_build_object(
    'top_demand_city',    v_top_demand_city,
    'top_demand_score',   coalesce(v_top_demand_score, 0),
    'top_demand_volume',  coalesce(v_top_demand_volume, 0),
    'inventory_gaps',     v_gap_cities,
    'expansion_zones',    v_expansion_zones
  );
end;
$$;
