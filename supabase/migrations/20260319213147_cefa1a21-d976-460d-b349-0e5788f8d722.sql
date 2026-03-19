
-- ============================================================
-- AI INVESTOR CAPITAL ALLOCATION ENGINE SCHEMA
-- Extends existing intelligence with capital gravity, portfolio
-- flow, syndication, bubble risk, and capital sequencing.
-- ============================================================

-- 1. Capital Gravity Score per District
CREATE TABLE public.district_capital_gravity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  city text,
  segment_type text,
  -- Component scores (0-100)
  liquidity_acceleration_score numeric DEFAULT 0,
  absorption_velocity_score numeric DEFAULT 0,
  vendor_execution_depth_score numeric DEFAULT 0,
  deal_close_reliability_score numeric DEFAULT 0,
  price_appreciation_momentum numeric DEFAULT 0,
  supply_gap_persistence_score numeric DEFAULT 0,
  -- Composite
  capital_gravity_score numeric DEFAULT 0,
  gravity_tier text DEFAULT 'neutral' CHECK (gravity_tier IN ('magnet','strong','neutral','weak','repellent')),
  scoring_weights jsonb DEFAULT '{"liquidity":0.25,"absorption":0.20,"vendor":0.15,"deal_close":0.15,"appreciation":0.15,"supply_gap":0.10}',
  scoring_inputs jsonb DEFAULT '{}',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_dcg_district_segment ON public.district_capital_gravity(district, COALESCE(segment_type, '__all__'));
CREATE INDEX idx_dcg_gravity ON public.district_capital_gravity(capital_gravity_score DESC);
CREATE INDEX idx_dcg_tier ON public.district_capital_gravity(gravity_tier);

ALTER TABLE public.district_capital_gravity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read district_capital_gravity" ON public.district_capital_gravity FOR SELECT USING (true);

-- 2. Portfolio Flow Intelligence
CREATE TABLE public.investor_portfolio_flow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  segment_type text,
  period_month text NOT NULL,
  -- Flow metrics
  capital_inflow_idr numeric DEFAULT 0,
  capital_outflow_idr numeric DEFAULT 0,
  net_flow_idr numeric DEFAULT 0,
  unique_investors int DEFAULT 0,
  -- Risk signals
  investor_concentration_hhi numeric DEFAULT 0,
  district_saturation_pct numeric DEFAULT 0,
  capital_rotation_signal text DEFAULT 'stable' CHECK (capital_rotation_signal IN ('inflow_surge','stable','mild_outflow','capital_flight')),
  -- Intelligence
  top_investor_share_pct numeric DEFAULT 0,
  avg_ticket_size numeric DEFAULT 0,
  flow_trend text DEFAULT 'flat' CHECK (flow_trend IN ('accelerating','growing','flat','declining','collapsing')),
  insights jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_ipf_district_period ON public.investor_portfolio_flow(district, COALESCE(segment_type, '__all__'), period_month);
CREATE INDEX idx_ipf_flow ON public.investor_portfolio_flow(net_flow_idr DESC);

ALTER TABLE public.investor_portfolio_flow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read investor_portfolio_flow" ON public.investor_portfolio_flow FOR SELECT USING (true);

-- 3. Institutional Syndication Brain
CREATE TABLE public.institutional_deal_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_name text NOT NULL,
  district text NOT NULL,
  segment_type text,
  cluster_type text DEFAULT 'co_investment' CHECK (cluster_type IN ('co_investment','syndication','capital_pool','bulk_acquisition')),
  -- Cluster metrics
  total_deal_value_idr numeric DEFAULT 0,
  participating_funds int DEFAULT 0,
  target_properties int DEFAULT 0,
  min_ticket_idr numeric DEFAULT 0,
  target_irr_pct numeric DEFAULT 0,
  capital_gravity_at_creation numeric DEFAULT 0,
  -- Status
  status text DEFAULT 'identified' CHECK (status IN ('identified','forming','active','closed','dissolved')),
  ai_rationale text,
  supporting_metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_idc_district ON public.institutional_deal_clusters(district);
CREATE INDEX idx_idc_status ON public.institutional_deal_clusters(status);

ALTER TABLE public.institutional_deal_clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read institutional_deal_clusters" ON public.institutional_deal_clusters FOR SELECT USING (true);

-- 4. Bubble Risk Detection
CREATE TABLE public.district_bubble_risk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  segment_type text,
  -- Risk components (0-100)
  liquidity_overheat_score numeric DEFAULT 0,
  speculative_pricing_divergence numeric DEFAULT 0,
  offer_frenzy_index numeric DEFAULT 0,
  capital_concentration_risk numeric DEFAULT 0,
  price_to_fundamental_ratio numeric DEFAULT 1.0,
  -- Composite
  bubble_risk_score numeric DEFAULT 0,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low','elevated','high','critical')),
  -- AI recommendations
  recommended_actions jsonb DEFAULT '[]',
  roi_adjustment_factor numeric DEFAULT 1.0,
  cooling_signal_emitted boolean DEFAULT false,
  narrative text,
  scoring_inputs jsonb DEFAULT '{}',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_dbr_district_segment ON public.district_bubble_risk(district, COALESCE(segment_type, '__all__'));
CREATE INDEX idx_dbr_risk ON public.district_bubble_risk(bubble_risk_score DESC);

ALTER TABLE public.district_bubble_risk ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read district_bubble_risk" ON public.district_bubble_risk FOR SELECT USING (true);

-- 5. Capital Sequencing Engine
CREATE TABLE public.capital_sequencing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  district text NOT NULL,
  segment_type text,
  asset_class text,
  sequence_rank int NOT NULL DEFAULT 0,
  -- Scoring factors
  risk_adjusted_liquidity_yield numeric DEFAULT 0,
  time_to_exit_score numeric DEFAULT 0,
  deal_pipeline_density numeric DEFAULT 0,
  capital_gravity_score numeric DEFAULT 0,
  bubble_risk_discount numeric DEFAULT 0,
  -- Composite
  capital_priority_score numeric DEFAULT 0,
  recommended_allocation_pct numeric DEFAULT 0,
  ai_rationale text,
  status text DEFAULT 'queued' CHECK (status IN ('queued','recommended','allocated','deployed','completed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_csq_rank ON public.capital_sequencing_queue(sequence_rank);
CREATE INDEX idx_csq_priority ON public.capital_sequencing_queue(capital_priority_score DESC);

ALTER TABLE public.capital_sequencing_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read capital_sequencing_queue" ON public.capital_sequencing_queue FOR SELECT USING (true);

-- 6. Trigger: emit AI signal when bubble risk goes critical
CREATE OR REPLACE FUNCTION public.emit_bubble_risk_signal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.risk_level = 'critical' AND (OLD IS NULL OR OLD.risk_level != 'critical') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'bubble_risk_critical',
      'district',
      NEW.district,
      'critical',
      jsonb_build_object(
        'district', NEW.district,
        'bubble_risk_score', NEW.bubble_risk_score,
        'narrative', NEW.narrative,
        'roi_adjustment', NEW.roi_adjustment_factor
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bubble_risk_signal
AFTER INSERT OR UPDATE ON public.district_bubble_risk
FOR EACH ROW EXECUTE FUNCTION public.emit_bubble_risk_signal();
