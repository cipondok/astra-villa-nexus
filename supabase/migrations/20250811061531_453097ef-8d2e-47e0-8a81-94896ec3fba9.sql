-- ASTRA Token Schema (without created_at indexes to avoid existing schema conflicts)

-- 1) Balances
CREATE TABLE IF NOT EXISTS public.astra_token_balances (
  user_id uuid PRIMARY KEY,
  total_tokens numeric NOT NULL DEFAULT 0,
  available_tokens numeric NOT NULL DEFAULT 0,
  locked_tokens numeric NOT NULL DEFAULT 0,
  lifetime_earned numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='astra_token_balances_user_fk'
  ) THEN
    ALTER TABLE public.astra_token_balances
      ADD CONSTRAINT astra_token_balances_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
ALTER TABLE public.astra_token_balances ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Users can view their own balances' AND tablename='astra_token_balances'
  ) THEN
    CREATE POLICY "Users can view their own balances" ON public.astra_token_balances FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Admins can view all balances' AND tablename='astra_token_balances'
  ) THEN
    CREATE POLICY "Admins can view all balances" ON public.astra_token_balances FOR SELECT USING (check_admin_access());
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_update_astra_balances_updated_at') THEN
    CREATE TRIGGER trg_update_astra_balances_updated_at BEFORE UPDATE ON public.astra_token_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_astra_balances_total ON public.astra_token_balances (total_tokens DESC);

-- 2) Transactions
CREATE TABLE IF NOT EXISTS public.astra_token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_type text NOT NULL,
  amount numeric NOT NULL,
  description text,
  reference_type text,
  reference_id text,
  status text NOT NULL DEFAULT 'completed',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='astra_token_transactions_user_fk'
  ) THEN
    ALTER TABLE public.astra_token_transactions
      ADD CONSTRAINT astra_token_transactions_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
ALTER TABLE public.astra_token_transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Users can view their own transactions' AND tablename='astra_token_transactions'
  ) THEN
    CREATE POLICY "Users can view their own transactions" ON public.astra_token_transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Admins can view all transactions' AND tablename='astra_token_transactions'
  ) THEN
    CREATE POLICY "Admins can view all transactions" ON public.astra_token_transactions FOR SELECT USING (check_admin_access());
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_astra_tx_user ON public.astra_token_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_astra_tx_type ON public.astra_token_transactions (transaction_type);

-- 3) Daily Check-ins
CREATE TABLE IF NOT EXISTS public.astra_daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  checkin_date date NOT NULL,
  streak_count integer NOT NULL DEFAULT 1,
  tokens_earned numeric NOT NULL DEFAULT 0,
  bonus_multiplier numeric NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT astra_daily_checkins_unique UNIQUE (user_id, checkin_date)
);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='astra_daily_checkins_user_fk'
  ) THEN
    ALTER TABLE public.astra_daily_checkins
      ADD CONSTRAINT astra_daily_checkins_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
ALTER TABLE public.astra_daily_checkins ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Users can view their own checkins' AND tablename='astra_daily_checkins'
  ) THEN
    CREATE POLICY "Users can view their own checkins" ON public.astra_daily_checkins FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Admins can view all checkins' AND tablename='astra_daily_checkins'
  ) THEN
    CREATE POLICY "Admins can view all checkins" ON public.astra_daily_checkins FOR SELECT USING (check_admin_access());
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_astra_checkins_user_date ON public.astra_daily_checkins (user_id, checkin_date DESC);

-- 4) Reward Config
CREATE TABLE IF NOT EXISTS public.astra_reward_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_type text NOT NULL,
  user_role public.user_role NOT NULL,
  reward_amount numeric NOT NULL DEFAULT 0,
  percentage_rate numeric NOT NULL DEFAULT 0,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='astra_reward_config_unique_active'
  ) THEN
    ALTER TABLE public.astra_reward_config
      ADD CONSTRAINT astra_reward_config_unique_active UNIQUE (reward_type, user_role, is_active);
  END IF;
