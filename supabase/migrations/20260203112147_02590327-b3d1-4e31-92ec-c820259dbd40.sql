
-- Partner Types Enum
CREATE TYPE public.partner_type AS ENUM (
  'mortgage_broker',
  'home_inspector', 
  'moving_company',
  'insurance_provider',
  'interior_designer',
  'smart_home_installer'
);

-- Partner Status Enum
CREATE TYPE public.partner_status AS ENUM (
  'pending',
  'active',
  'suspended',
  'terminated'
);

-- Partners Table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  partner_type public.partner_type NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,
  logo_url TEXT,
  description TEXT,
  status public.partner_status DEFAULT 'pending',
  
  -- Commission/Revenue Share Settings
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  revenue_share_rate DECIMAL(5,2) DEFAULT 10.00,
  referral_fee DECIMAL(10,2) DEFAULT 50000,
  
  -- Banking Info for Payouts
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  
  -- Stats
  total_referrals INTEGER DEFAULT 0,
  successful_conversions INTEGER DEFAULT 0,
  total_earnings DECIMAL(15,2) DEFAULT 0,
  pending_payout DECIMAL(15,2) DEFAULT 0,
  lifetime_paid DECIMAL(15,2) DEFAULT 0,
  
  -- Metadata
  contract_signed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Partner Referrals Table
CREATE TABLE public.partner_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE DEFAULT 'PTR-' || upper(substr(md5(random()::text), 1, 8)),
  
  -- Referred Customer Info
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Property/Service Info
  property_id UUID,
  service_type TEXT,
  transaction_value DECIMAL(15,2),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'converted', 'rejected', 'expired')),
  qualified_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  
  -- Commission/Fee
  commission_amount DECIMAL(15,2),
  commission_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address INET,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Partner Payouts Table
CREATE TABLE public.partner_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'IDR',
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Payment Info
  payment_method TEXT DEFAULT 'bank_transfer',
  payment_reference TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  
  -- Processing
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  
  -- Period
  period_start DATE,
  period_end DATE,
  referrals_count INTEGER DEFAULT 0,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Partner Package Deals (for bundled offers)
CREATE TABLE public.partner_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  original_price DECIMAL(15,2) NOT NULL,
  discounted_price DECIMAL(15,2) NOT NULL,
  discount_percentage DECIMAL(5,2),
  
  -- Validity
  is_active BOOLEAN DEFAULT true,
  valid_from DATE,
  valid_until DATE,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  
  -- Terms
  terms_conditions TEXT,
  included_services JSONB DEFAULT '[]',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Partner Activity Log
CREATE TABLE public.partner_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Partners
CREATE POLICY "Partners can view their own profile" ON public.partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all partners" ON public.partners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- RLS Policies for Referrals
CREATE POLICY "Partners can view their own referrals" ON public.partner_referrals
  FOR SELECT USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Partners can create referrals" ON public.partner_referrals
  FOR INSERT WITH CHECK (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all referrals" ON public.partner_referrals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- RLS Policies for Payouts
CREATE POLICY "Partners can view their own payouts" ON public.partner_payouts
  FOR SELECT USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all payouts" ON public.partner_payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- RLS Policies for Packages
CREATE POLICY "Anyone can view active packages" ON public.partner_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage their packages" ON public.partner_packages
  FOR ALL USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all packages" ON public.partner_packages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- RLS Policies for Activity Logs
CREATE POLICY "Partners can view their own logs" ON public.partner_activity_logs
  FOR SELECT USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all logs" ON public.partner_activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_partners_user_id ON public.partners(user_id);
CREATE INDEX idx_partners_type ON public.partners(partner_type);
CREATE INDEX idx_partners_status ON public.partners(status);
CREATE INDEX idx_partner_referrals_partner ON public.partner_referrals(partner_id);
CREATE INDEX idx_partner_referrals_status ON public.partner_referrals(status);
CREATE INDEX idx_partner_payouts_partner ON public.partner_payouts(partner_id);
CREATE INDEX idx_partner_payouts_status ON public.partner_payouts(status);

-- Function to update partner stats after referral conversion
CREATE OR REPLACE FUNCTION public.update_partner_stats_on_referral()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'converted' AND (OLD.status IS NULL OR OLD.status != 'converted') THEN
    UPDATE public.partners
    SET 
      successful_conversions = successful_conversions + 1,
      total_earnings = total_earnings + COALESCE(NEW.commission_amount, 0),
      pending_payout = pending_payout + COALESCE(NEW.commission_amount, 0),
      updated_at = now()
    WHERE id = NEW.partner_id;
  END IF;
  
  IF TG_OP = 'INSERT' THEN
    UPDATE public.partners
    SET total_referrals = total_referrals + 1, updated_at = now()
    WHERE id = NEW.partner_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_partner_stats
  AFTER INSERT OR UPDATE ON public.partner_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_partner_stats_on_referral();

-- Function to update partner pending payout after payout completion
CREATE OR REPLACE FUNCTION public.update_partner_after_payout()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.partners
    SET 
      pending_payout = GREATEST(0, pending_payout - NEW.amount),
      lifetime_paid = lifetime_paid + NEW.amount,
      updated_at = now()
    WHERE id = NEW.partner_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_partner_after_payout
  AFTER UPDATE ON public.partner_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_partner_after_payout();

-- Insert sample partner types config
INSERT INTO public.partners (partner_type, company_name, contact_name, contact_email, status, commission_rate, revenue_share_rate, referral_fee, description)
VALUES 
  ('mortgage_broker', 'Bank Mandiri Mortgages', 'Budi Santoso', 'budi@mandiri-mortgage.co.id', 'active', 2.50, 0, 0, 'Leading mortgage broker with competitive rates'),
  ('home_inspector', 'InspeksiRumah Pro', 'Dewi Lestari', 'dewi@inspeksirumah.id', 'active', 0, 15.00, 0, 'Certified home inspection services'),
  ('moving_company', 'PindahRumah Express', 'Ahmad Yusuf', 'ahmad@pindahrumah.co.id', 'active', 0, 0, 100000, 'Professional moving and relocation services'),
  ('insurance_provider', 'Asuransi Properti Plus', 'Siti Rahayu', 'siti@asuransiproperti.id', 'active', 5.00, 0, 0, 'Comprehensive property insurance solutions'),
  ('interior_designer', 'DesainInterior Jakarta', 'Rini Wulandari', 'rini@desaininterior.id', 'active', 0, 10.00, 0, 'Award-winning interior design studio'),
  ('smart_home_installer', 'SmartHome Indonesia', 'Joko Widodo', 'joko@smarthome.id', 'active', 0, 12.00, 0, 'Complete smart home automation solutions');
