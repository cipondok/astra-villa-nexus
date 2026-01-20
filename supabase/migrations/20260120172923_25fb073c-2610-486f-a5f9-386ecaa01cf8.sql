-- Add 'investor' to the user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'investor';

-- Create investor_profiles table for investor-specific metadata
CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  investor_type TEXT NOT NULL CHECK (investor_type IN ('wna', 'wni')),
  nationality TEXT,
  country_of_residence TEXT,
  investment_budget_min BIGINT,
  investment_budget_max BIGINT,
  preferred_property_types TEXT[],
  preferred_locations TEXT[],
  investment_timeline TEXT,
  has_completed_eligibility_check BOOLEAN DEFAULT false,
  eligibility_score INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investor_profiles
CREATE POLICY "Users can view their own investor profile"
ON public.investor_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investor profile"
ON public.investor_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investor profile"
ON public.investor_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Admin can view all investor profiles using has_role function
CREATE POLICY "Admins can view all investor profiles"
ON public.investor_profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::user_role) OR public.has_role(auth.uid(), 'super_admin'::user_role));

-- Create trigger for updated_at
CREATE TRIGGER update_investor_profiles_updated_at
BEFORE UPDATE ON public.investor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for faster lookups
CREATE INDEX idx_investor_profiles_user_id ON public.investor_profiles(user_id);
CREATE INDEX idx_investor_profiles_investor_type ON public.investor_profiles(investor_type);