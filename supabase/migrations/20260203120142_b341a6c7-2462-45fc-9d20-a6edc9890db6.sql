-- =============================================
-- USER ACQUISITION SYSTEM SCHEMA
-- =============================================

-- Referral Program 2.0 Table (Give $100, Get $100)
CREATE TABLE public.acquisition_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referee_email TEXT,
  referral_code TEXT NOT NULL,
  referral_link TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'qualified', 'converted', 'rewarded', 'expired', 'cancelled')),
  referrer_reward_amount INTEGER DEFAULT 1500000, -- ~$100 in IDR
  referee_reward_amount INTEGER DEFAULT 1500000,
  referrer_reward_type TEXT DEFAULT 'cash' CHECK (referrer_reward_type IN ('cash', 'credit', 'astra_tokens', 'discount')),
  referee_reward_type TEXT DEFAULT 'cash' CHECK (referee_reward_type IN ('cash', 'credit', 'astra_tokens', 'discount')),
  referrer_reward_paid BOOLEAN DEFAULT false,
  referee_reward_paid BOOLEAN DEFAULT false,
  qualification_action TEXT, -- What the referee did to qualify (e.g., 'property_inquiry', 'booking', 'purchase')
  qualified_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  rewarded_at TIMESTAMP WITH TIME ZONE,
  source_channel TEXT DEFAULT 'direct' CHECK (source_channel IN ('direct', 'email', 'whatsapp', 'facebook', 'twitter', 'linkedin', 'instagram', 'tiktok')),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bank/Mortgage Partnerships Table
CREATE TABLE public.acquisition_bank_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  bank_logo_url TEXT,
  partnership_type TEXT NOT NULL DEFAULT 'mortgage' CHECK (partnership_type IN ('mortgage', 'kpr', 'refinancing', 'home_equity', 'developer_finance')),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  partnership_tier TEXT DEFAULT 'standard' CHECK (partnership_tier IN ('standard', 'preferred', 'premium', 'exclusive')),
  commission_rate NUMERIC(5,2) DEFAULT 0.5, -- Percentage of loan amount
  min_loan_amount INTEGER,
  max_loan_amount INTEGER,
  interest_rate_range TEXT,
  special_offers JSONB,
  lead_handoff_process TEXT,
  integration_type TEXT DEFAULT 'manual' CHECK (integration_type IN ('manual', 'api', 'iframe', 'redirect')),
  api_endpoint TEXT,
  total_leads_sent INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_commission_earned INTEGER DEFAULT 0,
  contract_start_date DATE,
  contract_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bank Partnership Leads
CREATE TABLE public.acquisition_bank_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.acquisition_bank_partnerships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  lead_name TEXT NOT NULL,
  lead_email TEXT NOT NULL,
  lead_phone TEXT,
  loan_amount_requested INTEGER,
  property_value INTEGER,
  down_payment_amount INTEGER,
  employment_type TEXT,
  monthly_income INTEGER,
  lead_status TEXT DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'submitted', 'approved', 'rejected', 'closed')),
  bank_reference_id TEXT,
  commission_amount INTEGER,
  commission_paid BOOLEAN DEFAULT false,
  notes TEXT,
  sent_to_bank_at TIMESTAMP WITH TIME ZONE,
  bank_response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SEO Content Factory Table
CREATE TABLE public.acquisition_seo_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  content_type TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('article', 'guide', 'neighborhood', 'market_update', 'faq', 'glossary', 'comparison')),
  primary_keyword TEXT NOT NULL,
  secondary_keywords TEXT[],
  target_location TEXT,
  target_property_type TEXT,
  meta_title TEXT,
  meta_description TEXT,
  word_count INTEGER DEFAULT 0,
  readability_score NUMERIC(5,2),
  seo_score NUMERIC(5,2),
  ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  editor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  organic_traffic INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  avg_time_on_page INTEGER,
  bounce_rate NUMERIC(5,2),
  backlinks_count INTEGER DEFAULT 0,
  internal_links JSONB,
  external_links JSONB,
  schema_markup JSONB,
  featured_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Influencer Network Table
