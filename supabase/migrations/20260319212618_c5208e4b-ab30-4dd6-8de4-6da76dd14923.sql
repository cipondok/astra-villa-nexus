
-- ============================================================
-- AI VENDOR MARKETPLACE GROWTH ORCHESTRATOR SCHEMA
-- Extends existing vendor ecosystem with expansion intelligence,
-- campaign planning, competition stabilization, and balance scoring.
-- ============================================================

-- 1. District Vendor Supply Pressure & Balance Score
CREATE TABLE public.district_marketplace_balance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  segment_type text,
  -- Supply pressure metrics
  vendor_supply_pressure numeric DEFAULT 0,
  vendor_category_gap_index numeric DEFAULT 0,
  investor_demand_to_vendor_ratio numeric DEFAULT 0,
  service_completion_delay_risk numeric DEFAULT 0,
  -- Composite marketplace balance
  marketplace_balance_score numeric DEFAULT 0,
  demand_liquidity_weight numeric DEFAULT 0,
  vendor_supply_depth numeric DEFAULT 0,
  deal_velocity numeric DEFAULT 0,
  investor_interest_growth numeric DEFAULT 0,
  oversupply_penalty numeric DEFAULT 0,
  -- Competition stabilization
  oversupply_detected boolean DEFAULT false,
  price_war_risk_level text DEFAULT 'low' CHECK (price_war_risk_level IN ('low','moderate','high','critical')),
  lead_starvation_pct numeric DEFAULT 0,
  recommended_action text,
  -- Meta
  scoring_inputs jsonb DEFAULT '{}',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_dmb_district ON public.district_marketplace_balance(district);
CREATE INDEX idx_dmb_balance ON public.district_marketplace_balance(marketplace_balance_score DESC);
CREATE UNIQUE INDEX idx_dmb_district_segment ON public.district_marketplace_balance(district, COALESCE(segment_type, '__all__'));

ALTER TABLE public.district_marketplace_balance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read district_marketplace_balance" ON public.district_marketplace_balance FOR SELECT USING (true);

-- 2. Vendor Growth Campaigns
CREATE TABLE public.vendor_growth_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  campaign_type text NOT NULL DEFAULT 'acquisition',
  district text NOT NULL,
  segment_type text,
  target_vendor_category text NOT NULL,
  target_vendor_count int NOT NULL DEFAULT 5,
  acquired_vendor_count int DEFAULT 0,
  budget_allocated numeric DEFAULT 0,
  budget_spent numeric DEFAULT 0,
  roi numeric DEFAULT 0,
  urgency_score numeric DEFAULT 0,
  trigger_reason text,
  trigger_metrics jsonb DEFAULT '{}',
  status text DEFAULT 'planned' CHECK (status IN ('planned','active','paused','completed','cancelled')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_vgc_status ON public.vendor_growth_campaigns(status);
CREATE INDEX idx_vgc_district ON public.vendor_growth_campaigns(district);

ALTER TABLE public.vendor_growth_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read vendor_growth_campaigns" ON public.vendor_growth_campaigns FOR SELECT USING (true);

-- 3. Vendor Category Expansion Targets
CREATE TABLE public.vendor_category_expansion_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  service_category text NOT NULL,
  segment_type text,
  current_vendor_count int DEFAULT 0,
  target_vendor_count int DEFAULT 0,
  category_gap_index numeric DEFAULT 0,
  demand_signal_strength numeric DEFAULT 0,
  priority_rank int DEFAULT 0,
  expansion_status text DEFAULT 'identified' CHECK (expansion_status IN ('identified','targeting','recruiting','fulfilled','oversupplied')),
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_vcet_uniq ON public.vendor_category_expansion_targets(district, service_category, COALESCE(segment_type, '__all__'));

ALTER TABLE public.vendor_category_expansion_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read vendor_category_expansion_targets" ON public.vendor_category_expansion_targets FOR SELECT USING (true);

-- 4. Expansion Sequencing Brain
CREATE TABLE public.expansion_sequencing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  district text NOT NULL,
  segment_type text,
  vendor_category text NOT NULL,
  sequence_rank int NOT NULL DEFAULT 0,
  capital_inflow_score numeric DEFAULT 0,
  liquidity_acceleration numeric DEFAULT 0,
  market_share_opportunity numeric DEFAULT 0,
  composite_expansion_score numeric DEFAULT 0,
  recommended_campaign_id uuid REFERENCES public.vendor_growth_campaigns(id) ON DELETE SET NULL,
  status text DEFAULT 'queued' CHECK (status IN ('queued','in_progress','launched','completed','skipped')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_esq_rank ON public.expansion_sequencing_queue(sequence_rank);
CREATE INDEX idx_esq_score ON public.expansion_sequencing_queue(composite_expansion_score DESC);

ALTER TABLE public.expansion_sequencing_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read expansion_sequencing_queue" ON public.expansion_sequencing_queue FOR SELECT USING (true);

-- 5. AI Campaign Budget Allocator snapshots
CREATE TABLE public.ai_campaign_budget_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.vendor_growth_campaigns(id) ON DELETE CASCADE,
  district text NOT NULL,
  allocation_amount numeric NOT NULL DEFAULT 0,
  expected_roi numeric DEFAULT 0,
  marketplace_balance_at_allocation numeric DEFAULT 0,
  rationale text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_campaign_budget_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read ai_campaign_budget_allocations" ON public.ai_campaign_budget_allocations FOR SELECT USING (true);

-- 6. Trigger: auto-generate growth campaign when supply gap is critical
CREATE OR REPLACE FUNCTION public.auto_generate_vendor_growth_campaign()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.category_gap_index >= 70 AND NEW.expansion_status = 'identified' THEN
    INSERT INTO public.vendor_growth_campaigns (
      campaign_name, campaign_type, district, segment_type,
      target_vendor_category, target_vendor_count,
      urgency_score, trigger_reason, trigger_metrics, status
    ) VALUES (
      'Acquire ' || NEW.target_vendor_count || ' ' || NEW.service_category || ' vendors in ' || NEW.district,
      'acquisition',
      NEW.district,
      NEW.segment_type,
      NEW.service_category,
      GREATEST(NEW.target_vendor_count - NEW.current_vendor_count, 3),
      NEW.category_gap_index,
      'Auto: category_gap_index >= 70',
      jsonb_build_object('gap_index', NEW.category_gap_index, 'demand_signal', NEW.demand_signal_strength),
      'planned'
    )
    ON CONFLICT DO NOTHING;

    UPDATE public.vendor_category_expansion_targets
    SET expansion_status = 'targeting'
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_vendor_campaign
AFTER INSERT OR UPDATE ON public.vendor_category_expansion_targets
FOR EACH ROW EXECUTE FUNCTION public.auto_generate_vendor_growth_campaign();
