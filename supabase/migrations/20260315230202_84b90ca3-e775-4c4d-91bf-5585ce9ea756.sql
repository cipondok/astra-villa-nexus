
create or replace function public.get_deal_pipeline_intelligence()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_pipeline_count     bigint;
  v_closed_30d         bigint;
  v_active_30d         bigint;
  v_conversion_rate    numeric;
  v_revenue_30d        numeric;
  v_revenue_prev_30d   numeric;
  v_pipeline_revenue   numeric;
  v_avg_commission_rate numeric;
  v_growth_signal      text;
  v_growth_ratio       numeric;
  v_sparkline          jsonb;
begin
  -- Pipeline: inquiries with status 'new' or properties with active interest (recent inquiries)
  select count(distinct property_id)
  into v_pipeline_count
  from inquiries
  where created_at >= now() - interval '30 days'
    and property_id is not null;

  -- Deals closed (completed transactions) in last 30 days
  select coalesce(sum(completed), 0)
  into v_closed_30d
  from transaction_summary
  where date >= (now() - interval '30 days')::date;

  -- Total active deals in last 30 days
  select coalesce(sum(total_transactions), 0)
  into v_active_30d
  from transaction_summary
  where date >= (now() - interval '30 days')::date;

  -- Conversion rate
  v_conversion_rate := case when v_active_30d > 0
    then round((v_closed_30d::numeric / v_active_30d) * 100, 1)
    else 0 end;

  -- Revenue last 30 days
  select coalesce(sum(total_revenue), 0)
  into v_revenue_30d
  from transaction_summary
  where date >= (now() - interval '30 days')::date;

  -- Revenue previous 30 days (for growth comparison)
  select coalesce(sum(total_revenue), 0)
  into v_revenue_prev_30d
  from transaction_summary
  where date >= (now() - interval '60 days')::date
    and date < (now() - interval '30 days')::date;

  -- Avg platform commission rate
  select coalesce(round(avg(commission_rate)::numeric, 2), 5)
  into v_avg_commission_rate
  from platform_commission_settings
  where is_active = true;

  -- Estimated pipeline revenue: pipeline_count * avg property price * commission rate
  select coalesce(
    round(v_pipeline_count * avg(p.price) * (v_avg_commission_rate / 100.0)),
    0
  )
  into v_pipeline_revenue
  from properties p
  where p.status = 'available' and p.price > 0;

  -- Growth signal
  v_growth_ratio := case when v_revenue_prev_30d > 0
    then v_revenue_30d / v_revenue_prev_30d
    else case when v_revenue_30d > 0 then 2.0 else 1.0 end
  end;

  v_growth_signal := case
    when v_growth_ratio >= 1.15 then 'STRONG'
    when v_growth_ratio >= 0.85 then 'STABLE'
    else 'SLOWDOWN'
  end;

  -- Sparkline: last 8 days of revenue
  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.d), '[]'::jsonb)
  into v_sparkline
  from (
    select
      date as d,
      coalesce(sum(total_revenue), 0) as revenue
    from transaction_summary
    where date >= (now() - interval '8 days')::date
    group by date
    order by date
  ) t;

  return jsonb_build_object(
    'pipeline_count',     v_pipeline_count,
    'closed_30d',         v_closed_30d,
    'active_30d',         v_active_30d,
    'conversion_rate',    v_conversion_rate,
    'revenue_30d',        v_revenue_30d,
    'revenue_prev_30d',   v_revenue_prev_30d,
    'pipeline_revenue',   v_pipeline_revenue,
    'growth_signal',      v_growth_signal,
    'growth_ratio',       round(coalesce(v_growth_ratio, 1)::numeric, 2),
    'sparkline_data',     v_sparkline
  );
end;
$$;