END $$;
ALTER TABLE public.astra_reward_config ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Anyone can view reward config' AND tablename='astra_reward_config'
  ) THEN
    CREATE POLICY "Anyone can view reward config" ON public.astra_reward_config FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Admins can manage reward config' AND tablename='astra_reward_config'
  ) THEN
    CREATE POLICY "Admins can manage reward config" ON public.astra_reward_config FOR ALL USING (check_admin_access()) WITH CHECK (check_admin_access());
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_update_astra_reward_config_updated_at') THEN
    CREATE TRIGGER trg_update_astra_reward_config_updated_at BEFORE UPDATE ON public.astra_reward_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 5) Reward Claims
CREATE TABLE IF NOT EXISTS public.astra_reward_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  claim_type text NOT NULL,
  amount numeric NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='astra_reward_claims_user_fk'
  ) THEN
    ALTER TABLE public.astra_reward_claims
      ADD CONSTRAINT astra_reward_claims_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='astra_reward_claims_unique'
  ) THEN
    ALTER TABLE public.astra_reward_claims
      ADD CONSTRAINT astra_reward_claims_unique UNIQUE (user_id, claim_type);
  END IF;
END $$;
ALTER TABLE public.astra_reward_claims ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Users can view their own claims' AND tablename='astra_reward_claims'
  ) THEN
    CREATE POLICY "Users can view their own claims" ON public.astra_reward_claims FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Admins can view all claims' AND tablename='astra_reward_claims'
  ) THEN
    CREATE POLICY "Admins can view all claims" ON public.astra_reward_claims FOR SELECT USING (check_admin_access());
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_astra_claims_user ON public.astra_reward_claims (user_id);

-- 6) Referrals
CREATE TABLE IF NOT EXISTS public.astra_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  referrer_reward numeric NOT NULL DEFAULT 0,
  referred_reward numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='astra_referrals_referrer_fk'
  ) THEN
    ALTER TABLE public.astra_referrals
      ADD CONSTRAINT astra_referrals_referrer_fk FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='astra_referrals_referred_fk'
  ) THEN
    ALTER TABLE public.astra_referrals
      ADD CONSTRAINT astra_referrals_referred_fk FOREIGN KEY (referred_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
ALTER TABLE public.astra_referrals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Users can view their own referrals' AND tablename='astra_referrals'
  ) THEN
    CREATE POLICY "Users can view their own referrals" ON public.astra_referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Admins can view all referrals' AND tablename='astra_referrals'
  ) THEN
    CREATE POLICY "Admins can view all referrals" ON public.astra_referrals FOR SELECT USING (check_admin_access());
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_astra_referrals_users ON public.astra_referrals (referrer_id, referred_id);

-- 7) Transfers
CREATE TABLE IF NOT EXISTS public.astra_token_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  amount numeric NOT NULL,
  transfer_fee numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  transfer_type text NOT NULL DEFAULT 'user_transfer',
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='astra_token_transfers_sender_id_fkey'
  ) THEN
    ALTER TABLE public.astra_token_transfers
      ADD CONSTRAINT astra_token_transfers_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='astra_token_transfers_recipient_id_fkey'
  ) THEN
    ALTER TABLE public.astra_token_transfers
      ADD CONSTRAINT astra_token_transfers_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
ALTER TABLE public.astra_token_transfers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Users can view their own transfers' AND tablename='astra_token_transfers'
  ) THEN
    CREATE POLICY "Users can view their own transfers" ON public.astra_token_transfers FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='Admins can view all transfers' AND tablename='astra_token_transfers'
  ) THEN
    CREATE POLICY "Admins can view all transfers" ON public.astra_token_transfers FOR SELECT USING (check_admin_access());
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_astra_transfers_users ON public.astra_token_transfers (sender_id, recipient_id);


SELECT 'ASTRA token schema ensured (no created_at indexes)' AS status;