CREATE TABLE public.acquisition_influencers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'twitter', 'linkedin', 'facebook')),
  handle TEXT NOT NULL,
  profile_url TEXT,
  profile_image_url TEXT,
  followers_count INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2),
  niche TEXT DEFAULT 'real_estate' CHECK (niche IN ('real_estate', 'lifestyle', 'investment', 'interior_design', 'travel', 'family', 'luxury')),
  location TEXT,
  content_style TEXT,
  audience_demographics JSONB,
  contact_email TEXT,
  contact_phone TEXT,
  agent_name TEXT,
  agent_contact TEXT,
  partnership_tier TEXT DEFAULT 'micro' CHECK (partnership_tier IN ('nano', 'micro', 'mid', 'macro', 'mega', 'celebrity')),
  rate_per_post INTEGER,
  rate_per_story INTEGER,
  rate_per_video INTEGER,
  total_campaigns INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  avg_cpc INTEGER, -- Cost per conversion
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(platform, handle)
);

-- Influencer Campaigns
CREATE TABLE public.acquisition_influencer_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES public.acquisition_influencers(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'sponsored_post' CHECK (campaign_type IN ('sponsored_post', 'story', 'video', 'live', 'takeover', 'affiliate', 'ambassador')),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  brief TEXT,
  deliverables JSONB,
  content_urls JSONB,
  hashtags TEXT[],
  tracking_link TEXT,
  tracking_code TEXT,
  budget INTEGER NOT NULL,
  actual_spend INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'briefing', 'content_creation', 'review', 'live', 'completed', 'cancelled')),
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cpc INTEGER, -- Cost per click
  cpa INTEGER, -- Cost per acquisition
  roi NUMERIC(10,2),
  performance_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Corporate Partnership Programs (HR Departments)
CREATE TABLE public.acquisition_corporate_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  industry TEXT,
  employee_count INTEGER,
  partnership_type TEXT DEFAULT 'employee_benefit' CHECK (partnership_type IN ('employee_benefit', 'relocation', 'corporate_housing', 'investment_club', 'preferred_vendor')),
  hr_contact_name TEXT,
  hr_contact_email TEXT,
  hr_contact_phone TEXT,
  benefits_offered JSONB DEFAULT '{"discount_percentage": 2, "priority_viewing": true, "dedicated_agent": true, "moving_assistance": true}'::jsonb,
  exclusive_listings BOOLEAN DEFAULT false,
  total_employees_registered INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  contract_start_date DATE,
  contract_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Corporate Employee Registrations
CREATE TABLE public.acquisition_corporate_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.acquisition_corporate_partnerships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_email TEXT NOT NULL,
  employee_name TEXT,
  employee_id_at_company TEXT,
  department TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  total_inquiries INTEGER DEFAULT 0,
  total_viewings INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partnership_id, employee_email)
);

-- University Student Housing Programs
CREATE TABLE public.acquisition_university_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university_name TEXT NOT NULL,
  university_logo_url TEXT,
  campus_location TEXT,
  student_population INTEGER,
  partnership_type TEXT DEFAULT 'student_housing' CHECK (partnership_type IN ('student_housing', 'faculty_housing', 'international_students', 'alumni', 'staff')),
  housing_office_contact TEXT,
  housing_office_email TEXT,
  housing_office_phone TEXT,
  international_office_contact TEXT,
  international_office_email TEXT,
  benefits_offered JSONB DEFAULT '{"student_discount": 10, "no_deposit_for_verified": true, "flexible_lease": true, "roommate_matching": true}'::jsonb,
  property_requirements JSONB,
  approved_properties UUID[],
  total_students_registered INTEGER DEFAULT 0,
  total_placements INTEGER DEFAULT 0,
  avg_lease_duration_months INTEGER,
  is_active BOOLEAN DEFAULT true,
  contract_start_date DATE,
  contract_end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student Registrations
CREATE TABLE public.acquisition_university_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.acquisition_university_partnerships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_email TEXT NOT NULL,
  student_name TEXT,
  student_id TEXT,
  program TEXT,
  year_of_study INTEGER,
  is_international BOOLEAN DEFAULT false,
  country_of_origin TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  housing_preferences JSONB,
  budget_range_min INTEGER,
  budget_range_max INTEGER,
  move_in_date DATE,
  lease_duration_months INTEGER,
  roommate_preferences JSONB,
  total_inquiries INTEGER DEFAULT 0,
  placement_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  placed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partnership_id, student_email)
);

