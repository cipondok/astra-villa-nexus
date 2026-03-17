
CREATE OR REPLACE FUNCTION public.get_admin_revenue_intelligence()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  sales_data jsonb;
  rental_data jsonb;
  vendor_data jsonb;
  subscription_data jsonb;
  top_agents jsonb;
  city_breakdown jsonb;
  daily_series jsonb;
BEGIN
  -- Sales commissions
  SELECT jsonb_build_object(
    'total_transaction_value', COALESCE(SUM(transaction_amount), 0),
    'total_commission', COALESCE(SUM(commission_amount), 0),
    'avg_commission_rate', COALESCE(AVG(commission_rate), 0),
    'transaction_count', COUNT(*),
    'this_month_commission', COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', now()) THEN commission_amount ELSE 0 END), 0),
    'prev_month_commission', COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', now() - interval '1 month') AND created_at < date_trunc('month', now()) THEN commission_amount ELSE 0 END), 0)
  ) INTO sales_data
  FROM transaction_commissions;

  -- Rental revenue
  SELECT jsonb_build_object(
    'total_revenue', COALESCE(SUM(total_amount), 0),
    'active_contracts', COUNT(*) FILTER (WHERE booking_status = 'confirmed'),
    'completed_bookings', COUNT(*) FILTER (WHERE booking_status = 'completed'),
    'avg_booking_value', COALESCE(AVG(total_amount), 0),
    'this_month_revenue', COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', now()) THEN total_amount ELSE 0 END), 0),
    'total_bookings', COUNT(*)
  ) INTO rental_data
  FROM rental_bookings;

  -- Vendor marketplace revenue
  SELECT jsonb_build_object(
    'total_revenue', COALESCE(SUM(total_amount), 0),
    'total_bookings', COUNT(*),
    'completed_bookings', COUNT(*) FILTER (WHERE status = 'completed'),
    'completion_rate', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed'))::numeric / COUNT(*)::numeric * 100, 1) ELSE 0 END,
    'platform_fee_total', COALESCE(SUM(platform_fee), 0),
    'provider_earnings_total', COALESCE(SUM(provider_amount), 0),
    'this_month_revenue', COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', now()) THEN total_amount ELSE 0 END), 0)
  ) INTO vendor_data
  FROM vendor_bookings;

  -- Subscription revenue
  SELECT jsonb_build_object(
    'active_subscribers', COUNT(*) FILTER (WHERE status = 'active'),
    'total_subscribers', COUNT(*),
    'mrr', COALESCE(SUM(CASE WHEN status = 'active' AND billing_cycle = 'monthly' THEN amount
                         WHEN status = 'active' AND billing_cycle = 'yearly' THEN amount / 12
                         ELSE 0 END), 0),
    'plan_distribution', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('plan', plan_type, 'count', cnt)), '[]'::jsonb)
      FROM (SELECT plan_type, COUNT(*) as cnt FROM user_subscriptions WHERE status = 'active' GROUP BY plan_type) sub
    ),
    'churned_this_month', COUNT(*) FILTER (WHERE status = 'cancelled' AND updated_at >= date_trunc('month', now()))
  ) INTO subscription_data
  FROM user_subscriptions;

  -- Top 5 agents by commission
  SELECT COALESCE(jsonb_agg(agent_row ORDER BY total_comm DESC), '[]'::jsonb)
  INTO top_agents
  FROM (
    SELECT jsonb_build_object(
      'agent_id', tc.agent_id,
      'full_name', COALESCE(p.full_name, 'Unknown Agent'),
      'avatar_url', p.avatar_url,
      'total_commission', SUM(tc.commission_amount),
      'transaction_count', COUNT(*)
    ) as agent_row,
    SUM(tc.commission_amount) as total_comm
    FROM transaction_commissions tc
    LEFT JOIN profiles p ON p.id = tc.agent_id
    WHERE tc.agent_id IS NOT NULL
    GROUP BY tc.agent_id, p.full_name, p.avatar_url
    ORDER BY total_comm DESC
    LIMIT 5
  ) ranked;

  -- City breakdown
  SELECT COALESCE(jsonb_agg(city_row ORDER BY revenue DESC), '[]'::jsonb)
  INTO city_breakdown
  FROM (
    SELECT jsonb_build_object(
      'city', COALESCE(pr.city, 'Unknown'),
      'transactions', COUNT(pl.id),
      'revenue', COALESCE(SUM(pl.amount), 0),
      'avg_value', COALESCE(AVG(pl.amount), 0)
    ) as city_row,
    COALESCE(SUM(pl.amount), 0) as revenue
    FROM payment_logs pl
    LEFT JOIN properties pr ON pr.id::text = pl.booking_id::text
    WHERE pl.payment_status = 'completed'
    GROUP BY pr.city
    ORDER BY revenue DESC
    LIMIT 15
  ) cities;

  -- 30-day daily revenue series
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'date', d::date,
    'sales', COALESCE(s.amt, 0),
    'rental', COALESCE(r.amt, 0),
    'vendor', COALESCE(v.amt, 0)
  ) ORDER BY d), '[]'::jsonb)
  INTO daily_series
  FROM generate_series(now() - interval '30 days', now(), interval '1 day') d
  LEFT JOIN (
    SELECT date_trunc('day', created_at) as day, SUM(commission_amount) as amt
    FROM transaction_commissions
    WHERE created_at >= now() - interval '30 days'
    GROUP BY day
  ) s ON s.day = date_trunc('day', d)
  LEFT JOIN (
    SELECT date_trunc('day', created_at) as day, SUM(total_amount) as amt
    FROM rental_bookings
    WHERE created_at >= now() - interval '30 days'
    GROUP BY day
  ) r ON r.day = date_trunc('day', d)
  LEFT JOIN (
    SELECT date_trunc('day', created_at) as day, SUM(total_amount) as amt
    FROM vendor_bookings
    WHERE created_at >= now() - interval '30 days'
    GROUP BY day
  ) v ON v.day = date_trunc('day', d);

  -- Build final result
  result := jsonb_build_object(
    'sales', sales_data,
    'rental', rental_data,
    'vendor', vendor_data,
    'subscriptions', subscription_data,
    'top_agents', top_agents,
    'city_breakdown', city_breakdown,
    'daily_series', daily_series
  );

  RETURN result;
END;
$$;
