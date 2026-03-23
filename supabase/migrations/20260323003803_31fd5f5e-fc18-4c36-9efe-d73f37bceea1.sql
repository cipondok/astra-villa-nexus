
-- Level 3 Escrow Infrastructure: missing tables + deal_transactions upgrades

CREATE TABLE public.escrow_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL,
  deal_id UUID REFERENCES public.deal_transactions(id),
  account_type TEXT NOT NULL,
  debit_amount NUMERIC(18,2) DEFAULT 0,
  credit_amount NUMERIC(18,2) DEFAULT 0,
  currency TEXT DEFAULT 'IDR',
  balance_snapshot NUMERIC(18,2),
  entry_reason TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_escrow_ledger_escrow ON public.escrow_ledger_entries(escrow_id);
CREATE INDEX idx_escrow_ledger_deal ON public.escrow_ledger_entries(deal_id);

CREATE TABLE public.escrow_payout_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deal_transactions(id) NOT NULL,
  escrow_id UUID NOT NULL,
  payout_type TEXT DEFAULT 'full',
  recipient_type TEXT NOT NULL,
  recipient_user_id UUID,
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT DEFAULT 'IDR',
  status TEXT DEFAULT 'pending',
  release_conditions_met BOOLEAN DEFAULT false,
  cooling_period_ends_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_payout_queue_status ON public.escrow_payout_queue(status);

CREATE TABLE public.escrow_system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  deal_id UUID REFERENCES public.deal_transactions(id),
  escrow_id UUID,
  details JSONB DEFAULT '{}',
  triggered_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_escrow_events_type ON public.escrow_system_events(event_type);

-- Upgrade deal_transactions for concurrency & escrow tracking
ALTER TABLE public.deal_transactions ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE public.deal_transactions ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'none';
ALTER TABLE public.deal_transactions ADD COLUMN IF NOT EXISTS funds_received_at TIMESTAMPTZ;
ALTER TABLE public.deal_transactions ADD COLUMN IF NOT EXISTS funds_released_at TIMESTAMPTZ;
ALTER TABLE public.deal_transactions ADD COLUMN IF NOT EXISTS cooling_period_hours INTEGER DEFAULT 72;

-- Add gateway + signature columns to existing payment_webhook_logs
ALTER TABLE public.payment_webhook_logs ADD COLUMN IF NOT EXISTS gateway TEXT;
ALTER TABLE public.payment_webhook_logs ADD COLUMN IF NOT EXISTS webhook_event_id TEXT;
ALTER TABLE public.payment_webhook_logs ADD COLUMN IF NOT EXISTS deal_id UUID;
ALTER TABLE public.payment_webhook_logs ADD COLUMN IF NOT EXISTS escrow_id UUID;
ALTER TABLE public.payment_webhook_logs ADD COLUMN IF NOT EXISTS amount NUMERIC(18,2);
ALTER TABLE public.payment_webhook_logs ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE public.payment_webhook_logs ADD COLUMN IF NOT EXISTS signature_valid BOOLEAN DEFAULT false;
ALTER TABLE public.payment_webhook_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE public.payment_webhook_logs ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'received';

-- Add escrow settlement fields to existing transaction_commissions
ALTER TABLE public.transaction_commissions ADD COLUMN IF NOT EXISTS deal_id UUID;
ALTER TABLE public.transaction_commissions ADD COLUMN IF NOT EXISTS deal_amount NUMERIC(18,2);
ALTER TABLE public.transaction_commissions ADD COLUMN IF NOT EXISTS total_commission NUMERIC(18,2);
ALTER TABLE public.transaction_commissions ADD COLUMN IF NOT EXISTS platform_amount NUMERIC(18,2);
ALTER TABLE public.transaction_commissions ADD COLUMN IF NOT EXISTS agent_amount NUMERIC(18,2);
ALTER TABLE public.transaction_commissions ADD COLUMN IF NOT EXISTS referral_amount NUMERIC(18,2);
ALTER TABLE public.transaction_commissions ADD COLUMN IF NOT EXISTS tax_reserve_amount NUMERIC(18,2);
ALTER TABLE public.transaction_commissions ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
ALTER TABLE public.transaction_commissions ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ;

-- RLS
ALTER TABLE public.escrow_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_payout_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_system_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_escrow_ledger" ON public.escrow_ledger_entries FOR ALL USING (true);
CREATE POLICY "service_payout_queue" ON public.escrow_payout_queue FOR ALL USING (true);
CREATE POLICY "service_escrow_events" ON public.escrow_system_events FOR ALL USING (true);
