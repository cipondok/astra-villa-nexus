-- Media Coverage & PR Management System

-- Press coverage tracking
CREATE TABLE public.press_coverage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_name TEXT NOT NULL,
  publication_type TEXT NOT NULL CHECK (publication_type IN ('tech_media', 'business_media', 'local_news', 'industry_publication', 'podcast', 'blog', 'tv', 'radio')),
  article_title TEXT NOT NULL,
  article_url TEXT,
  publication_date DATE,
  journalist_name TEXT,
  journalist_email TEXT,
  journalist_linkedin TEXT,
  reach_estimate INTEGER,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  coverage_type TEXT CHECK (coverage_type IN ('feature', 'mention', 'interview', 'review', 'press_release')),
  topics TEXT[],
  key_quotes TEXT[],
  media_value_estimate NUMERIC,
  social_shares INTEGER DEFAULT 0,
  referral_traffic INTEGER DEFAULT 0,
  lead_conversions INTEGER DEFAULT 0,
  screenshot_url TEXT,
  pdf_url TEXT,
  notes TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('pitched', 'confirmed', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PR outreach and HARO tracking
CREATE TABLE public.pr_outreach (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('haro', 'direct_pitch', 'pr_agency', 'inbound', 'referral', 'event')),
  outlet_name TEXT NOT NULL,
  outlet_type TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_title TEXT,
  pitch_subject TEXT NOT NULL,
  pitch_content TEXT,
  pitch_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded', 'interested', 'scheduled', 'published', 'declined', 'no_response')),
  response_date TIMESTAMPTZ,
  follow_up_count INTEGER DEFAULT 0,
  last_follow_up TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  assigned_to TEXT,
  coverage_id UUID REFERENCES public.press_coverage(id),
  notes TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Podcast appearances tracking
CREATE TABLE public.podcast_appearances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_name TEXT NOT NULL,
  host_name TEXT,
  host_email TEXT,
  podcast_url TEXT,
  episode_title TEXT,
  episode_url TEXT,
  recording_date DATE,
  air_date DATE,
  duration_minutes INTEGER,
  listener_estimate INTEGER,
  topics_discussed TEXT[],
  key_talking_points TEXT[],
  call_to_action TEXT,
  promo_code TEXT,
  landing_page_url TEXT,
  downloads INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pitched' CHECK (status IN ('pitched', 'scheduled', 'recorded', 'aired', 'promoted')),
  rating NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PR agencies and contacts
CREATE TABLE public.pr_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_name TEXT NOT NULL,
  agency_type TEXT CHECK (agency_type IN ('full_service', 'tech_focused', 'property_focused', 'digital', 'boutique')),
  website_url TEXT,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  monthly_retainer NUMERIC,
  contract_start_date DATE,
  contract_end_date DATE,
  services_included TEXT[],
  kpis JSONB,
  performance_rating NUMERIC,
  total_placements INTEGER DEFAULT 0,
  total_impressions BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Media targets (publications we want coverage in)
CREATE TABLE public.media_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_name TEXT NOT NULL,
  publication_type TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('tier1', 'tier2', 'tier3')),
  monthly_visitors BIGINT,
  domain_authority INTEGER,
  target_topics TEXT[],
  key_contacts JSONB,
  past_coverage_count INTEGER DEFAULT 0,
  priority_score INTEGER DEFAULT 50,
  pitch_angle TEXT,
  best_pitch_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'target' CHECK (status IN ('target', 'pitched', 'relationship', 'covered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Concierge Service Management

-- Concierge service packages
CREATE TABLE public.concierge_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name TEXT NOT NULL,
  package_tier TEXT NOT NULL CHECK (package_tier IN ('essential', 'premium', 'luxury', 'custom')),
  description TEXT,
  commission_percentage NUMERIC NOT NULL DEFAULT 2.0,
  min_property_value NUMERIC,
  max_property_value NUMERIC,
  included_services JSONB NOT NULL,
  add_on_services JSONB,
  estimated_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  terms_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Concierge service requests
CREATE TABLE public.concierge_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.concierge_packages(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('buying', 'selling', 'renting', 'relocating')),
  property_value NUMERIC,
  commission_amount NUMERIC,
  status TEXT DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'consultation', 'proposal_sent', 'negotiating', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  assigned_concierge UUID REFERENCES public.profiles(id),
  services_requested JSONB,
  special_requirements TEXT,
  timeline TEXT,
  preferred_contact_method TEXT,
  preferred_contact_time TEXT,
  budget_flexibility TEXT,
  consultation_date TIMESTAMPTZ,
  consultation_notes TEXT,
  proposal_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  satisfaction_rating INTEGER,
  feedback TEXT,
  referral_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Concierge service tasks
CREATE TABLE public.concierge_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.concierge_requests(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('personal_assistant', 'photography', 'legal_documents', 'moving_coordination', 'home_setup', 'inspection', 'staging', 'cleaning', 'repairs', 'other')),
  task_name TEXT NOT NULL,
  task_description TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  vendor_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  notes TEXT,
  attachments JSONB,
  client_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Concierge team members
CREATE TABLE public.concierge_team (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('manager', 'senior_concierge', 'concierge', 'assistant', 'specialist')),
  specializations TEXT[],
  languages TEXT[],
  max_active_clients INTEGER DEFAULT 10,
  current_active_clients INTEGER DEFAULT 0,
  total_clients_served INTEGER DEFAULT 0,
  avg_satisfaction_rating NUMERIC DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Concierge service vendors (photographers, movers, lawyers, etc.)
CREATE TABLE public.concierge_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('photographer', 'videographer', 'lawyer', 'notary', 'moving_company', 'home_staging', 'cleaning', 'inspector', 'contractor', 'interior_designer', 'other')),
  company_name TEXT,
  email TEXT,
  phone TEXT,
  website_url TEXT,
  service_areas TEXT[],
  pricing_model TEXT,
  base_rate NUMERIC,
  commission_rate NUMERIC,
  portfolio_url TEXT,
  certifications TEXT[],
  insurance_verified BOOLEAN DEFAULT false,
  background_check BOOLEAN DEFAULT false,
  avg_rating NUMERIC DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  is_preferred BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.press_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concierge_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concierge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concierge_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concierge_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concierge_vendors ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admin full access press_coverage" ON public.press_coverage FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admin full access pr_outreach" ON public.pr_outreach FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admin full access podcast_appearances" ON public.podcast_appearances FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admin full access pr_agencies" ON public.pr_agencies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admin full access media_targets" ON public.media_targets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admin full access concierge_packages" ON public.concierge_packages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admin full access concierge_requests" ON public.concierge_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admin full access concierge_tasks" ON public.concierge_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admin full access concierge_team" ON public.concierge_team FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admin full access concierge_vendors" ON public.concierge_vendors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- User policies for concierge
CREATE POLICY "Users view active packages" ON public.concierge_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Users view own requests" ON public.concierge_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create own requests" ON public.concierge_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view own tasks" ON public.concierge_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.concierge_requests WHERE id = request_id AND user_id = auth.uid()) AND client_visible = true
);
CREATE POLICY "Public view featured coverage" ON public.press_coverage FOR SELECT USING (featured = true AND status = 'published');

