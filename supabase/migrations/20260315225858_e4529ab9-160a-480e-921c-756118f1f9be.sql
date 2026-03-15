
create or replace function public.get_agent_performance_intelligence()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_top_agent_name    text;
  v_top_agent_sales   bigint;
  v_top_agent_inq     bigint;
  v_top_close_rate    numeric;
  v_avg_response_hrs  numeric;
  v_total_agents      bigint;
  v_highly_active     bigint;
  v_moderate          bigint;
  v_low_risk          bigint;
  v_engagement_level  text;
  v_gini              numeric;
  v_distribution      text;
begin
  -- Top performing agent by close rate (sales / inquiries)
  select
    p.full_name,
    coalesce(a.total_sales, 0),
    coalesce(a.total_inquiries, 0),
    case when coalesce(a.total_inquiries, 0) > 0
      then round((a.total_sales::numeric / a.total_inquiries) * 100, 1)
      else 0 end
  into v_top_agent_name, v_top_agent_sales, v_top_agent_inq, v_top_close_rate
  from agent_leaderboard_rewards a
  join profiles p on p.id = a.agent_id
  where a.total_inquiries > 0
  order by (a.total_sales::numeric / a.total_inquiries) desc, a.total_sales desc
  limit 1;

  v_top_agent_name := coalesce(v_top_agent_name, 'N/A');

  -- Average lead response time (hours) across all agents in last 30 days
  select coalesce(round(avg(
    extract(epoch from (i.responded_at - i.created_at)) / 3600.0
  )::numeric, 1), 0)
  into v_avg_response_hrs
  from inquiries i
  where i.responded_at is not null
    and i.created_at >= now() - interval '30 days';

  -- Agent engagement classification based on recent activity
  select count(distinct agent_id) into v_total_agents
  from agent_leaderboard_rewards;

  select
    count(*) filter (where total_inquiries >= 20 and response_rate >= 80),
    count(*) filter (where total_inquiries between 5 and 19 or (response_rate >= 50 and response_rate < 80)),
    count(*) filter (where total_inquiries < 5 or response_rate < 50 or response_rate is null)
  into v_highly_active, v_moderate, v_low_risk
  from agent_leaderboard_rewards;

  -- Overall engagement level
  v_engagement_level := case
    when v_total_agents = 0 then 'NO_DATA'
    when v_highly_active::numeric / v_total_agents >= 0.5 then 'HIGHLY_ACTIVE'
    when v_low_risk::numeric / v_total_agents >= 0.4 then 'LOW_ACTIVITY_RISK'
    else 'MODERATELY_ACTIVE'
  end;

  -- Lead distribution balance: simplified Gini-like coefficient
  -- using stddev / mean of total_inquiries
  select case
    when coalesce(avg(total_inquiries), 0) = 0 then 0
    else round((coalesce(stddev(total_inquiries), 0) / avg(total_inquiries))::numeric, 2)
  end
  into v_gini
  from agent_leaderboard_rewards
  where total_inquiries is not null;

  v_distribution := case
    when v_gini <= 0.4 then 'BALANCED'
    when v_gini <= 0.8 then 'MODERATE_SKEW'
    else 'HIGHLY_SKEWED'
  end;

  return jsonb_build_object(
    'top_agent_name',     v_top_agent_name,
    'top_agent_sales',    coalesce(v_top_agent_sales, 0),
    'top_close_rate',     coalesce(v_top_close_rate, 0),
    'avg_response_hrs',   coalesce(v_avg_response_hrs, 0),
    'total_agents',       coalesce(v_total_agents, 0),
    'highly_active',      coalesce(v_highly_active, 0),
    'moderate_active',    coalesce(v_moderate, 0),
    'low_activity_risk',  coalesce(v_low_risk, 0),
    'engagement_level',   v_engagement_level,
    'distribution_coeff', coalesce(v_gini, 0),
    'distribution_status', v_distribution
  );
end;
$$;
