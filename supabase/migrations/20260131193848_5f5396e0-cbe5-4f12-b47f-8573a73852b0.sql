-- Mortgage Banks (Indonesian banks offering KPR)
CREATE TABLE public.mortgage_banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  bank_code TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  min_loan_amount NUMERIC DEFAULT 100000000,
  max_loan_amount NUMERIC DEFAULT 50000000000,
  min_down_payment_percent NUMERIC DEFAULT 10,
  max_loan_term_years INTEGER DEFAULT 30,
  processing_fee_percent NUMERIC DEFAULT 1.0,
  admin_fee NUMERIC DEFAULT 500000,
  appraisal_fee NUMERIC DEFAULT 1500000,
  insurance_required BOOLEAN DEFAULT true,
  notary_fee_percent NUMERIC DEFAULT 0.5,
  requirements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mortgage Rate Tiers
CREATE TABLE public.mortgage_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID NOT NULL REFERENCES public.mortgage_banks(id) ON DELETE CASCADE,
  rate_name TEXT NOT NULL,
  rate_type TEXT NOT NULL CHECK (rate_type IN ('fixed', 'floating', 'promotional')),
  interest_rate_year1 NUMERIC NOT NULL,
  interest_rate_year2 NUMERIC,
  interest_rate_year3_plus NUMERIC,
  min_loan_amount NUMERIC,
  max_loan_amount NUMERIC,
  min_term_years INTEGER DEFAULT 1,
  max_term_years INTEGER DEFAULT 30,
  promo_end_date DATE,
  conditions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Mortgage Simulations
CREATE TABLE public.mortgage_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  session_id TEXT,
  property_price NUMERIC NOT NULL,
  down_payment NUMERIC NOT NULL,
  down_payment_percent NUMERIC NOT NULL,
  loan_amount NUMERIC NOT NULL,
  loan_term_years INTEGER NOT NULL,
  selected_bank_id UUID REFERENCES public.mortgage_banks(id),
  selected_rate_id UUID REFERENCES public.mortgage_rates(id),
  interest_rate NUMERIC NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  total_payment NUMERIC NOT NULL,
  total_interest NUMERIC NOT NULL,
  affordability_ratio NUMERIC,
  monthly_income NUMERIC,
  comparison_data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mortgage Inquiries
CREATE TABLE public.mortgage_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  bank_id UUID NOT NULL REFERENCES public.mortgage_banks(id),
  simulation_id UUID REFERENCES public.mortgage_simulations(id),
  property_id UUID REFERENCES public.properties(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  monthly_income NUMERIC,
  employment_type TEXT,
  loan_amount_requested NUMERIC,
  loan_term_requested INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'processing', 'approved', 'rejected', 'cancelled')),
  bank_notes TEXT,
  admin_notes TEXT,
  contacted_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mortgage_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortgage_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortgage_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortgage_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active banks" ON public.mortgage_banks FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage banks" ON public.mortgage_banks FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view active rates" ON public.mortgage_rates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage rates" ON public.mortgage_rates FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own simulations" ON public.mortgage_simulations FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Anyone can create simulations" ON public.mortgage_simulations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all simulations" ON public.mortgage_simulations FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own inquiries" ON public.mortgage_inquiries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create inquiries" ON public.mortgage_inquiries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage all inquiries" ON public.mortgage_inquiries FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_mortgage_rates_bank ON public.mortgage_rates(bank_id);
CREATE INDEX idx_mortgage_simulations_user ON public.mortgage_simulations(user_id);
CREATE INDEX idx_mortgage_inquiries_status ON public.mortgage_inquiries(status);

-- Triggers
CREATE TRIGGER update_mortgage_banks_updated_at BEFORE UPDATE ON public.mortgage_banks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mortgage_rates_updated_at BEFORE UPDATE ON public.mortgage_rates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mortgage_inquiries_updated_at BEFORE UPDATE ON public.mortgage_inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sample Indonesian banks
INSERT INTO public.mortgage_banks (bank_name, bank_code, description, min_down_payment_percent, max_loan_term_years, processing_fee_percent) VALUES
('Bank Central Asia (BCA)', 'BCA', 'One of Indonesia''s largest private banks with competitive KPR rates', 15, 25, 1.0),
('Bank Mandiri', 'MANDIRI', 'State-owned bank offering various KPR products', 10, 30, 0.5),
('Bank Rakyat Indonesia (BRI)', 'BRI', 'Largest bank in Indonesia with extensive branch network', 10, 25, 1.0),
('Bank Negara Indonesia (BNI)', 'BNI', 'Major state-owned bank with flexible KPR options', 10, 25, 0.75),
('Bank CIMB Niaga', 'CIMB', 'Private bank with attractive promotional rates', 10, 30, 1.0),
('Bank BTN', 'BTN', 'Specialized housing finance bank with competitive rates', 5, 30, 0.5),
('Bank Danamon', 'DANAMON', 'Private bank offering various mortgage products', 15, 25, 1.0),
('Bank OCBC NISP', 'OCBC', 'Foreign bank with premium mortgage services', 20, 20, 0.75);

-- Sample rates for each bank
INSERT INTO public.mortgage_rates (bank_id, rate_name, rate_type, interest_rate_year1, interest_rate_year2, interest_rate_year3_plus, conditions) 
SELECT id, 'Fixed Rate 1 Year', 'fixed', 6.5, 10.5, 10.5, 'Fixed rate for first year, then floating' FROM public.mortgage_banks WHERE bank_code = 'BCA';

INSERT INTO public.mortgage_rates (bank_id, rate_name, rate_type, interest_rate_year1, interest_rate_year2, interest_rate_year3_plus, conditions)
SELECT id, 'KPR Mandiri', 'fixed', 5.99, 9.5, 9.5, 'Promotional rate for new customers' FROM public.mortgage_banks WHERE bank_code = 'MANDIRI';

INSERT INTO public.mortgage_rates (bank_id, rate_name, rate_type, interest_rate_year1, interest_rate_year2, interest_rate_year3_plus, conditions)
SELECT id, 'BRI KPR Easy', 'fixed', 6.25, 10.0, 10.0, 'Easy approval process' FROM public.mortgage_banks WHERE bank_code = 'BRI';

INSERT INTO public.mortgage_rates (bank_id, rate_name, rate_type, interest_rate_year1, interest_rate_year2, interest_rate_year3_plus, conditions)
SELECT id, 'BNI Griya', 'fixed', 6.0, 9.75, 9.75, 'Special rate for BNI customers' FROM public.mortgage_banks WHERE bank_code = 'BNI';

INSERT INTO public.mortgage_rates (bank_id, rate_name, rate_type, interest_rate_year1, interest_rate_year2, interest_rate_year3_plus, conditions, promo_end_date)
SELECT id, 'BTN Subsidi', 'promotional', 5.0, 5.0, 5.0, 'Government subsidized housing', '2026-12-31'::DATE FROM public.mortgage_banks WHERE bank_code = 'BTN';

INSERT INTO public.mortgage_rates (bank_id, rate_name, rate_type, interest_rate_year1, interest_rate_year2, interest_rate_year3_plus, conditions)
SELECT id, 'BTN Platinum', 'fixed', 6.5, 10.25, 10.25, 'Premium housing finance' FROM public.mortgage_banks WHERE bank_code = 'BTN';