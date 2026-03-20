
-- ═══════════════════════════════════════════════════════════
-- INSTITUTIONAL CAPITAL DOMINATION (ICD) SCHEMA
-- ═══════════════════════════════════════════════════════════

-- 1. Institutional Trust Stack
CREATE TABLE public.icd_trust_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_driver TEXT NOT NULL DEFAULT 'governance_transparency',
  driver_label TEXT NOT NULL,
  trust_score NUMERIC NOT NULL DEFAULT 50,
  previous_score NUMERIC DEFAULT 50,
  governance_grade TEXT DEFAULT 'B',
  execution_cadence_consistency NUMERIC DEFAULT 50,
  capital_discipline_rating NUMERIC DEFAULT 50,
  audit_trail_completeness NUMERIC DEFAULT 0,
  board_independence_pct NUMERIC DEFAULT 0,
  disclosure_quality_index NUMERIC DEFAULT 50,
  institutional_feedback TEXT,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Strategic Capital Alignment
CREATE TABLE public.icd_capital_alignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alignment_type TEXT NOT NULL DEFAULT 'co_investment',
  partner_segment TEXT DEFAULT 'growth_equity',
  alignment_score NUMERIC NOT NULL DEFAULT 50,
  shared_value_index NUMERIC DEFAULT 0,
  co_investment_capacity_usd NUMERIC DEFAULT 0,
  collaboration_depth TEXT DEFAULT 'exploratory',
  market_overlap_pct NUMERIC DEFAULT 0,
  strategic_fit_score NUMERIC DEFAULT 50,
  narrative_coherence NUMERIC DEFAULT 50,
  active_initiatives INT DEFAULT 0,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Capital Partnership Lifecycle
CREATE TABLE public.icd_partnership_lifecycle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_type TEXT DEFAULT 'institutional_fund',
  lifecycle_stage TEXT NOT NULL DEFAULT 'initial_engagement',
  engagement_score NUMERIC DEFAULT 0,
  capital_deployed_usd NUMERIC DEFAULT 0,
  touchpoints_count INT DEFAULT 0,
  relationship_duration_months INT DEFAULT 0,
  escalation_readiness NUMERIC DEFAULT 0,
  integration_depth TEXT DEFAULT 'none',
  next_milestone TEXT,
  risk_of_churn NUMERIC DEFAULT 0,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Platform Stability Signaling
CREATE TABLE public.icd_stability_signaling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_dimension TEXT NOT NULL DEFAULT 'revenue_resilience',
  stability_score NUMERIC NOT NULL DEFAULT 50,
  previous_score NUMERIC DEFAULT 50,
  revenue_predictability NUMERIC DEFAULT 50,
  liquidity_durability_index NUMERIC DEFAULT 50,
  operational_risk_maturity TEXT DEFAULT 'developing',
  churn_rate_pct NUMERIC DEFAULT 0,
  recurring_revenue_pct NUMERIC DEFAULT 0,
  stress_test_result TEXT,
  communication_effectiveness NUMERIC DEFAULT 50,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Multi-Cycle Capital Relationship
CREATE TABLE public.icd_multi_cycle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_context TEXT NOT NULL DEFAULT 'expansion',
  confidence_score NUMERIC NOT NULL DEFAULT 50,
  previous_confidence NUMERIC DEFAULT 50,
  confidence_trend TEXT DEFAULT 'stable',
  positioning_strength NUMERIC DEFAULT 50,
  valuation_credibility NUMERIC DEFAULT 50,
  narrative_consistency NUMERIC DEFAULT 50,
  resilience_demonstrated BOOLEAN DEFAULT false,
  cycle_transitions_navigated INT DEFAULT 0,
  investor_retention_pct NUMERIC DEFAULT 0,
  strategic_adaptations JSONB DEFAULT '[]',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_icd_trust_driver ON public.icd_trust_stack(trust_driver);
CREATE INDEX idx_icd_trust_assessed ON public.icd_trust_stack(assessed_at DESC);
CREATE INDEX idx_icd_alignment_type ON public.icd_capital_alignment(alignment_type);
CREATE INDEX idx_icd_lifecycle_stage ON public.icd_partnership_lifecycle(lifecycle_stage);
CREATE INDEX idx_icd_lifecycle_assessed ON public.icd_partnership_lifecycle(assessed_at DESC);
CREATE INDEX idx_icd_stability_dim ON public.icd_stability_signaling(signal_dimension);
CREATE INDEX idx_icd_multicycle_context ON public.icd_multi_cycle(cycle_context);
CREATE INDEX idx_icd_multicycle_assessed ON public.icd_multi_cycle(assessed_at DESC);

-- RLS
ALTER TABLE public.icd_trust_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd_capital_alignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd_partnership_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd_stability_signaling ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd_multi_cycle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read icd_trust_stack" ON public.icd_trust_stack FOR SELECT USING (true);
CREATE POLICY "Allow read icd_capital_alignment" ON public.icd_capital_alignment FOR SELECT USING (true);
CREATE POLICY "Allow read icd_partnership_lifecycle" ON public.icd_partnership_lifecycle FOR SELECT USING (true);
CREATE POLICY "Allow read icd_stability_signaling" ON public.icd_stability_signaling FOR SELECT USING (true);
CREATE POLICY "Allow read icd_multi_cycle" ON public.icd_multi_cycle FOR SELECT USING (true);

-- Trigger: alert on partnership churn risk
CREATE OR REPLACE FUNCTION public.fn_icd_churn_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.risk_of_churn >= 70 AND NEW.capital_deployed_usd > 1000000 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'icd_churn_risk',
      'icd_partnership',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'partner', NEW.partner_name,
        'stage', NEW.lifecycle_stage,
        'churn_risk', NEW.risk_of_churn,
        'capital_deployed', NEW.capital_deployed_usd
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_icd_churn_alert
  AFTER INSERT ON public.icd_partnership_lifecycle
  FOR EACH ROW EXECUTE FUNCTION public.fn_icd_churn_alert();
