
create or replace function public.get_ai_system_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total        bigint;
  v_scored       bigint;
  v_coverage     numeric;
  v_last_analysis timestamptz;
  v_hours_ago    numeric;
  v_freshness    text;
  v_status       text;
begin
  select count(*) into v_total
  from properties
  where status = 'available';

  select count(*), max(updated_at)
  into v_scored, v_last_analysis
  from properties
  where status = 'available'
    and deal_probability_score is not null;

  v_coverage := case when v_total > 0
    then round((v_scored::numeric / v_total) * 100, 1)
    else 0 end;

  v_hours_ago := case when v_last_analysis is not null
    then extract(epoch from (now() - v_last_analysis)) / 3600.0
    else 999 end;

  v_freshness := case
    when v_hours_ago <= 6  then 'FRESH'
    when v_hours_ago <= 24 then 'AGING'
    else 'STALE'
  end;

  v_status := case
    when v_coverage >= 70 and v_freshness = 'FRESH' then 'HEALTHY'
    when v_coverage < 40 or v_freshness = 'STALE'  then 'CRITICAL'
    else 'WARNING'
  end;

  return jsonb_build_object(
    'coverage_rate',     v_coverage,
    'total_listings',    v_total,
    'scored_listings',   v_scored,
    'last_analysis_at',  v_last_analysis,
    'hours_since_update', round(v_hours_ago, 1),
    'freshness_state',   v_freshness,
    'ai_health_status',  v_status
  );
end;
$$;
