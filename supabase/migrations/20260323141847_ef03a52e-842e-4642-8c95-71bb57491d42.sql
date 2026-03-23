
-- Marketplace Strategy Signals
CREATE TABLE IF NOT EXISTS public.marketplace_strategy_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text,
  city text NOT NULL,
  segment text DEFAULT 'mixed',
  supply_score numeric DEFAULT 0,
  demand_score numeric DEFAULT 0,
  liquidity_score numeric DEFAULT 0,
  capital_flow_score numeric DEFAULT 0,
  pricing_momentum_score numeric DEFAULT 0,
  investor_sentiment_score numeric DEFAULT 0,
  strategy_priority_index numeric DEFAULT 0,
  recommended_strategy text,
  confidence_level text DEFAULT 'moderate',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_strategy_signals_city ON public.marketplace_strategy_signals(city);
CREATE INDEX idx_strategy_signals_priority ON public.marketplace_strategy_signals(strategy_priority_index DESC);
CREATE INDEX idx_strategy_signals_created ON public.marketplace_strategy_signals(created_at);

-- Strategy Execution Log
CREATE TABLE IF NOT EXISTS public.strategy_execution_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_type text NOT NULL,
  region text,
  city text,
  execution_mode text DEFAULT 'advisory',
  action_payload_json jsonb DEFAULT '{}',
  expected_impact_score numeric DEFAULT 0,
  executed_at timestamptz DEFAULT now(),
  outcome_metric_json jsonb,
  status text DEFAULT 'pending'
);

CREATE INDEX idx_strategy_exec_type ON public.strategy_execution_log(strategy_type);
CREATE INDEX idx_strategy_exec_status ON public.strategy_execution_log(status);

-- Inventory Allocation Signals
CREATE TABLE IF NOT EXISTS public.inventory_allocation_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  segment text,
  oversupply_flag boolean DEFAULT false,
  boost_multiplier numeric DEFAULT 1.0,
  ranking_adjustment numeric DEFAULT 0,
  rebalance_action text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_inventory_alloc_city ON public.inventory_allocation_signals(city);

-- Strategy Outcome Training Data
CREATE TABLE IF NOT EXISTS public.strategy_outcome_training (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_signal_id uuid REFERENCES public.marketplace_strategy_signals(id),
  execution_id uuid REFERENCES public.strategy_execution_log(id),
  expected_impact numeric,
  actual_impact numeric,
  roi_efficiency numeric,
  measured_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.marketplace_strategy_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_allocation_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_outcome_training ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read strategy signals" ON public.marketplace_strategy_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read strategy exec" ON public.strategy_execution_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inventory alloc" ON public.inventory_allocation_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read strategy training" ON public.strategy_outcome_training FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert strategy signals" ON public.marketplace_strategy_signals FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert strategy exec" ON public.strategy_execution_log FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update strategy exec" ON public.strategy_execution_log FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert inventory alloc" ON public.inventory_allocation_signals FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert strategy training" ON public.strategy_outcome_training FOR INSERT TO service_role WITH CHECK (true);
