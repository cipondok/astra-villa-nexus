-- ASTRA Token Core Schema
-- Create required tables with RLS and indexes

-- 1) Balances
CREATE TABLE IF NOT EXISTS public.astra_token_balances (
  user_id uuid PRIMARY KEY,
  total_tokens numeric NOT NULL DEFAULT 0,
  available_tokens numeric NOT NULL DEFAULT 0,
  locked_tokens numeric NOT NULL DEFAULT 0,
  lifetime_earned numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT astra_token_balances_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.astra_token_balances ENABLE ROW LEVEL SECURITY;

-- Policies for balances
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'astra_token_balances' AND policyname = 'Users can view their own balances'
  ) THEN
    CREATE POLICY "Users can view their own balances"
      ON public.astra_token_balances
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'astra_token_balances' AND policyname = 'Admins can view all balances'
  ) THEN
    CREATE POLICY "Admins can view all balances"
      ON public.astra_token_balances
      FOR SELECT
      USING (check_admin_access());
  END IF;
END $$;

-- Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_astra_balances_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_astra_balances_updated_at
    BEFORE UPDATE ON public.astra_token_balances
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful index
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
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT astra_token_transactions_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.astra_token_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_token_transactions' AND policyname='Users can view their own transactions'
  ) THEN
    CREATE POLICY "Users can view their own transactions"
      ON public.astra_token_transactions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_token_transactions' AND policyname='Admins can view all transactions'
  ) THEN
    CREATE POLICY "Admins can view all transactions"
      ON public.astra_token_transactions
      FOR SELECT
      USING (check_admin_access());
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_astra_tx_user_created ON public.astra_token_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_astra_tx_type_created ON public.astra_token_transactions (transaction_type, created_at DESC);


-- 3) Daily Check-ins
CREATE TABLE IF NOT EXISTS public.astra_daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  checkin_date date NOT NULL,
  streak_count integer NOT NULL DEFAULT 1,
  tokens_earned numeric NOT NULL DEFAULT 0,
  bonus_multiplier numeric NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT astra_daily_checkins_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT astra_daily_checkins_unique UNIQUE (user_id, checkin_date)
);

ALTER TABLE public.astra_daily_checkins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_daily_checkins' AND policyname='Users can view their own checkins'
  ) THEN
    CREATE POLICY "Users can view their own checkins"
      ON public.astra_daily_checkins
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_daily_checkins' AND policyname='Admins can view all checkins'
  ) THEN
    CREATE POLICY "Admins can view all checkins"
      ON public.astra_daily_checkins
      FOR SELECT
      USING (check_admin_access());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_astra_checkins_user_date ON public.astra_daily_checkins (user_id, checkin_date DESC);


-- 4) Reward Config
CREATE TABLE IF NOT EXISTS public.astra_reward_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_type text NOT NULL, -- e.g., 'welcome_bonus', 'daily_checkin', 'transaction_percentage', 'referral_bonus'
  user_role public.user_role NOT NULL,
  reward_amount numeric NOT NULL DEFAULT 0,
  percentage_rate numeric NOT NULL DEFAULT 0,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT astra_reward_config_unique_active UNIQUE (reward_type, user_role, is_active)
);

ALTER TABLE public.astra_reward_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_reward_config' AND policyname='Anyone can view reward config'
  ) THEN
    CREATE POLICY "Anyone can view reward config"
      ON public.astra_reward_config
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_reward_config' AND policyname='Admins can manage reward config'
  ) THEN
    CREATE POLICY "Admins can manage reward config"
      ON public.astra_reward_config
      FOR ALL
      USING (check_admin_access())
      WITH CHECK (check_admin_access());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_astra_reward_config_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_astra_reward_config_updated_at
    BEFORE UPDATE ON public.astra_reward_config
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- 5) Reward Claims
CREATE TABLE IF NOT EXISTS public.astra_reward_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  claim_type text NOT NULL, -- e.g., 'welcome_bonus'
  amount numeric NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT astra_reward_claims_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT astra_reward_claims_unique UNIQUE (user_id, claim_type)
);

ALTER TABLE public.astra_reward_claims ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_reward_claims' AND policyname='Users can view their own claims'
  ) THEN
    CREATE POLICY "Users can view their own claims"
      ON public.astra_reward_claims
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_reward_claims' AND policyname='Admins can view all claims'
  ) THEN
    CREATE POLICY "Admins can view all claims"
      ON public.astra_reward_claims
      FOR SELECT
      USING (check_admin_access());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_astra_claims_user_created ON public.astra_reward_claims (user_id, created_at DESC);


-- 6) Referrals
CREATE TABLE IF NOT EXISTS public.astra_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  referrer_reward numeric NOT NULL DEFAULT 0,
  referred_reward numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT astra_referrals_referrer_fk FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT astra_referrals_referred_fk FOREIGN KEY (referred_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.astra_referrals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_referrals' AND policyname='Users can view their own referrals'
  ) THEN
    CREATE POLICY "Users can view their own referrals"
      ON public.astra_referrals
      FOR SELECT
      USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_referrals' AND policyname='Admins can view all referrals'
  ) THEN
    CREATE POLICY "Admins can view all referrals"
      ON public.astra_referrals
      FOR SELECT
      USING (check_admin_access());
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
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT astra_token_transfers_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT astra_token_transfers_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.astra_token_transfers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_token_transfers' AND policyname='Users can view their own transfers'
  ) THEN
    CREATE POLICY "Users can view their own transfers"
      ON public.astra_token_transfers
      FOR SELECT
      USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='astra_token_transfers' AND policyname='Admins can view all transfers'
  ) THEN
    CREATE POLICY "Admins can view all transfers"
      ON public.astra_token_transfers
      FOR SELECT
      USING (check_admin_access());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_astra_transfers_created ON public.astra_token_transfers (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_astra_transfers_users ON public.astra_token_transfers (sender_id, recipient_id);


-- Done
SELECT 'ASTRA token schema created/verified' AS status;