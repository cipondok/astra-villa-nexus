
create or replace function public.get_listing_optimization_alerts()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total           bigint;
  v_critical        bigint;
  v_warning         bigint;
  v_healthy         bigint;
  v_avg_deal        numeric;
  v_avg_seo         numeric;
  v_insight         text;
  v_priority_action text;
begin
  -- Count listings in each alert level using LEFT JOINs
  with scored as (
    select
      p.id,
      coalesce(d.deal_score, 0) as deal_score,
      coalesce(s.seo_score, 0) as seo_score,
      case
        when coalesce(d.deal_score, 0) < 30 or coalesce(s.seo_score, 0) < 40 then 'critical'
        when coalesce(d.deal_score, 0) <= 50 or coalesce(s.seo_score, 0) <= 60 then 'warning'
        else 'healthy'
      end as alert_level
    from properties p
    left join lateral (
      select deal_score from property_deal_analysis
      where property_id = p.id
      order by created_at desc limit 1
    ) d on true
    left join lateral (
      select seo_score from property_seo_analysis
      where property_id = p.id
      order by last_analyzed_at desc nulls last limit 1
    ) s on true
    where p.status = 'available'
  )
  select
    count(*),
    count(*) filter (where alert_level = 'critical'),
    count(*) filter (where alert_level = 'warning'),
    count(*) filter (where alert_level = 'healthy'),
    coalesce(round(avg(deal_score)::numeric, 1), 0),
    coalesce(round(avg(seo_score)::numeric, 1), 0)
  into v_total, v_critical, v_warning, v_healthy, v_avg_deal, v_avg_seo
  from scored;

  -- Generate insight message
  v_insight := case
    when v_critical > v_total * 0.3 then
      v_critical || ' listings need urgent optimization — low deal scores or poor SEO visibility'
    when v_warning > v_total * 0.4 then
      v_warning || ' listings have moderate issues — review SEO titles and pricing competitiveness'
    when v_healthy > v_total * 0.7 then
      'Portfolio health is strong — ' || v_healthy || ' of ' || v_total || ' listings performing well'
    else
      'Mixed portfolio health — prioritize ' || v_critical || ' critical listings for immediate review'
  end;

  -- Suggest priority action
  v_priority_action := case
    when v_avg_seo < 40 then 'PRIORITY: Run bulk SEO optimization — average SEO score is critically low'
    when v_avg_deal < 30 then 'PRIORITY: Review pricing strategy — average deal attractiveness is very low'
    when v_avg_seo < 60 then 'RECOMMENDED: Improve SEO content for underperforming listings'
    when v_avg_deal < 50 then 'RECOMMENDED: Adjust pricing or enhance listing descriptions'
    else 'MAINTAIN: Continue monitoring — portfolio is well-optimized'
  end;

  return jsonb_build_object(
    'total_listings',    v_total,
    'critical_count',    v_critical,
    'warning_count',     v_warning,
    'healthy_count',     v_healthy,
    'avg_deal_score',    v_avg_deal,
    'avg_seo_score',     v_avg_seo,
    'insight_message',   v_insight,
    'priority_action',   v_priority_action
  );
end;
$$;
