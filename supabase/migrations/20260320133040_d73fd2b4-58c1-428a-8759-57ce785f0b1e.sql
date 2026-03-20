
-- Revenue experiments table for pricing A/B tests
CREATE TABLE public.revenue_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name text NOT NULL,
  experiment_type text NOT NULL DEFAULT 'pricing', -- pricing, commission, upsell, slot
  status text NOT NULL DEFAULT 'draft', -- draft, active, paused, completed
  variant_a jsonb NOT NULL DEFAULT '{}'::jsonb, -- control config
  variant_b jsonb NOT NULL DEFAULT '{}'::jsonb, -- test config
  traffic_split_pct integer NOT NULL DEFAULT 50, -- % going to variant B
  target_metric text NOT NULL DEFAULT 'conversion_rate', -- what we measure
  baseline_value numeric DEFAULT 0,
  variant_a_result numeric DEFAULT 0,
  variant_b_result numeric DEFAULT 0,
  sample_size_target integer DEFAULT 100,
  current_sample_a integer DEFAULT 0,
  current_sample_b integer DEFAULT 0,
  confidence_pct numeric DEFAULT 0,
  winner text, -- 'a', 'b', or null
  started_at timestamptz,
  ended_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on revenue_experiments"
  ON public.revenue_experiments
  FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

-- Revenue snapshots for velocity forecasting
CREATE TABLE public.revenue_daily_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  transaction_revenue numeric DEFAULT 0,
  subscription_revenue numeric DEFAULT 0,
  vendor_revenue numeric DEFAULT 0,
  escrow_fees numeric DEFAULT 0,
  referral_revenue numeric DEFAULT 0,
  premium_slot_revenue numeric DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  deal_count integer DEFAULT 0,
  active_subscribers integer DEFAULT 0,
  active_vendors integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);

ALTER TABLE public.revenue_daily_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read revenue snapshots"
  ON public.revenue_daily_snapshots
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System insert revenue snapshots"
  ON public.revenue_daily_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
