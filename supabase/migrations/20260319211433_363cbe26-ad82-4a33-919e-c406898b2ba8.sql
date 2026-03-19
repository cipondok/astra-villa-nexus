
-- =============================================
-- VENDOR MARKETPLACE INTELLIGENCE LAYER
-- Extends existing vendor_business_profiles, vendor_services, vendor_leads_pipeline
-- =============================================

-- 1. Vendor Intelligence Scores (AI-computed composite scoring)
CREATE TABLE IF NOT EXISTS public.vendor_intelligence_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendor_business_profiles(id) ON DELETE CASCADE,
  demand_score integer DEFAULT 0 CHECK (demand_score BETWEEN 0 AND 100),
  performance_score integer DEFAULT 0 CHECK (performance_score BETWEEN 0 AND 100),
  growth_priority_score integer DEFAULT 0 CHECK (growth_priority_score BETWEEN 0 AND 100),
  composite_rank_score integer DEFAULT 0 CHECK (composite_rank_score BETWEEN 0 AND 100),
  scoring_breakdown jsonb DEFAULT '{}',
  district_demand_signals jsonb DEFAULT '{}',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (vendor_id)
);

ALTER TABLE public.vendor_intelligence_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors read own intelligence scores"
ON public.vendor_intelligence_scores FOR SELECT TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()
  )
);

CREATE POLICY "Service role manages vendor scores"
ON public.vendor_intelligence_scores FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_vis_composite ON public.vendor_intelligence_scores (composite_rank_score DESC);
CREATE INDEX idx_vis_demand ON public.vendor_intelligence_scores (demand_score DESC);

-- 2. Vendor Service Regions (geo coverage for matching)
CREATE TABLE IF NOT EXISTS public.vendor_service_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendor_business_profiles(id) ON DELETE CASCADE,
  district text NOT NULL,
  province text,
  segment_types text[] DEFAULT '{}',
  is_primary boolean DEFAULT false,
  max_capacity_per_month integer DEFAULT 10,
  current_active_jobs integer DEFAULT 0,
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'full', 'inactive')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (vendor_id, district)
);

ALTER TABLE public.vendor_service_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read vendor regions"
ON public.vendor_service_regions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Vendors manage own regions"
ON public.vendor_service_regions FOR ALL TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()
  )
)
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()
  )
);

CREATE POLICY "Service role manages regions"
ON public.vendor_service_regions FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_vsr_district ON public.vendor_service_regions (district, availability_status);

-- 3. Vendor Match Results (AI matching log)
CREATE TABLE IF NOT EXISTS public.vendor_match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  requester_role text NOT NULL CHECK (requester_role IN ('property_owner', 'agent', 'investor', 'admin')),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  district text NOT NULL,
  segment_type text,
  service_category text NOT NULL,
  matched_vendor_id uuid NOT NULL REFERENCES public.vendor_business_profiles(id) ON DELETE CASCADE,
  match_score integer DEFAULT 0 CHECK (match_score BETWEEN 0 AND 100),
  match_factors jsonb DEFAULT '{}',
  status text DEFAULT 'suggested' CHECK (status IN ('suggested', 'contacted', 'accepted', 'rejected', 'completed')),
  contacted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.vendor_match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own match results"
ON public.vendor_match_results FOR SELECT TO authenticated
USING (requester_id = auth.uid() OR matched_vendor_id IN (
  SELECT id FROM vendor_business_profiles WHERE vendor_id = auth.uid()
));

CREATE POLICY "Service role manages matches"
ON public.vendor_match_results FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_vmr_requester ON public.vendor_match_results (requester_id, status);
CREATE INDEX idx_vmr_vendor ON public.vendor_match_results (matched_vendor_id, status);
CREATE INDEX idx_vmr_district ON public.vendor_match_results (district, service_category);

-- 4. Vendor Demand Routing (flywheel → vendor lead generation)
CREATE TABLE IF NOT EXISTS public.vendor_demand_routing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type text NOT NULL CHECK (trigger_type IN (
    'supply_gap', 'hotspot_rise', 'absorption_spike',
    'high_dom', 'investor_activity', 'deal_closed'
  )),
  district text NOT NULL,
  segment_type text,
  target_service_categories text[] NOT NULL,
  vendor_ids_notified uuid[] DEFAULT '{}',
  leads_generated integer DEFAULT 0,
  campaign_action text CHECK (campaign_action IN (
    'vendor_lead', 'onboarding_campaign', 'content_boost', 'priority_listing'
  )),
  supporting_metrics jsonb DEFAULT '{}',
  processed boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.vendor_demand_routing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read demand routing"
ON public.vendor_demand_routing FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Service role manages demand routing"
ON public.vendor_demand_routing FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_vdr_unprocessed ON public.vendor_demand_routing (processed, created_at) WHERE processed = false;

-- 5. Trigger: auto-route vendor demand on supply_acquisition_targets update
CREATE OR REPLACE FUNCTION public.route_vendor_demand_on_supply_target()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_categories text[];
BEGIN
  -- Only fire on high-priority targets
  IF NEW.action_priority NOT IN ('critical', 'high') THEN
    RETURN NEW;
  END IF;

  -- Map recommended_action to vendor service categories
  CASE NEW.recommended_action
    WHEN 'agent_outreach' THEN v_categories := ARRAY['property_management', 'real_estate_agent'];
    WHEN 'developer_pitch' THEN v_categories := ARRAY['construction', 'development'];
    WHEN 'vendor_activation' THEN v_categories := ARRAY['renovation', 'interior_design', 'photography'];
    WHEN 'influencer_campaign' THEN v_categories := ARRAY['marketing', 'photography', 'staging'];
    ELSE v_categories := ARRAY['general'];
  END CASE;

  INSERT INTO vendor_demand_routing (
    trigger_type, district, segment_type,
    target_service_categories, campaign_action, supporting_metrics
  ) VALUES (
    'supply_gap',
    NEW.district,
    NEW.segment_type,
    v_categories,
    CASE
      WHEN NEW.recommended_action = 'agent_outreach' THEN 'vendor_lead'
      WHEN NEW.recommended_action = 'developer_pitch' THEN 'onboarding_campaign'
      WHEN NEW.recommended_action = 'influencer_campaign' THEN 'content_boost'
      ELSE 'vendor_lead'
    END,
    jsonb_build_object(
      'supply_gap_score', NEW.supply_gap_score,
      'liquidity_index', NEW.liquidity_strength_index,
      'active_listings', NEW.active_listings,
      'demand_velocity', NEW.demand_velocity
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vendor_demand_on_supply
AFTER INSERT OR UPDATE OF action_priority, recommended_action ON public.supply_acquisition_targets
FOR EACH ROW EXECUTE FUNCTION public.route_vendor_demand_on_supply_target();