-- Seed concierge packages
INSERT INTO public.concierge_packages (package_name, package_tier, description, commission_percentage, min_property_value, included_services, display_order) VALUES
('Essential Concierge', 'essential', 'Perfect for first-time buyers or sellers who want professional support', 2.0, 500000000, 
 '{"personal_assistant": true, "photography": "basic", "legal_review": true, "moving_coordination": false, "home_setup": false}', 1),
('Premium Concierge', 'premium', 'Comprehensive support with professional photography and moving coordination', 2.0, 1000000000,
 '{"personal_assistant": true, "photography": "professional", "legal_review": true, "legal_notarization": true, "moving_coordination": true, "home_setup": false}', 2),
('Luxury Concierge', 'luxury', 'White-glove service including home staging, premium photography, and complete setup', 2.0, 3000000000,
 '{"personal_assistant": true, "photography": "premium_package", "videography": true, "drone_shots": true, "legal_review": true, "legal_notarization": true, "moving_coordination": true, "home_setup": true, "interior_consultation": true}', 3);

-- Seed media targets
INSERT INTO public.media_targets (publication_name, publication_type, tier, monthly_visitors, target_topics, priority_score) VALUES
('TechCrunch', 'tech_media', 'tier1', 30000000, ARRAY['AI', 'proptech', 'startup', 'disruption'], 100),
('Forbes', 'business_media', 'tier1', 120000000, ARRAY['entrepreneur', 'business', 'real estate', 'technology'], 95),
('Kompas', 'local_news', 'tier1', 50000000, ARRAY['real estate', 'property', 'investment', 'jakarta'], 90),
('Detik', 'local_news', 'tier1', 80000000, ARRAY['property', 'technology', 'lifestyle'], 88),
('Property Week Asia', 'industry_publication', 'tier2', 500000, ARRAY['proptech', 'real estate tech', 'market analysis'], 75),
('Tech in Asia', 'tech_media', 'tier1', 8000000, ARRAY['startup', 'SEA tech', 'proptech', 'funding'], 85);

-- Create indexes
CREATE INDEX idx_press_coverage_date ON public.press_coverage(publication_date DESC);
CREATE INDEX idx_press_coverage_type ON public.press_coverage(publication_type);
CREATE INDEX idx_pr_outreach_status ON public.pr_outreach(status);
CREATE INDEX idx_pr_outreach_deadline ON public.pr_outreach(deadline);
CREATE INDEX idx_podcast_air_date ON public.podcast_appearances(air_date);
CREATE INDEX idx_concierge_requests_user ON public.concierge_requests(user_id);
CREATE INDEX idx_concierge_requests_status ON public.concierge_requests(status);
CREATE INDEX idx_concierge_tasks_request ON public.concierge_tasks(request_id);

-- Updated at triggers
CREATE TRIGGER update_press_coverage_updated_at BEFORE UPDATE ON public.press_coverage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pr_outreach_updated_at BEFORE UPDATE ON public.pr_outreach FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_podcast_appearances_updated_at BEFORE UPDATE ON public.podcast_appearances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_concierge_requests_updated_at BEFORE UPDATE ON public.concierge_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_concierge_tasks_updated_at BEFORE UPDATE ON public.concierge_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();