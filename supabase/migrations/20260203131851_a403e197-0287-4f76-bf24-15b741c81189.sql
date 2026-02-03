-- Remote-First Team Structure - Clean

-- Team departments enum
DO $$ BEGIN CREATE TYPE public.team_department AS ENUM ('technology', 'product', 'marketing', 'operations', 'customer_success'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Team member status
DO $$ BEGIN CREATE TYPE public.team_member_status AS ENUM ('active', 'inactive', 'onboarding', 'offboarding', 'on_leave'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Employment type
DO $$ BEGIN CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contractor', 'commission_based', 'intern'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Core Team Members
CREATE TABLE IF NOT EXISTS public.core_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department team_department NOT NULL,
  job_title TEXT NOT NULL,
  employment_type employment_type DEFAULT 'full_time',
  status team_member_status DEFAULT 'active',
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  country TEXT DEFAULT 'Indonesia',
  city TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  reports_to UUID REFERENCES public.core_team_members(id),
  salary_range TEXT,
  equity_percentage DECIMAL(5,3),
  performance_score DECIMAL(3,2) DEFAULT 0,
  is_team_lead BOOLEAN DEFAULT false,
  slack_id TEXT,
  github_username TEXT,
  linkedin_url TEXT,
  emergency_contact JSONB,
  equipment_assigned JSONB,
  certifications TEXT[],
  languages TEXT[],
  working_hours JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Local Experts
CREATE TABLE IF NOT EXISTS public.local_experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  status team_member_status DEFAULT 'active',
  expert_type TEXT DEFAULT 'property',
  expertise_areas TEXT[],
  city TEXT NOT NULL,
  districts TEXT[],
  languages TEXT[] DEFAULT ARRAY['id'],
  verified_at TIMESTAMPTZ,
  verification_documents JSONB,
  commission_rate DECIMAL(5,2) DEFAULT 2.5,
  commission_tier TEXT DEFAULT 'bronze',
  total_deals_closed INTEGER DEFAULT 0,
  total_commission_earned DECIMAL(15,2) DEFAULT 0,
  pending_commission DECIMAL(15,2) DEFAULT 0,
  paid_commission DECIMAL(15,2) DEFAULT 0,
  properties_toured INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  avg_deal_value DECIMAL(15,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  response_time_hours DECIMAL(5,2) DEFAULT 24,
  avatar_url TEXT,
  bio TEXT,
  certifications TEXT[],
  years_experience INTEGER DEFAULT 0,
  specializations TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Training Specialists
CREATE TABLE IF NOT EXISTS public.ai_training_specialists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  status team_member_status DEFAULT 'active',
  specialist_level TEXT DEFAULT 'junior',
  specializations TEXT[],
  tools_proficiency TEXT[],
  contract_type employment_type DEFAULT 'contractor',
  hourly_rate DECIMAL(10,2),
  per_task_rate DECIMAL(6,4),
  timezone TEXT DEFAULT 'Asia/Jakarta',
  country TEXT,
  city TEXT,
  total_tasks_completed INTEGER DEFAULT 0,
  total_labels_created INTEGER DEFAULT 0,
  total_hours_worked DECIMAL(10,2) DEFAULT 0,
  accuracy_score DECIMAL(5,2) DEFAULT 0,
  consistency_score DECIMAL(5,2) DEFAULT 0,
  speed_score DECIMAL(5,2) DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  active_projects TEXT[],
  completed_projects INTEGER DEFAULT 0,
  training_modules_completed TEXT[],
  certification_scores JSONB,
  last_quality_review_at TIMESTAMPTZ,
  quality_review_notes TEXT,
  weekly_availability_hours INTEGER DEFAULT 40,
  current_week_hours DECIMAL(6,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  preferred_task_types TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partnership Managers
CREATE TABLE IF NOT EXISTS public.partnership_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  status team_member_status DEFAULT 'active',
  manager_level TEXT DEFAULT 'associate',
  employment_type employment_type DEFAULT 'full_time',
  department TEXT DEFAULT 'partnerships',
  regions_covered TEXT[],
  industries_covered TEXT[],
  total_partnerships_managed INTEGER DEFAULT 0,
  active_partnerships INTEGER DEFAULT 0,
  partnerships_closed_this_quarter INTEGER DEFAULT 0,
  revenue_generated DECIMAL(15,2) DEFAULT 0,
  target_revenue DECIMAL(15,2) DEFAULT 0,
  pipeline_value DECIMAL(15,2) DEFAULT 0,
  avg_deal_size DECIMAL(15,2) DEFAULT 0,
  nps_score DECIMAL(4,2) DEFAULT 0,
  partner_retention_rate DECIMAL(5,2) DEFAULT 0,
  response_time_hours DECIMAL(5,2) DEFAULT 24,
  meetings_this_month INTEGER DEFAULT 0,
  proposals_sent INTEGER DEFAULT 0,
  proposals_accepted INTEGER DEFAULT 0,
  base_salary DECIMAL(12,2),
  commission_rate DECIMAL(5,2),
  total_commission_earned DECIMAL(12,2) DEFAULT 0,
  bonus_eligible BOOLEAN DEFAULT true,
  avatar_url TEXT,
  bio TEXT,
  linkedin_url TEXT,
  certifications TEXT[],
  languages TEXT[],
  timezone TEXT DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team Hiring Pipeline
CREATE TABLE IF NOT EXISTS public.team_hiring_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_type TEXT NOT NULL,
  job_title TEXT NOT NULL,
  department team_department,
  location TEXT,
  employment_type employment_type,
  salary_range TEXT,
  commission_structure TEXT,
  job_description TEXT,
  requirements TEXT[],
  nice_to_have TEXT[],
  status TEXT DEFAULT 'open',
  applicants_count INTEGER DEFAULT 0,
  interviews_scheduled INTEGER DEFAULT 0,
  offers_sent INTEGER DEFAULT 0,
  positions_filled INTEGER DEFAULT 0,
  total_positions INTEGER DEFAULT 1,
  hiring_manager_id UUID,
  posted_at TIMESTAMPTZ DEFAULT now(),
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team Performance Reviews
CREATE TABLE IF NOT EXISTS public.team_performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_type TEXT NOT NULL,
  member_id UUID NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  overall_score DECIMAL(3,2) NOT NULL,
  scores_breakdown JSONB,
  strengths TEXT[],
  areas_for_improvement TEXT[],
  goals_achieved TEXT[],
  goals_missed TEXT[],
  next_period_goals TEXT[],
  reviewer_comments TEXT,
  member_comments TEXT,
  action_items JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team Commission Payouts
CREATE TABLE IF NOT EXISTS public.team_commission_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_type TEXT NOT NULL,
  member_id UUID NOT NULL,
  payout_period_start DATE NOT NULL,
  payout_period_end DATE NOT NULL,
  gross_commission DECIMAL(15,2) NOT NULL,
  deductions DECIMAL(15,2) DEFAULT 0,
  net_commission DECIMAL(15,2) NOT NULL,
  deals_count INTEGER DEFAULT 0,
  deals_details JSONB,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.core_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_hiring_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_commission_payouts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Admins can manage core team" ON public.core_team_members;
DROP POLICY IF EXISTS "Admins can manage local experts" ON public.local_experts;
DROP POLICY IF EXISTS "Admins can manage AI specialists" ON public.ai_training_specialists;
DROP POLICY IF EXISTS "Admins can manage partnership managers" ON public.partnership_managers;
DROP POLICY IF EXISTS "Admins can manage hiring" ON public.team_hiring_pipeline;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.team_performance_reviews;
DROP POLICY IF EXISTS "Admins can manage payouts" ON public.team_commission_payouts;

CREATE POLICY "Admins can manage core team" ON public.core_team_members FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage local experts" ON public.local_experts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage AI specialists" ON public.ai_training_specialists FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage partnership managers" ON public.partnership_managers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage hiring" ON public.team_hiring_pipeline FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage reviews" ON public.team_performance_reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage payouts" ON public.team_commission_payouts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_core_team_dept ON public.core_team_members(department);
CREATE INDEX IF NOT EXISTS idx_core_team_stat ON public.core_team_members(status);
CREATE INDEX IF NOT EXISTS idx_local_experts_city ON public.local_experts(city);
CREATE INDEX IF NOT EXISTS idx_local_experts_stat ON public.local_experts(status);
CREATE INDEX IF NOT EXISTS idx_ai_specialists_stat ON public.ai_training_specialists(status);
CREATE INDEX IF NOT EXISTS idx_partnership_mgrs_stat ON public.partnership_managers(status);
CREATE INDEX IF NOT EXISTS idx_hiring_pipeline_status ON public.team_hiring_pipeline(status);

-- Seed hiring pipeline
INSERT INTO public.team_hiring_pipeline (position_type, job_title, department, employment_type, status, total_positions) VALUES
('core', 'Senior Full-Stack Developer', 'technology', 'full_time', 'open', 2),
('core', 'Product Manager', 'product', 'full_time', 'open', 1),
('core', 'Growth Marketing Lead', 'marketing', 'full_time', 'open', 1),
('moderator', 'Community Moderator', 'operations', 'contractor', 'open', 20),
('local_expert', 'Jakarta Property Expert', 'operations', 'commission_based', 'open', 50),
('local_expert', 'Surabaya Property Expert', 'operations', 'commission_based', 'open', 30),
('local_expert', 'Bali Property Expert', 'operations', 'commission_based', 'open', 20),
('ai_specialist', 'Data Labeling Specialist', 'technology', 'contractor', 'open', 10),
('partnership_manager', 'Bank Partnership Manager', 'operations', 'full_time', 'open', 2)
ON CONFLICT DO NOTHING;