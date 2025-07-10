-- Create ASTRA Token Hub Tables

-- Token Balances Table
CREATE TABLE public.astra_token_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_tokens DECIMAL(20,8) NOT NULL DEFAULT 0,
  available_tokens DECIMAL(20,8) NOT NULL DEFAULT 0,
  locked_tokens DECIMAL(20,8) NOT NULL DEFAULT 0,
  lifetime_earned DECIMAL(20,8) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Token Transactions Table
CREATE TABLE public.astra_token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- earn, spend, transfer, welcome_bonus, referral, daily_checkin, transaction_reward
  amount DECIMAL(20,8) NOT NULL,
  description TEXT,
  reference_type TEXT, -- property_booking, service_booking, referral_signup, etc.
  reference_id UUID,
  status TEXT NOT NULL DEFAULT 'completed', -- pending, completed, failed, cancelled
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Reward Configuration Table
CREATE TABLE public.astra_reward_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_type TEXT NOT NULL, -- welcome_bonus, daily_checkin, transaction_percentage, referral_bonus
  user_role TEXT NOT NULL, -- general_user, property_owner, agent, vendor, admin
  reward_amount DECIMAL(20,8) NOT NULL DEFAULT 0,
  percentage_rate DECIMAL(5,4), -- For transaction-based rewards (e.g., 0.05 = 5%)
  conditions JSONB DEFAULT '{}', -- Additional conditions like minimum transaction amount
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(reward_type, user_role)
);

-- Daily Check-in Table
CREATE TABLE public.astra_daily_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  streak_count INTEGER NOT NULL DEFAULT 1,
  tokens_earned DECIMAL(20,8) NOT NULL DEFAULT 0,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.00, -- For streak bonuses
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

-- Referral System Table
CREATE TABLE public.astra_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, expired
  referrer_reward DECIMAL(20,8) DEFAULT 0,
  referred_reward DECIMAL(20,8) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_id) -- One person can only be referred once
);

-- Reward Claims Table (for tracking bonus claims)
CREATE TABLE public.astra_reward_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claim_type TEXT NOT NULL, -- welcome_bonus, referral_bonus, streak_bonus
  amount DECIMAL(20,8) NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Token Exchange Rates Table (for future features)
CREATE TABLE public.astra_exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  exchange_rate DECIMAL(20,8) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Enable Row Level Security
ALTER TABLE public.astra_token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astra_token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astra_reward_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astra_daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astra_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astra_reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astra_exchange_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Token Balances
CREATE POLICY "Users can view their own token balance" 
ON public.astra_token_balances FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all token balances" 
ON public.astra_token_balances FOR SELECT 
USING (check_admin_access());

CREATE POLICY "System can manage token balances" 
ON public.astra_token_balances FOR ALL 
USING (true);

-- RLS Policies for Token Transactions
CREATE POLICY "Users can view their own transactions" 
ON public.astra_token_transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
ON public.astra_token_transactions FOR SELECT 
USING (check_admin_access());

CREATE POLICY "System can create transactions" 
ON public.astra_token_transactions FOR INSERT 
WITH CHECK (true);

-- RLS Policies for Reward Configuration
CREATE POLICY "Anyone can view active reward configs" 
ON public.astra_reward_config FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage reward configs" 
ON public.astra_reward_config FOR ALL 
USING (check_admin_access());

-- RLS Policies for Daily Check-ins
CREATE POLICY "Users can view their own check-ins" 
ON public.astra_daily_checkins FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins" 
ON public.astra_daily_checkins FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all check-ins" 
ON public.astra_daily_checkins FOR SELECT 
USING (check_admin_access());

-- RLS Policies for Referrals
CREATE POLICY "Users can view referrals they made or received" 
ON public.astra_referrals FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" 
ON public.astra_referrals FOR INSERT 
WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage all referrals" 
ON public.astra_referrals FOR ALL 
USING (check_admin_access());

