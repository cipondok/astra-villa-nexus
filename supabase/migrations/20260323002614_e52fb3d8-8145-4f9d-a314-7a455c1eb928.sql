
-- Deal transactions table for cross-border escrow lifecycle
CREATE TABLE IF NOT EXISTS public.deal_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.property_offers(id) ON DELETE SET NULL,
  buyer_user_id UUID NOT NULL,
  seller_user_id UUID,
  agent_id UUID,
  deal_status TEXT NOT NULL DEFAULT 'inquiry_submitted'
    CHECK (deal_status IN (
      'inquiry_submitted','negotiation_active','reservation_pending_payment',
      'deposit_secured_escrow','legal_due_diligence','final_payment_processing',
      'completed','cancelled','dispute_open'
    )),
  agreed_price NUMERIC,
  deposit_amount NUMERIC,
  deposit_deadline TIMESTAMPTZ,
  escrow_account_reference TEXT,
  escrow_id UUID REFERENCES public.escrow_transactions(id) ON DELETE SET NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  country_origin TEXT DEFAULT 'ID',
  fx_rate_snapshot NUMERIC,
  fx_snapshot_at TIMESTAMPTZ,
  state_history JSONB DEFAULT '[]'::jsonb,
  risk_score INTEGER DEFAULT 0,
  cancellation_reason TEXT,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Commission rules table
CREATE TABLE IF NOT EXISTS public.deal_commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_type TEXT NOT NULL DEFAULT 'sale' CHECK (deal_type IN ('sale','rent','investment')),
  commission_percentage NUMERIC NOT NULL DEFAULT 2.5,
  agent_split_percentage NUMERIC NOT NULL DEFAULT 70,
  referral_fee_percentage NUMERIC DEFAULT 0,
  min_deal_value NUMERIC DEFAULT 0,
  max_deal_value NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal dispute tracking
CREATE TABLE IF NOT EXISTS public.deal_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deal_transactions(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL,
  dispute_type TEXT NOT NULL DEFAULT 'general'
    CHECK (dispute_type IN ('fraud','non_delivery','misrepresentation','payment','general')),
  description TEXT,
  evidence_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','under_review','resolved_refund','resolved_release','resolved_partial','closed')),
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  escrow_frozen BOOLEAN DEFAULT true,
  refund_amount NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal state transition audit log
CREATE TABLE IF NOT EXISTS public.deal_state_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deal_transactions(id) ON DELETE CASCADE,
  from_state TEXT,
  to_state TEXT NOT NULL,
  triggered_by UUID,
  trigger_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deal_transactions_buyer ON public.deal_transactions(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_deal_transactions_seller ON public.deal_transactions(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_deal_transactions_status ON public.deal_transactions(deal_status);
CREATE INDEX IF NOT EXISTS idx_deal_transactions_property ON public.deal_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_deal_disputes_deal ON public.deal_disputes(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_state_log_deal ON public.deal_state_log(deal_id);

-- RLS
ALTER TABLE public.deal_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_state_log ENABLE ROW LEVEL SECURITY;

-- Deal transactions: participants can view their own deals
CREATE POLICY "Users view own deals" ON public.deal_transactions
  FOR SELECT TO authenticated
  USING (buyer_user_id = auth.uid() OR seller_user_id = auth.uid() OR agent_id = auth.uid());

-- Commission rules: readable by all authenticated
CREATE POLICY "Read commission rules" ON public.deal_commission_rules
  FOR SELECT TO authenticated USING (true);

-- Disputes: participants can view
CREATE POLICY "View own disputes" ON public.deal_disputes
  FOR SELECT TO authenticated
  USING (raised_by = auth.uid() OR deal_id IN (
    SELECT id FROM public.deal_transactions WHERE buyer_user_id = auth.uid() OR seller_user_id = auth.uid()
  ));

-- Disputes: authenticated can create
CREATE POLICY "Create disputes" ON public.deal_disputes
  FOR INSERT TO authenticated WITH CHECK (raised_by = auth.uid());

-- State log: participants can view
CREATE POLICY "View own deal logs" ON public.deal_state_log
  FOR SELECT TO authenticated
  USING (deal_id IN (
    SELECT id FROM public.deal_transactions WHERE buyer_user_id = auth.uid() OR seller_user_id = auth.uid() OR agent_id = auth.uid()
  ));

-- Insert default commission rules
INSERT INTO public.deal_commission_rules (deal_type, commission_percentage, agent_split_percentage, referral_fee_percentage)
VALUES 
  ('sale', 2.5, 70, 5),
  ('rent', 5.0, 60, 3),
  ('investment', 2.0, 75, 5);
