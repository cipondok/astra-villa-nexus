
-- Data moat metrics: tracks depth/health of each intelligence pillar
CREATE TABLE public.data_moat_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar text NOT NULL, -- behavioral_demand, transaction_velocity, vendor_performance, capital_behavior, liquidity_index
  metric_name text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  previous_value numeric DEFAULT 0,
  unit text DEFAULT 'count',
  data_points_total bigint DEFAULT 0,
  data_points_30d bigint DEFAULT 0,
  freshness_hours numeric DEFAULT 0,
  replication_difficulty_score integer DEFAULT 50, -- 0-100, how hard to replicate
  competitive_advantage_score integer DEFAULT 50, -- 0-100
  monetization_ready boolean DEFAULT false,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pillar, metric_name, snapshot_date)
);

ALTER TABLE public.data_moat_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read data moat metrics"
  ON public.data_moat_metrics
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin insert data moat metrics"
  ON public.data_moat_metrics
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Intelligence API access log for monetization tracking
CREATE TABLE public.intelligence_api_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  data_tier text DEFAULT 'basic', -- basic, premium, enterprise
  revenue_generated numeric DEFAULT 0,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.intelligence_api_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read api access log"
  ON public.intelligence_api_access_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System insert api access log"
  ON public.intelligence_api_access_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
