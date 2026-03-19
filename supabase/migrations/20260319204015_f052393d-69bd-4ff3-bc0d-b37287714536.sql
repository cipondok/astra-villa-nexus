
-- ============================================================
-- PHASE A: VENDOR SUPPLY ENGINE EXTENSIONS
-- Extend vendor_business_profiles with deal conversion metrics
-- ============================================================

ALTER TABLE public.vendor_business_profiles 
  ADD COLUMN IF NOT EXISTS deal_conversion_rate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_deals_closed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_leads_received integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_response_minutes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- Vendor leads pipeline (incoming opportunities for vendors)
CREATE TABLE IF NOT EXISTS public.vendor_leads_pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES public.vendor_business_profiles(id) ON DELETE CASCADE NOT NULL,
  lead_source text NOT NULL DEFAULT 'organic',
  lead_type text NOT NULL DEFAULT 'service_inquiry',
  client_name text,
  client_email text,
  client_phone text,
  property_id uuid,
  service_id uuid REFERENCES public.vendor_services(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'medium',
  deal_value numeric DEFAULT 0,
  notes text,
  first_response_at timestamptz,
  converted_at timestamptz,
  lost_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_leads_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own leads" ON public.vendor_leads_pipeline
  FOR SELECT TO authenticated
  USING (vendor_id IN (
    SELECT id FROM public.vendor_business_profiles WHERE vendor_id = auth.uid()
  ));

CREATE POLICY "Vendors can update own leads" ON public.vendor_leads_pipeline
  FOR UPDATE TO authenticated
  USING (vendor_id IN (
    SELECT id FROM public.vendor_business_profiles WHERE vendor_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create leads" ON public.vendor_leads_pipeline
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_vendor_leads_vendor_id ON public.vendor_leads_pipeline(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_status ON public.vendor_leads_pipeline(status);

-- ============================================================
-- PHASE B: PROPERTY VIEWINGS & DEAL ACTIVATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.property_viewings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  agent_id uuid NOT NULL,
  investor_id uuid NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text NOT NULL DEFAULT 'requested',
  viewing_type text NOT NULL DEFAULT 'in_person',
  location_notes text,
  agent_notes text,
  investor_notes text,
  feedback_rating integer,
  feedback_text text,
  offer_triggered boolean DEFAULT false,
  offer_probability numeric DEFAULT 0,
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  reminder_sent boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_viewings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own viewings" ON public.property_viewings
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR investor_id = auth.uid());

CREATE POLICY "Agents can manage own viewings" ON public.property_viewings
  FOR UPDATE TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "Authenticated users can request viewings" ON public.property_viewings
  FOR INSERT TO authenticated
  WITH CHECK (investor_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_viewings_property ON public.property_viewings(property_id);
CREATE INDEX IF NOT EXISTS idx_viewings_agent ON public.property_viewings(agent_id);
CREATE INDEX IF NOT EXISTS idx_viewings_investor ON public.property_viewings(investor_id);
CREATE INDEX IF NOT EXISTS idx_viewings_scheduled ON public.property_viewings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_viewings_status ON public.property_viewings(status);

-- ============================================================
-- PHASE C: TRANSACTION COMPLETION ENGINE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES public.property_offers(id) ON DELETE SET NULL,
  property_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid,
  agent_id uuid,
  escrow_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'IDR',
  payment_gateway text DEFAULT 'midtrans',
  gateway_transaction_id text,
  gateway_status text,
  payment_method text,
  payment_proof_url text,
  status text NOT NULL DEFAULT 'initiated',
  initiated_at timestamptz DEFAULT now(),
  funds_received_at timestamptz,
  funds_released_at timestamptz,
  refunded_at timestamptz,
  refund_reason text,
  legal_verification_status text DEFAULT 'pending',
  legal_verified_at timestamptz,
  legal_verified_by uuid,
  legal_notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view own escrow" ON public.escrow_transactions
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR agent_id = auth.uid());

CREATE POLICY "System can insert escrow" ON public.escrow_transactions
  FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_escrow_offer ON public.escrow_transactions(offer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON public.escrow_transactions(status);

-- Extend property_offers with deal lifecycle columns
ALTER TABLE public.property_offers
  ADD COLUMN IF NOT EXISTS deal_stage text DEFAULT 'inquiry',
  ADD COLUMN IF NOT EXISTS viewing_id uuid,
  ADD COLUMN IF NOT EXISTS payment_initiated_at timestamptz,
  ADD COLUMN IF NOT EXISTS legal_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS deal_closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS escrow_id uuid,
  ADD COLUMN IF NOT EXISTS deal_state_history jsonb DEFAULT '[]'::jsonb;

-- ============================================================
-- PHASE D: COMMISSION AUTOMATION
-- ============================================================

ALTER TABLE public.transaction_commissions
  ADD COLUMN IF NOT EXISTS offer_id uuid,
  ADD COLUMN IF NOT EXISTS commission_type text DEFAULT 'agent_split',
  ADD COLUMN IF NOT EXISTS agent_split_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS affiliate_reward_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vendor_service_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_id uuid,
  ADD COLUMN IF NOT EXISTS settlement_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_reference text;

-- ============================================================
-- PHASE E: MARKETPLACE TRUST LAYER
-- ============================================================

CREATE TABLE IF NOT EXISTS public.dispute_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL DEFAULT ('DSP-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  dispute_type text NOT NULL DEFAULT 'general',
  related_offer_id uuid REFERENCES public.property_offers(id) ON DELETE SET NULL,
  related_escrow_id uuid REFERENCES public.escrow_transactions(id) ON DELETE SET NULL,
  related_property_id uuid,
  complainant_id uuid NOT NULL,
  respondent_id uuid,
  subject text NOT NULL,
  description text,
  evidence_urls jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  assigned_to uuid,
  resolution_type text,
  resolution_notes text,
  resolution_amount numeric,
  escalated_at timestamptz,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dispute_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view own disputes" ON public.dispute_cases
  FOR SELECT TO authenticated
  USING (complainant_id = auth.uid() OR respondent_id = auth.uid());

CREATE POLICY "Authenticated users can create disputes" ON public.dispute_cases
  FOR INSERT TO authenticated
  WITH CHECK (complainant_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.dispute_cases(status);
CREATE INDEX IF NOT EXISTS idx_disputes_complainant ON public.dispute_cases(complainant_id);

-- Listing expiry scheduler
CREATE TABLE IF NOT EXISTS public.listing_expiry_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  warning_sent boolean DEFAULT false,
  warning_sent_at timestamptz,
  auto_action text NOT NULL DEFAULT 'downgrade_visibility',
  action_executed boolean DEFAULT false,
  action_executed_at timestamptz,
  renewal_requested boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_expiry_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own expiry" ON public.listing_expiry_schedule
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_expiry_property ON public.listing_expiry_schedule(property_id);
CREATE INDEX IF NOT EXISTS idx_expiry_date ON public.listing_expiry_schedule(expires_at);

-- Agent no-response tracking
CREATE TABLE IF NOT EXISTS public.agent_response_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  inquiry_id text,
  inquiry_type text NOT NULL DEFAULT 'viewing_request',
  received_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  response_time_minutes integer,
  is_overdue boolean DEFAULT false,
  alert_triggered boolean DEFAULT false,
  alert_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_response_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own tracking" ON public.agent_response_tracking
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_agent_response_agent ON public.agent_response_tracking(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_response_overdue ON public.agent_response_tracking(is_overdue);

-- ============================================================
-- PHASE F: INTELLIGENCE ACTIVATION HOOKS
-- Marketplace event signal function
-- ============================================================

CREATE OR REPLACE FUNCTION public.emit_marketplace_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  signal_type text;
  signal_payload jsonb;
BEGIN
  -- Property viewings signals
  IF TG_TABLE_NAME = 'property_viewings' THEN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
      signal_type := 'viewing_completed';
      signal_payload := jsonb_build_object(
        'property_id', NEW.property_id,
        'agent_id', NEW.agent_id,
        'investor_id', NEW.investor_id,
        'offer_probability', NEW.offer_probability
      );
    END IF;
  END IF;

  -- Property offers signals
  IF TG_TABLE_NAME = 'property_offers' THEN
    IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
      signal_type := 'offer_rejected';
      signal_payload := jsonb_build_object(
        'property_id', NEW.property_id,
        'offer_price', NEW.offer_price,
        'rejection_reason', NEW.rejection_reason
      );
    ELSIF NEW.deal_stage = 'closed' AND (OLD.deal_stage IS NULL OR OLD.deal_stage != 'closed') THEN
      signal_type := 'deal_closed';
      signal_payload := jsonb_build_object(
        'property_id', NEW.property_id,
        'final_price', COALESCE(NEW.counter_price, NEW.offer_price),
        'days_to_close', EXTRACT(DAY FROM (now() - NEW.created_at))
      );
    END IF;
  END IF;

  IF signal_type IS NOT NULL THEN
    INSERT INTO public.ai_event_signals (
      event_type, entity_type, entity_id, payload, priority_level
    ) VALUES (
      signal_type,
      TG_TABLE_NAME,
      NEW.id::text,
      signal_payload,
      CASE 
        WHEN signal_type = 'deal_closed' THEN 'high'
        ELSE 'medium'
      END
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach triggers for marketplace intelligence
CREATE OR REPLACE TRIGGER trg_viewing_signals
  AFTER UPDATE ON public.property_viewings
  FOR EACH ROW
  EXECUTE FUNCTION public.emit_marketplace_signal();

CREATE OR REPLACE TRIGGER trg_offer_signals
  AFTER UPDATE ON public.property_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.emit_marketplace_signal();
