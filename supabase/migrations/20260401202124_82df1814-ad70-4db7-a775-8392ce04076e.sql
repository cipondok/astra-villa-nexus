
-- Create support_cases table
CREATE TABLE public.support_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issue_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  conflict_detected BOOLEAN NOT NULL DEFAULT false,
  confidence_score NUMERIC(3,2) DEFAULT 0.00,
  summary TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_support_cases_status ON public.support_cases(status);
CREATE INDEX idx_support_cases_priority ON public.support_cases(priority);
CREATE INDEX idx_support_cases_created_at ON public.support_cases(created_at DESC);
CREATE INDEX idx_support_cases_conflict ON public.support_cases(conflict_detected) WHERE conflict_detected = true;

-- Enable RLS
ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;

-- Admin-only policies using existing admin_users table
CREATE POLICY "Admins can view all support cases"
ON public.support_cases FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can create support cases"
ON public.support_cases FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can update support cases"
ON public.support_cases FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can delete support cases"
ON public.support_cases FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Timestamp trigger
CREATE TRIGGER update_support_cases_updated_at
BEFORE UPDATE ON public.support_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
