
-- Create mortgage_applications table
CREATE TABLE public.mortgage_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  bank_id UUID REFERENCES public.mortgage_banks(id),
  simulation_id UUID REFERENCES public.mortgage_simulations(id),
  property_id UUID REFERENCES public.properties(id),
  
  -- Applicant info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  company_name TEXT,
  years_employed INTEGER DEFAULT 0,
  monthly_income NUMERIC NOT NULL,
  other_income NUMERIC DEFAULT 0,
  monthly_expenses NUMERIC DEFAULT 0,
  existing_debt NUMERIC DEFAULT 0,
  
  -- Loan details
  property_price NUMERIC NOT NULL,
  down_payment NUMERIC NOT NULL,
  down_payment_percent NUMERIC NOT NULL,
  loan_amount NUMERIC NOT NULL,
  loan_term_years INTEGER NOT NULL,
  interest_rate NUMERIC NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  dti_ratio NUMERIC,
  qualification_status TEXT NOT NULL DEFAULT 'pending',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'submitted',
  status_history JSONB DEFAULT '[]'::jsonb,
  bank_reference_number TEXT,
  bank_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mortgage_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON public.mortgage_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can create own applications" ON public.mortgage_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own applications (limited)
CREATE POLICY "Users can update own applications" ON public.mortgage_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_mortgage_applications_user_id ON public.mortgage_applications(user_id);
CREATE INDEX idx_mortgage_applications_status ON public.mortgage_applications(status);
CREATE INDEX idx_mortgage_applications_bank_id ON public.mortgage_applications(bank_id);
