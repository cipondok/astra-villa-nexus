
-- Create ASTRA Token system tables
CREATE TABLE public.astra_token_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vendor coin balances
CREATE TABLE public.vendor_astra_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance DECIMAL(15,2) DEFAULT 0.00,
  lifetime_earned DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vendor_id)
);

-- Create coin transaction history
CREATE TABLE public.astra_token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference_id UUID,
  admin_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create AI suggestions and feedback
CREATE TABLE public.ai_vendor_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id),
  suggestion_type TEXT NOT NULL,
  ai_suggestion JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create AI chat logs for footer bot
CREATE TABLE public.ai_chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  user_type TEXT DEFAULT 'guest',
  message TEXT NOT NULL,
  ai_response TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default ASTRA token settings
INSERT INTO public.astra_token_settings (setting_key, setting_value, description) VALUES
('signup_bonus', '{"amount": 100, "enabled": true}', 'Coins awarded for vendor signup'),
('profile_completion', '{"amount": 200, "enabled": true}', 'Coins awarded for 100% profile completion'),
('transaction_percentage', '{"percentage": 2.5, "enabled": true}', 'Percentage of transaction value awarded as coins'),
('service_creation', '{"amount": 50, "enabled": true}', 'Coins awarded per service created'),
('level_bonuses', '{"bronze": 500, "silver": 1000, "gold": 2000, "platinum": 5000}', 'Level achievement bonuses'),
('daily_limits', '{"max_transaction_coins": 1000, "max_daily_earn": 2000}', 'Daily earning limits');

-- Add profile completion tracking
ALTER TABLE public.vendor_business_profiles 
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS astra_signup_bonus_claimed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS astra_profile_bonus_claimed BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.astra_token_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_astra_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astra_token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_vendor_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Fixed syntax
CREATE POLICY "Admins can manage token settings" ON public.astra_token_settings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can view token settings" ON public.astra_token_settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Vendors can view their own balance" ON public.vendor_astra_balances
  FOR SELECT TO authenticated
  USING (vendor_id = auth.uid());

CREATE POLICY "System can insert balances" ON public.vendor_astra_balances
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update balances" ON public.vendor_astra_balances
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Vendors can view their own transactions" ON public.astra_token_transactions
  FOR SELECT TO authenticated
  USING (vendor_id = auth.uid());

CREATE POLICY "System can create transactions" ON public.astra_token_transactions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all transactions" ON public.astra_token_transactions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Vendors can view their own suggestions" ON public.ai_vendor_suggestions
  FOR SELECT TO authenticated
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can update suggestion status" ON public.ai_vendor_suggestions
  FOR UPDATE TO authenticated
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "System can create suggestions" ON public.ai_vendor_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all suggestions" ON public.ai_vendor_suggestions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view their own chat logs" ON public.ai_chat_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can create chat logs" ON public.ai_chat_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all chat logs" ON public.ai_chat_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
