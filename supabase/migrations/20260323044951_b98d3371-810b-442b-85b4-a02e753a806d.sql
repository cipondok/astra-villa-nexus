
-- Add FX conversion fields to wallet_transaction_ledger
ALTER TABLE public.wallet_transaction_ledger
  ADD COLUMN IF NOT EXISTS original_currency text,
  ADD COLUMN IF NOT EXISTS original_amount numeric,
  ADD COLUMN IF NOT EXISTS fx_rate_used numeric,
  ADD COLUMN IF NOT EXISTS fx_source text;

-- Add EUR support to currency store via fx_rate_snapshots if needed
-- Ensure fx_rate_snapshots exists (already in types)
-- Add daily FX snapshot table for admin monitoring
CREATE TABLE IF NOT EXISTS public.daily_fx_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL DEFAULT 'IDR',
  target_currency text NOT NULL,
  rate numeric NOT NULL,
  inverse_rate numeric NOT NULL,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  source text DEFAULT 'frankfurter',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(base_currency, target_currency, snapshot_date)
);

ALTER TABLE public.daily_fx_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view FX snapshots" ON public.daily_fx_snapshots
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role manages FX snapshots" ON public.daily_fx_snapshots
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_daily_fx_date ON public.daily_fx_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_fx_currency ON public.daily_fx_snapshots(target_currency, snapshot_date DESC);