-- Acquisition Analytics/CPA Tracking
CREATE TABLE public.acquisition_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('referral', 'bank_partnership', 'seo', 'influencer', 'corporate', 'university', 'organic', 'paid_ads', 'social')),
  source TEXT,
  campaign_id TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  spend INTEGER DEFAULT 0,
  cpc INTEGER, -- Cost per click
  cpa INTEGER, -- Cost per acquisition
  ltv INTEGER, -- Lifetime value
  roi NUMERIC(10,2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, channel, source)
);

-- Enable RLS
ALTER TABLE public.acquisition_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_bank_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_bank_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_seo_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_influencer_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_corporate_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_corporate_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_university_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_university_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_analytics ENABLE ROW LEVEL SECURITY;

-- Referral policies (users can see their own referrals)
CREATE POLICY "Users can view own referrals" ON public.acquisition_referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
CREATE POLICY "Users can create referrals" ON public.acquisition_referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Public read for SEO content
CREATE POLICY "Public can view published SEO content" ON public.acquisition_seo_content FOR SELECT USING (status = 'published');

-- Admin policies for all acquisition tables
CREATE POLICY "Admins manage referrals" ON public.acquisition_referrals FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage bank partnerships" ON public.acquisition_bank_partnerships FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage bank leads" ON public.acquisition_bank_leads FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage SEO content" ON public.acquisition_seo_content FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage influencers" ON public.acquisition_influencers FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage influencer campaigns" ON public.acquisition_influencer_campaigns FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage corporate partnerships" ON public.acquisition_corporate_partnerships FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage corporate employees" ON public.acquisition_corporate_employees FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage university partnerships" ON public.acquisition_university_partnerships FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage university students" ON public.acquisition_university_students FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage acquisition analytics" ON public.acquisition_analytics FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_acquisition_referrals_referrer ON public.acquisition_referrals(referrer_id);
CREATE INDEX idx_acquisition_referrals_status ON public.acquisition_referrals(status);
CREATE INDEX idx_acquisition_seo_slug ON public.acquisition_seo_content(slug);
CREATE INDEX idx_acquisition_seo_status ON public.acquisition_seo_content(status);
CREATE INDEX idx_acquisition_analytics_date ON public.acquisition_analytics(date, channel);

-- Trigger to update referral stats
CREATE OR REPLACE FUNCTION public.update_referral_conversion_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
    INSERT INTO public.acquisition_analytics (date, channel, source, conversions, revenue)
    VALUES (CURRENT_DATE, 'referral', NEW.source_channel, 1, NEW.referrer_reward_amount + NEW.referee_reward_amount)
    ON CONFLICT (date, channel, source) 
    DO UPDATE SET 
      conversions = acquisition_analytics.conversions + 1,
      revenue = acquisition_analytics.revenue + EXCLUDED.revenue;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_referral_conversion
  AFTER UPDATE ON public.acquisition_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_referral_conversion_stats();

-- Seed some sample data
INSERT INTO public.acquisition_bank_partnerships (bank_name, partnership_type, partnership_tier, commission_rate, is_featured) VALUES
('Bank Mandiri', 'mortgage', 'premium', 0.75, true),
('BCA', 'kpr', 'preferred', 0.60, true),
('BNI', 'mortgage', 'standard', 0.50, false),
('BTN', 'kpr', 'premium', 0.80, true);

INSERT INTO public.acquisition_university_partnerships (university_name, campus_location, student_population) VALUES
('Universitas Indonesia', 'Depok', 55000),
('Institut Teknologi Bandung', 'Bandung', 25000),
('Universitas Gadjah Mada', 'Yogyakarta', 58000);

INSERT INTO public.acquisition_corporate_partnerships (company_name, industry, employee_count, partnership_type) VALUES
('Tokopedia', 'E-commerce', 5000, 'employee_benefit'),
('Gojek', 'Technology', 8000, 'relocation'),
('Bank Mandiri', 'Banking', 35000, 'employee_benefit');