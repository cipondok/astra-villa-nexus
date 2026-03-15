
create or replace function public.get_lead_intelligence_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total_leads      bigint;
  v_hot_leads        bigint;
  v_avg_intent       numeric;
  v_avg_response_hrs numeric;
  v_response_risk    text;
  v_demand_momentum  text;
  v_recent_leads_7d  bigint;
  v_recent_leads_prev bigint;
begin
  -- Total active intent profiles
  select count(*) into v_total_leads
  from user_intent_profiles
  where last_active_at >= now() - interval '30 days';

  -- Hot leads: intent_level = 'high' (maps to score >= 75 conceptually)
  select count(*) into v_hot_leads
  from user_intent_profiles
  where intent_level = 'high'
    and last_active_at >= now() - interval '30 days';

  -- Average buyer intent score computed from activity signals
  -- Formula: (views_30d * 1 + saves_30d * 3 + inquiries_30d * 5) capped at 100
  select coalesce(round(avg(least(
    coalesce(views_30d, 0) * 1.0 +
    coalesce(saves_30d, 0) * 3.0 +
    coalesce(inquiries_30d, 0) * 5.0,
    100
  )), 1), 0)
  into v_avg_intent
  from user_intent_profiles
  where last_active_at >= now() - interval '30 days';

  -- Average agent response delay (hours) from inquiries table
  select coalesce(round(avg(
    extract(epoch from (responded_at - created_at)) / 3600.0
  )::numeric, 1), 0)
  into v_avg_response_hrs
  from inquiries
  where responded_at is not null
    and created_at >= now() - interval '30 days';

  -- Response risk classification
  v_response_risk := case
    when v_avg_response_hrs <= 2  then 'LOW'
    when v_avg_response_hrs <= 8  then 'MEDIUM'
    else 'HIGH'
  end;

  -- Demand momentum: compare last 7 days vs previous 7 days inquiry volume
  select count(*) into v_recent_leads_7d
  from inquiries
  where created_at >= now() - interval '7 days';

  select count(*) into v_recent_leads_prev
  from inquiries
  where created_at >= now() - interval '14 days'
    and created_at < now() - interval '7 days';

  v_demand_momentum := case
    when v_recent_leads_prev = 0 and v_recent_leads_7d > 0 then 'STRONG'
    when v_recent_leads_prev = 0 then 'STABLE'
    when (v_recent_leads_7d::numeric / v_recent_leads_prev) >= 1.2 then 'STRONG'
    when (v_recent_leads_7d::numeric / v_recent_leads_prev) >= 0.8 then 'STABLE'
    else 'WEAK'
  end;

  return jsonb_build_object(
    'hot_leads',          v_hot_leads,
    'total_active_leads', v_total_leads,
    'avg_intent_score',   v_avg_intent,
    'avg_response_hrs',   v_avg_response_hrs,
    'response_risk',      v_response_risk,
    'demand_momentum',    v_demand_momentum,
    'leads_7d',           v_recent_leads_7d,
    'leads_prev_7d',      v_recent_leads_prev
  );
end;
$$;
