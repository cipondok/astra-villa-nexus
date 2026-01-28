-- Create subscription_invoices table
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  subscription_id UUID,
  user_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'failed', 'cancelled', 'refunded')),
  billing_period_start TIMESTAMP WITH TIME ZONE,
  billing_period_end TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_order_id TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription_plans if not exists
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(12,2) NOT NULL DEFAULT 0,
  price_annual DECIMAL(12,2),
  currency TEXT NOT NULL DEFAULT 'IDR',
  listing_limit INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subscriptions if not exists
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 month'),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  last_payment_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transaction_commissions if not exists
CREATE TABLE IF NOT EXISTS public.transaction_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  seller_id UUID NOT NULL,
  buyer_id UUID,
  gross_amount DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  net_amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  hold_until TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  payout_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor_payouts if not exists
CREATE TABLE IF NOT EXISTS public.vendor_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payout_reference TEXT NOT NULL UNIQUE,
  vendor_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  fee DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  status TEXT NOT NULL DEFAULT 'pending',
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  commission_ids UUID[] DEFAULT '{}',
  failure_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  gateway_response JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_disputes if not exists
CREATE TABLE IF NOT EXISTS public.payment_disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_reference TEXT NOT NULL UNIQUE,
  transaction_id TEXT NOT NULL,
  raised_by UUID NOT NULL,
  against_user UUID,
  dispute_type TEXT NOT NULL,
  dispute_reason TEXT NOT NULL,
  evidence JSONB DEFAULT '[]'::jsonb,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform_commission_settings if not exists
CREATE TABLE IF NOT EXISTS public.platform_commission_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.05,
  min_commission DECIMAL(12,2) DEFAULT 0,
  max_commission DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor_payout_settings if not exists
CREATE TABLE IF NOT EXISTS public.vendor_payout_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  bank_name TEXT NOT NULL,
  bank_code TEXT,
  account_number TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  payout_schedule TEXT DEFAULT 'instant',
  minimum_payout DECIMAL(12,2) DEFAULT 50000,
  auto_payout_enabled BOOLEAN DEFAULT true,
  tax_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payout_settings ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
DROP POLICY IF EXISTS "public_read_plans" ON public.subscription_plans;
CREATE POLICY "public_read_plans" ON public.subscription_plans FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "user_own_subscription" ON public.user_subscriptions;
CREATE POLICY "user_own_subscription" ON public.user_subscriptions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_own_invoices" ON public.subscription_invoices;
CREATE POLICY "user_own_invoices" ON public.subscription_invoices FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "seller_own_commissions" ON public.transaction_commissions;
CREATE POLICY "seller_own_commissions" ON public.transaction_commissions FOR SELECT USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "vendor_own_payouts" ON public.vendor_payouts;
CREATE POLICY "vendor_own_payouts" ON public.vendor_payouts FOR SELECT USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "user_own_payout_settings" ON public.vendor_payout_settings;
CREATE POLICY "user_own_payout_settings" ON public.vendor_payout_settings FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "dispute_parties" ON public.payment_disputes;
CREATE POLICY "dispute_parties" ON public.payment_disputes FOR SELECT USING (auth.uid() = raised_by OR auth.uid() = against_user);

-- Insert default plans
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, listing_limit, features, display_order)
VALUES 
  ('Free', 'free', 'Perfect for getting started', 0, 3, '["3 listings per month", "Basic analytics", "Email support"]'::jsonb, 1),
  ('Pro', 'pro', 'For professionals', 435000, NULL, '["Unlimited listings", "Advanced analytics", "Priority support", "Featured listings"]'::jsonb, 2),
  ('Enterprise', 'enterprise', 'For teams', 1485000, NULL, '["Everything in Pro", "Team features", "API access", "Dedicated support"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert default commission settings
INSERT INTO public.platform_commission_settings (transaction_type, commission_rate, min_commission)
VALUES 
  ('property_sale', 0.03, 500000),
  ('property_rental', 0.05, 100000),
  ('vendor_service', 0.05, 50000)
ON CONFLICT (transaction_type) DO NOTHING;