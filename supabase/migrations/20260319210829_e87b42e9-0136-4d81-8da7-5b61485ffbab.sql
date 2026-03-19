
-- =============================================
-- LIQUIDITY FLYWHEEL ENGINE SCHEMA
-- =============================================

-- 1. Investor Liquidity Alerts
CREATE TABLE IF NOT EXISTS public.investor_liquidity_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  district text,
  segment_type text,
  alert_type text NOT NULL CHECK (alert_type IN (
    'hot_liquidity', 'rising_demand', 'fast_absorption',
    'district_deal_closed', 'yield_shift', 'supply_squeeze'
  )),
  urgency_score integer NOT NULL DEFAULT 50 CHECK (urgency_score BETWEEN 0 AND 100),
  title text NOT NULL,
  description text,
  supporting_metrics jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  triggered_at timestamptz DEFAULT now(),
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.investor_liquidity_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investors read own liquidity alerts"
ON public.investor_liquidity_alerts FOR SELECT TO authenticated
USING (investor_id = auth.uid());

CREATE POLICY "Investors update own alerts"
ON public.investor_liquidity_alerts FOR UPDATE TO authenticated
USING (investor_id = auth.uid())
WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Service role manages all alerts"
ON public.investor_liquidity_alerts FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_ila_investor_unread ON public.investor_liquidity_alerts (investor_id, is_read) WHERE is_read = false;
CREATE INDEX idx_ila_district ON public.investor_liquidity_alerts (district, alert_type);
CREATE INDEX idx_ila_urgency ON public.investor_liquidity_alerts (urgency_score DESC);

-- 2. Supply Acquisition Targets (materialized view-like table)
CREATE TABLE IF NOT EXISTS public.supply_acquisition_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  segment_type text NOT NULL,
  liquidity_strength_index integer DEFAULT 0,
  supply_gap_score integer DEFAULT 0 CHECK (supply_gap_score BETWEEN 0 AND 100),
  demand_velocity numeric DEFAULT 0,
  active_listings integer DEFAULT 0,
  avg_days_to_close numeric DEFAULT 0,
  investor_interest_count integer DEFAULT 0,
  recommended_action text CHECK (recommended_action IN (
    'agent_outreach', 'developer_pitch', 'vendor_activation',
    'influencer_campaign', 'price_incentive', 'monitor'
  )),
  action_priority text DEFAULT 'medium' CHECK (action_priority IN ('critical', 'high', 'medium', 'low')),
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (district, segment_type)
);

ALTER TABLE public.supply_acquisition_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read supply targets"
ON public.supply_acquisition_targets FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Service role manages supply targets"
ON public.supply_acquisition_targets FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- 3. Market Story Signals
CREATE TABLE IF NOT EXISTS public.market_story_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_type text NOT NULL CHECK (story_type IN (
    'hotspot_rise', 'investor_rush', 'yield_shift',
    'absorption_spike', 'supply_crisis', 'price_momentum',
    'new_district_activity', 'deal_velocity_surge'
  )),
  district text NOT NULL,
  segment_type text,
  headline text NOT NULL,
  narrative text,
  supporting_metrics jsonb DEFAULT '{}',
  content_priority_score integer DEFAULT 50 CHECK (content_priority_score BETWEEN 0 AND 100),
  is_published boolean DEFAULT false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.market_story_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read market stories"
ON public.market_story_signals FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Service role manages market stories"
ON public.market_story_signals FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_mss_priority ON public.market_story_signals (content_priority_score DESC) WHERE is_published = false;
CREATE INDEX idx_mss_district ON public.market_story_signals (district, story_type);

-- 4. Automation trigger: when liquidity metrics update, enqueue flywheel signal
CREATE OR REPLACE FUNCTION public.enqueue_flywheel_on_liquidity_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when liquidity index changes significantly (>5 points)
  IF OLD IS NULL OR ABS(NEW.liquidity_strength_index - COALESCE(OLD.liquidity_strength_index, 0)) > 5 THEN
    INSERT INTO ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'liquidity_flywheel_trigger',
      'market_liquidity_metrics',
      NEW.id::text,
      CASE
        WHEN NEW.liquidity_strength_index >= 70 THEN 'high'
        WHEN NEW.liquidity_strength_index >= 40 THEN 'medium'
        ELSE 'low'
      END,
      jsonb_build_object(
        'district', NEW.district,
        'segment_type', NEW.segment_type,
        'liquidity_index', NEW.liquidity_strength_index,
        'previous_index', COALESCE(OLD.liquidity_strength_index, 0),
        'momentum', NEW.momentum_trend,
        'absorption_rate', NEW.absorption_rate
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_flywheel_on_liquidity
AFTER INSERT OR UPDATE ON public.market_liquidity_metrics
FOR EACH ROW EXECUTE FUNCTION public.enqueue_flywheel_on_liquidity_update();
