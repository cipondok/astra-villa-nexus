
-- ══════════════════════════════════════════════════════════════
-- PROFIT OPTIMIZATION INFRASTRUCTURE
-- ══════════════════════════════════════════════════════════════

-- 1) Profit optimization signals — continuous intelligence snapshots
CREATE TABLE public.profit_optimization_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_domain TEXT NOT NULL CHECK (signal_domain IN ('dynamic_pricing', 'cost_efficiency', 'revenue_opportunity', 'risk_control')),
  signal_type TEXT NOT NULL,
  signal_strength NUMERIC DEFAULT 0,
  confidence_score NUMERIC DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  current_value NUMERIC DEFAULT 0,
  recommended_value NUMERIC,
  projected_impact_pct NUMERIC DEFAULT 0,
  projected_revenue_impact NUMERIC DEFAULT 0,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  auto_executable BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  execution_status TEXT DEFAULT 'pending' CHECK (execution_status IN ('pending', 'approved', 'executing', 'completed', 'rolled_back', 'rejected')),
  rollback_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Profit experiments — A/B tests for monetization
CREATE TABLE public.profit_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT NOT NULL,
  target_domain TEXT NOT NULL CHECK (target_domain IN ('pricing', 'commission', 'subscription', 'vendor_incentive', 'marketing_spend')),
  hypothesis TEXT,
  control_value NUMERIC,
  variant_value NUMERIC,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'rolled_back')),
  confidence_threshold NUMERIC DEFAULT 90,
  current_confidence NUMERIC DEFAULT 0,
  control_conversions INT DEFAULT 0,
  variant_conversions INT DEFAULT 0,
  control_revenue NUMERIC DEFAULT 0,
  variant_revenue NUMERIC DEFAULT 0,
  revenue_impact NUMERIC DEFAULT 0,
  partner_retention_impact NUMERIC DEFAULT 0,
  auto_scale_enabled BOOLEAN DEFAULT false,
  rollback_trigger_threshold NUMERIC DEFAULT -5,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Profit audit log — transparent decision trail
CREATE TABLE public.profit_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  signal_id UUID REFERENCES public.profit_optimization_signals(id),
  experiment_id UUID REFERENCES public.profit_experiments(id),
  decision TEXT NOT NULL,
  confidence_at_decision NUMERIC DEFAULT 0,
  revenue_before NUMERIC,
  revenue_after NUMERIC,
  risk_assessment TEXT,
  decided_by TEXT DEFAULT 'ai_engine',
  admin_override BOOLEAN DEFAULT false,
  override_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4) Daily profit summary — aggregated metrics
CREATE TABLE public.profit_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_date DATE NOT NULL UNIQUE,
  total_revenue NUMERIC DEFAULT 0,
  total_costs NUMERIC DEFAULT 0,
  net_profit NUMERIC DEFAULT 0,
  margin_pct NUMERIC DEFAULT 0,
  signals_generated INT DEFAULT 0,
  signals_executed INT DEFAULT 0,
  signals_rolled_back INT DEFAULT 0,
  experiments_active INT DEFAULT 0,
  experiments_positive INT DEFAULT 0,
  partner_retention_rate NUMERIC DEFAULT 100,
  cost_efficiency_score NUMERIC DEFAULT 0,
  revenue_density_per_user NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profit_signals_domain ON public.profit_optimization_signals(signal_domain);
CREATE INDEX idx_profit_signals_status ON public.profit_optimization_signals(execution_status);
CREATE INDEX idx_profit_signals_created ON public.profit_optimization_signals(created_at DESC);
CREATE INDEX idx_profit_experiments_status ON public.profit_experiments(status);
CREATE INDEX idx_profit_audit_created ON public.profit_audit_log(created_at DESC);
CREATE INDEX idx_profit_daily_date ON public.profit_daily_summary(summary_date DESC);

-- RLS
ALTER TABLE public.profit_optimization_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_daily_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage profit signals" ON public.profit_optimization_signals
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage profit experiments" ON public.profit_experiments
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view profit audit log" ON public.profit_audit_log
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view profit summaries" ON public.profit_daily_summary
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RPC: Aggregate profit dashboard stats
CREATE OR REPLACE FUNCTION public.get_profit_optimization_dashboard()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'signals', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE execution_status = 'pending'),
        'executed', COUNT(*) FILTER (WHERE execution_status = 'completed'),
        'rolled_back', COUNT(*) FILTER (WHERE execution_status = 'rolled_back'),
        'avg_confidence', ROUND(COALESCE(AVG(confidence_score), 0), 1),
        'by_domain', jsonb_build_object(
          'dynamic_pricing', COUNT(*) FILTER (WHERE signal_domain = 'dynamic_pricing'),
          'cost_efficiency', COUNT(*) FILTER (WHERE signal_domain = 'cost_efficiency'),
          'revenue_opportunity', COUNT(*) FILTER (WHERE signal_domain = 'revenue_opportunity'),
          'risk_control', COUNT(*) FILTER (WHERE signal_domain = 'risk_control')
        )
      ) FROM profit_optimization_signals
      WHERE created_at > now() - interval '30 days'
    ),
    'experiments', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'positive_rate', CASE
          WHEN COUNT(*) FILTER (WHERE status = 'completed') > 0
          THEN ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed' AND revenue_impact > 0) / NULLIF(COUNT(*) FILTER (WHERE status = 'completed'), 1), 1)
          ELSE 0
        END,
        'total_revenue_impact', COALESCE(SUM(revenue_impact) FILTER (WHERE status = 'completed'), 0)
      ) FROM profit_experiments
    ),
    'daily_trend', (
      SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.summary_date), '[]'::jsonb)
      FROM (
        SELECT summary_date, total_revenue, total_costs, net_profit, margin_pct,
               cost_efficiency_score, partner_retention_rate
        FROM profit_daily_summary
        ORDER BY summary_date DESC LIMIT 30
      ) t
    ),
    'recent_audit', (
      SELECT COALESCE(jsonb_agg(row_to_json(a)::jsonb ORDER BY a.created_at DESC), '[]'::jsonb)
      FROM (
        SELECT action_type, decision, confidence_at_decision, revenue_before, revenue_after,
               risk_assessment, decided_by, admin_override, created_at
        FROM profit_audit_log
        ORDER BY created_at DESC LIMIT 20
      ) a
    )
  ) INTO result;
  RETURN result;
END;
$$;