-- RLS Policies for Reward Claims
CREATE POLICY "Users can view their own claims" 
ON public.astra_reward_claims FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create claims" 
ON public.astra_reward_claims FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all claims" 
ON public.astra_reward_claims FOR SELECT 
USING (check_admin_access());

-- RLS Policies for Exchange Rates
CREATE POLICY "Anyone can view active exchange rates" 
ON public.astra_exchange_rates FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage exchange rates" 
ON public.astra_exchange_rates FOR ALL 
USING (check_admin_access());

-- Create indexes for better performance
CREATE INDEX idx_astra_token_balances_user_id ON public.astra_token_balances(user_id);
CREATE INDEX idx_astra_token_transactions_user_id ON public.astra_token_transactions(user_id);
CREATE INDEX idx_astra_token_transactions_type ON public.astra_token_transactions(transaction_type);
CREATE INDEX idx_astra_token_transactions_created_at ON public.astra_token_transactions(created_at DESC);
CREATE INDEX idx_astra_daily_checkins_user_date ON public.astra_daily_checkins(user_id, checkin_date DESC);
CREATE INDEX idx_astra_referrals_referrer ON public.astra_referrals(referrer_id);
CREATE INDEX idx_astra_referrals_referred ON public.astra_referrals(referred_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_astra_token_balances_updated_at
  BEFORE UPDATE ON public.astra_token_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_astra_reward_config_updated_at
  BEFORE UPDATE ON public.astra_reward_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_astra_exchange_rates_updated_at
  BEFORE UPDATE ON public.astra_exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default reward configurations
INSERT INTO public.astra_reward_config (reward_type, user_role, reward_amount, percentage_rate, conditions, is_active) VALUES
-- Welcome bonuses
('welcome_bonus', 'general_user', 100, NULL, '{"description": "Welcome bonus for new general users"}', true),
('welcome_bonus', 'property_owner', 500, NULL, '{"description": "Welcome bonus for property owners"}', true),
('welcome_bonus', 'agent', 300, NULL, '{"description": "Welcome bonus for agents"}', true),
('welcome_bonus', 'vendor', 200, NULL, '{"description": "Welcome bonus for vendors"}', true),

-- Daily check-in rewards
('daily_checkin', 'general_user', 10, NULL, '{"streak_bonus": {"7": 1.5, "14": 2.0, "30": 3.0}}', true),
('daily_checkin', 'property_owner', 25, NULL, '{"streak_bonus": {"7": 1.5, "14": 2.0, "30": 3.0}}', true),
('daily_checkin', 'agent', 20, NULL, '{"streak_bonus": {"7": 1.5, "14": 2.0, "30": 3.0}}', true),
('daily_checkin', 'vendor', 15, NULL, '{"streak_bonus": {"7": 1.5, "14": 2.0, "30": 3.0}}', true),

-- Transaction percentage rewards
('transaction_percentage', 'general_user', 0, 0.01, '{"min_amount": 100, "max_reward": 100}', true),
('transaction_percentage', 'property_owner', 0, 0.05, '{"min_amount": 500, "max_reward": 1000}', true),
('transaction_percentage', 'agent', 0, 0.03, '{"min_amount": 300, "max_reward": 500}', true),
('transaction_percentage', 'vendor', 0, 0.02, '{"min_amount": 200, "max_reward": 300}', true),

-- Referral bonuses
('referral_bonus', 'general_user', 50, NULL, '{"referred_bonus": 25, "description": "Referral rewards"}', true),
('referral_bonus', 'property_owner', 200, NULL, '{"referred_bonus": 100, "description": "Referral rewards"}', true),
('referral_bonus', 'agent', 150, NULL, '{"referred_bonus": 75, "description": "Referral rewards"}', true),
('referral_bonus', 'vendor', 100, NULL, '{"referred_bonus": 50, "description": "Referral rewards"}', true);