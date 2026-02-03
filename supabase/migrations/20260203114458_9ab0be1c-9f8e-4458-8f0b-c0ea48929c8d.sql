-- Expansion Phases table
CREATE TABLE public.expansion_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_number INTEGER NOT NULL UNIQUE,
  phase_name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'paused')),
  total_budget NUMERIC(20, 2) DEFAULT 0,
  spent_budget NUMERIC(20, 2) DEFAULT 0,
  target_market_share NUMERIC(5, 2),
  kpis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expansion Cities table
CREATE TABLE public.expansion_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_id UUID NOT NULL REFERENCES public.expansion_phases(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  province TEXT NOT NULL,
  population BIGINT,
  property_market_size NUMERIC(25, 2),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'launching', 'active', 'mature', 'paused')),
  launch_date DATE,
  target_listings INTEGER,
  current_listings INTEGER DEFAULT 0,
  target_agents INTEGER,
  current_agents INTEGER DEFAULT 0,
  target_monthly_transactions INTEGER,
  current_monthly_transactions INTEGER DEFAULT 0,
  localization_status JSONB DEFAULT '{"language": false, "payment": false, "legal": false, "marketing": false}',
  competitors JSONB DEFAULT '[]',
  marketing_budget NUMERIC(20, 2) DEFAULT 0,
  marketing_spent NUMERIC(20, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Competitor Analysis table
CREATE TABLE public.expansion_competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.expansion_cities(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  website_url TEXT,
  market_share NUMERIC(5, 2),
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  pricing_model TEXT,
  estimated_listings INTEGER,
  threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketing Campaigns per city
CREATE TABLE public.expansion_marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.expansion_cities(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT CHECK (campaign_type IN ('digital', 'outdoor', 'events', 'partnerships', 'pr', 'referral')),
  channel TEXT,
  budget NUMERIC(20, 2) NOT NULL,
  spent NUMERIC(20, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  target_reach INTEGER,
  actual_reach INTEGER,
  target_leads INTEGER,
  actual_leads INTEGER,
  roi_percentage NUMERIC(8, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expansion Milestones
CREATE TABLE public.expansion_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_id UUID REFERENCES public.expansion_phases(id) ON DELETE CASCADE,
  city_id UUID REFERENCES public.expansion_cities(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
  assigned_to TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expansion_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expansion_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expansion_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expansion_marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expansion_milestones ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can manage expansion phases"
ON public.expansion_phases FOR ALL
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage expansion cities"
ON public.expansion_cities FOR ALL
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage competitors"
ON public.expansion_competitors FOR ALL
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage marketing campaigns"
ON public.expansion_marketing_campaigns FOR ALL
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage milestones"
ON public.expansion_milestones FOR ALL
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_expansion_phases_updated_at
  BEFORE UPDATE ON public.expansion_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expansion_cities_updated_at
  BEFORE UPDATE ON public.expansion_cities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expansion_competitors_updated_at
  BEFORE UPDATE ON public.expansion_competitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expansion_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.expansion_marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expansion_milestones_updated_at
  BEFORE UPDATE ON public.expansion_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial expansion plan data
INSERT INTO public.expansion_phases (phase_number, phase_name, description, start_date, end_date, status, total_budget, target_market_share) VALUES
(1, 'Jakarta Mastery', 'Complete market dominance in Jakarta metropolitan area', '2026-02-01', '2026-07-31', 'active', 500000000, 25.00),
(2, 'Regional Expansion', 'Expand to 3 nearby major cities: Bandung, Bogor, Tangerang', '2026-08-01', '2027-01-31', 'planning', 750000000, 15.00),
(3, 'Java Dominance', 'Regional dominance across Java island', '2027-02-01', '2028-01-31', 'planning', 1500000000, 20.00),
(4, 'National Presence', 'Nationwide expansion to all major Indonesian cities', '2028-02-01', '2029-01-31', 'planning', 3000000000, 10.00);

-- Seed Phase 1 city (Jakarta)
INSERT INTO public.expansion_cities (phase_id, city_name, province, population, property_market_size, status, launch_date, target_listings, target_agents, target_monthly_transactions, marketing_budget, localization_status, competitors)
SELECT id, 'Jakarta', 'DKI Jakarta', 10560000, 500000000000, 'active', '2026-02-01', 5000, 500, 200,
  250000000,
  '{"language": true, "payment": true, "legal": true, "marketing": true}',
  '[{"name": "Rumah123", "threat": "high"}, {"name": "OLX Property", "threat": "medium"}, {"name": "99.co", "threat": "medium"}]'
FROM public.expansion_phases WHERE phase_number = 1;

-- Seed Phase 2 cities
INSERT INTO public.expansion_cities (phase_id, city_name, province, population, property_market_size, status, target_listings, target_agents, target_monthly_transactions, marketing_budget)
SELECT id, 'Bandung', 'Jawa Barat', 2500000, 80000000000, 'planned', 2000, 150, 80, 150000000
FROM public.expansion_phases WHERE phase_number = 2;

INSERT INTO public.expansion_cities (phase_id, city_name, province, population, property_market_size, status, target_listings, target_agents, target_monthly_transactions, marketing_budget)
SELECT id, 'Bogor', 'Jawa Barat', 1100000, 45000000000, 'planned', 1500, 100, 50, 100000000
FROM public.expansion_phases WHERE phase_number = 2;

INSERT INTO public.expansion_cities (phase_id, city_name, province, population, property_market_size, status, target_listings, target_agents, target_monthly_transactions, marketing_budget)
SELECT id, 'Tangerang', 'Banten', 2100000, 70000000000, 'planned', 1800, 120, 70, 120000000
FROM public.expansion_phases WHERE phase_number = 2;