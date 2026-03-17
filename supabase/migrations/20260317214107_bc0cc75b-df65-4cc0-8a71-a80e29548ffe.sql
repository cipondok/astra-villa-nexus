
-- RPC to fetch daily growth monitor metrics
CREATE OR REPLACE FUNCTION public.get_daily_growth_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  today_start timestamptz := date_trunc('day', now());
  week_start timestamptz := date_trunc('week', now());
BEGIN
  result := jsonb_build_object(
    -- Supply metrics
    'total_active_listings', (SELECT count(*) FROM properties WHERE status = 'active'),
    'new_listings_today', (SELECT count(*) FROM properties WHERE created_at >= today_start),
    'new_listings_yesterday', (SELECT count(*) FROM properties WHERE created_at >= today_start - interval '1 day' AND created_at < today_start),
    'developer_projects', (SELECT count(*) FROM properties WHERE property_type ILIKE '%project%' OR property_type ILIKE '%development%'),

    -- Demand metrics
    'new_users_today', (SELECT count(*) FROM profiles WHERE created_at >= today_start),
    'new_users_yesterday', (SELECT count(*) FROM profiles WHERE created_at >= today_start - interval '1 day' AND created_at < today_start),
    'watchlist_actions_today', (SELECT count(*) FROM user_interactions WHERE interaction_type = 'save' AND created_at >= today_start),
    'watchlist_actions_yesterday', (SELECT count(*) FROM user_interactions WHERE interaction_type = 'save' AND created_at >= today_start - interval '1 day' AND created_at < today_start),
    'inquiries_today', (SELECT count(*) FROM user_interactions WHERE interaction_type = 'contact' AND created_at >= today_start),
    'inquiries_yesterday', (SELECT count(*) FROM user_interactions WHERE interaction_type = 'contact' AND created_at >= today_start - interval '1 day' AND created_at < today_start),

    -- Transaction pipeline
    'active_negotiations', (SELECT count(*) FROM property_offers WHERE status IN ('pending', 'counter_offer', 'negotiating')),
    'offers_today', (SELECT count(*) FROM property_offers WHERE created_at >= today_start),
    'offers_yesterday', (SELECT count(*) FROM property_offers WHERE created_at >= today_start - interval '1 day' AND created_at < today_start),
    'deals_closed_week', (SELECT count(*) FROM property_offers WHERE status = 'accepted' AND updated_at >= week_start),

    -- Growth momentum
    'referral_signups', (SELECT count(*) FROM acquisition_referrals WHERE created_at >= today_start),
    'social_traffic_leads', (SELECT count(*) FROM acquisition_analytics WHERE channel IN ('social', 'referral') AND date = CURRENT_DATE),
    'ai_alert_engagement', (SELECT count(*) FROM user_interactions WHERE interaction_type = 'view' AND created_at >= today_start),

    -- 7-day trend data
    'daily_trend', (
      SELECT coalesce(jsonb_agg(day_data ORDER BY d), '[]'::jsonb)
      FROM (
        SELECT
          d,
          jsonb_build_object(
            'date', d::text,
            'listings', (SELECT count(*) FROM properties WHERE created_at::date = d),
            'users', (SELECT count(*) FROM profiles WHERE created_at::date = d),
            'inquiries', (SELECT count(*) FROM user_interactions WHERE interaction_type = 'contact' AND created_at::date = d),
            'offers', (SELECT count(*) FROM property_offers WHERE created_at::date = d)
          ) AS day_data
        FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day'::interval) AS d
      ) sub
    )
  );

  RETURN result;
END;
$$;
