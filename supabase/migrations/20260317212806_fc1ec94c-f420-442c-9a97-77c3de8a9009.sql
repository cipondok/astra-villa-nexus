
-- User activation milestones tracking
CREATE TABLE public.user_activation_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_type text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, milestone_type)
);

-- Index for fast lookups
CREATE INDEX idx_activation_milestones_user ON public.user_activation_milestones(user_id);
CREATE INDEX idx_activation_milestones_type ON public.user_activation_milestones(milestone_type);
CREATE INDEX idx_activation_milestones_completed ON public.user_activation_milestones(completed_at);

-- Enable RLS
ALTER TABLE public.user_activation_milestones ENABLE ROW LEVEL SECURITY;

-- Users can read their own milestones
CREATE POLICY "Users can read own milestones"
  ON public.user_activation_milestones
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own milestones
CREATE POLICY "Users can insert own milestones"
  ON public.user_activation_milestones
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin read all (via service role or admin check)
CREATE POLICY "Service role can read all milestones"
  ON public.user_activation_milestones
  FOR SELECT
  TO service_role
  USING (true);

-- RPC to get activation dashboard stats
CREATE OR REPLACE FUNCTION public.get_activation_dashboard_stats(days_back int DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_new_users int;
  activated_users int;
  avg_time_to_search interval;
  avg_time_to_save interval;
  avg_time_to_insight interval;
  avg_time_to_inquiry interval;
BEGIN
  -- Count new users in period
  SELECT count(*) INTO total_new_users
  FROM auth.users
  WHERE created_at >= now() - (days_back || ' days')::interval;

  -- Count users who completed at least 2 milestones
  SELECT count(DISTINCT user_id) INTO activated_users
  FROM user_activation_milestones
  WHERE completed_at >= now() - (days_back || ' days')::interval
  GROUP BY user_id
  HAVING count(*) >= 2;

  IF activated_users IS NULL THEN activated_users := 0; END IF;

  -- Average time to first search
  SELECT avg(m.completed_at - u.created_at) INTO avg_time_to_search
  FROM user_activation_milestones m
  JOIN auth.users u ON u.id = m.user_id
  WHERE m.milestone_type = 'first_search'
    AND m.completed_at >= now() - (days_back || ' days')::interval;

  -- Average time to first save
  SELECT avg(m.completed_at - u.created_at) INTO avg_time_to_save
  FROM user_activation_milestones m
  JOIN auth.users u ON u.id = m.user_id
  WHERE m.milestone_type = 'first_save'
    AND m.completed_at >= now() - (days_back || ' days')::interval;

  -- Average time to insight view
  SELECT avg(m.completed_at - u.created_at) INTO avg_time_to_insight
  FROM user_activation_milestones m
  JOIN auth.users u ON u.id = m.user_id
  WHERE m.milestone_type = 'first_insight_view'
    AND m.completed_at >= now() - (days_back || ' days')::interval;

  -- Average time to first inquiry
  SELECT avg(m.completed_at - u.created_at) INTO avg_time_to_inquiry
  FROM user_activation_milestones m
  JOIN auth.users u ON u.id = m.user_id
  WHERE m.milestone_type = 'first_inquiry'
    AND m.completed_at >= now() - (days_back || ' days')::interval;

  result := jsonb_build_object(
    'total_new_users', total_new_users,
    'activated_users', activated_users,
    'activation_rate', CASE WHEN total_new_users > 0 THEN round((activated_users::numeric / total_new_users) * 100, 1) ELSE 0 END,
    'avg_time_to_search_minutes', COALESCE(extract(epoch from avg_time_to_search) / 60, 0)::int,
    'avg_time_to_save_minutes', COALESCE(extract(epoch from avg_time_to_save) / 60, 0)::int,
    'avg_time_to_insight_minutes', COALESCE(extract(epoch from avg_time_to_insight) / 60, 0)::int,
    'avg_time_to_inquiry_minutes', COALESCE(extract(epoch from avg_time_to_inquiry) / 60, 0)::int
  );

  -- Add funnel drop-off data
  result := result || jsonb_build_object(
    'funnel', jsonb_build_object(
      'signed_up', total_new_users,
      'first_search', (SELECT count(DISTINCT user_id) FROM user_activation_milestones WHERE milestone_type = 'first_search' AND completed_at >= now() - (days_back || ' days')::interval),
      'first_save', (SELECT count(DISTINCT user_id) FROM user_activation_milestones WHERE milestone_type = 'first_save' AND completed_at >= now() - (days_back || ' days')::interval),
      'first_insight_view', (SELECT count(DISTINCT user_id) FROM user_activation_milestones WHERE milestone_type = 'first_insight_view' AND completed_at >= now() - (days_back || ' days')::interval),
      'first_inquiry', (SELECT count(DISTINCT user_id) FROM user_activation_milestones WHERE milestone_type = 'first_inquiry' AND completed_at >= now() - (days_back || ' days')::interval)
    )
  );

  RETURN result;
END;
$$;
