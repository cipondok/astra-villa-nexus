
-- Wallet accounts table
CREATE TABLE IF NOT EXISTS public.wallet_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  available_balance numeric NOT NULL DEFAULT 0,
  locked_balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'IDR',
  wallet_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Wallet transaction ledger
CREATE TABLE IF NOT EXISTS public.wallet_transaction_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallet_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'IDR',
  external_payment_ref text,
  status text NOT NULL DEFAULT 'pending',
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Payment gateway profiles
CREATE TABLE IF NOT EXISTS public.payment_gateway_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text NOT NULL,
  supported_currencies text[] NOT NULL DEFAULT ARRAY['IDR'],
  is_active boolean NOT NULL DEFAULT true,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payment webhook logs for idempotency
CREATE TABLE IF NOT EXISTS public.payment_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_event_id text NOT NULL UNIQUE,
  provider text NOT NULL,
  event_type text,
  payload jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'processed'
);

-- RLS
ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transaction_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateway_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.wallet_accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can manage wallets" ON public.wallet_accounts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own transactions" ON public.wallet_transaction_ledger
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can manage ledger" ON public.wallet_transaction_ledger
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can view active gateways" ON public.payment_gateway_profiles
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Service role manages webhook logs" ON public.payment_webhook_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Auto-create wallet function
CREATE OR REPLACE FUNCTION public.get_or_create_wallet(p_user_id uuid, p_currency text DEFAULT 'IDR')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id uuid;
BEGIN
  SELECT id INTO v_wallet_id FROM wallet_accounts
    WHERE user_id = p_user_id AND currency = p_currency;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallet_accounts (user_id, currency)
    VALUES (p_user_id, p_currency)
    ON CONFLICT (user_id, currency) DO NOTHING
    RETURNING id INTO v_wallet_id;
    
    IF v_wallet_id IS NULL THEN
      SELECT id INTO v_wallet_id FROM wallet_accounts
        WHERE user_id = p_user_id AND currency = p_currency;
    END IF;
  END IF;
  
  RETURN v_wallet_id;
END;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_user ON public.wallet_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet ON public.wallet_transaction_ledger(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user ON public.wallet_transaction_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_status ON public.wallet_transaction_ledger(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event ON public.payment_webhook_logs(webhook_event_id);

-- Seed default gateway profiles
INSERT INTO public.payment_gateway_profiles (provider_name, supported_currencies)
VALUES 
  ('midtrans', ARRAY['IDR']),
  ('stripe', ARRAY['USD', 'EUR', 'SGD', 'AUD']),
  ('xendit', ARRAY['IDR', 'PHP']),
  ('wise', ARRAY['USD', 'EUR', 'GBP', 'SGD', 'AUD'])
ON CONFLICT DO NOTHING;
