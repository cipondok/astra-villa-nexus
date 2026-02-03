
-- Agent Listing Syndication Network
CREATE TABLE public.listing_syndication_networks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  network_name TEXT NOT NULL,
  network_type TEXT NOT NULL,
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  supported_property_types TEXT[] DEFAULT '{}',
  supported_regions TEXT[] DEFAULT '{}',
  listing_fee DECIMAL(15,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  sync_frequency_hours INTEGER DEFAULT 24,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  total_listings_shared INTEGER DEFAULT 0,
  total_leads_received INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Syndicated Listings
CREATE TABLE public.syndicated_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  network_id UUID REFERENCES public.listing_syndication_networks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.profiles(id),
  external_listing_id TEXT,
  external_url TEXT,
  status TEXT DEFAULT 'pending',
  syndication_type TEXT DEFAULT 'automatic',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, network_id)
);

-- Buyer Demand Data API
CREATE TABLE public.buyer_demand_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_city TEXT NOT NULL,
  location_area TEXT,
  property_type TEXT NOT NULL,
  time_period DATE NOT NULL,
  search_volume INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  viewing_requests INTEGER DEFAULT 0,
  offer_count INTEGER DEFAULT 0,
  avg_search_budget_min DECIMAL(18,2),
  avg_search_budget_max DECIMAL(18,2),
  median_offer_price DECIMAL(18,2),
  price_trend_percentage DECIMAL(5,2),
  buyer_demographics JSONB DEFAULT '{}',
  popular_features TEXT[] DEFAULT '{}',
  avg_time_to_decision_days INTEGER,
  available_listings INTEGER DEFAULT 0,
  demand_supply_ratio DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Off-Market Deals Access
CREATE TABLE public.off_market_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id),
  seller_id UUID REFERENCES public.profiles(id),
  property_type TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_area TEXT,
  size_sqm DECIMAL(12,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  asking_price DECIMAL(18,2),
  estimated_value DECIMAL(18,2),
  discount_percentage DECIMAL(5,2),
  deal_type TEXT NOT NULL,
  urgency_level TEXT DEFAULT 'normal',
  exclusivity_days INTEGER DEFAULT 14,
  minimum_investor_tier TEXT DEFAULT 'gold',
  status TEXT DEFAULT 'available',
  views_count INTEGER DEFAULT 0,
  nda_required BOOLEAN DEFAULT true,
  express_interest_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Investor Access to Off-Market
CREATE TABLE public.investor_deal_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID REFERENCES public.profiles(id),
  deal_id UUID REFERENCES public.off_market_deals(id) ON DELETE CASCADE,
  access_type TEXT DEFAULT 'view',
  nda_signed_at TIMESTAMP WITH TIME ZONE,
  nda_document_url TEXT,
  expressed_interest BOOLEAN DEFAULT false,
  interest_amount DECIMAL(18,2),
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(investor_id, deal_id)
);

-- Research Data Packages
CREATE TABLE public.research_data_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name TEXT NOT NULL,
  package_type TEXT NOT NULL,
  description TEXT,
  data_scope JSONB DEFAULT '{}',
  anonymization_level TEXT DEFAULT 'high',
  update_frequency TEXT DEFAULT 'monthly',
  records_count INTEGER DEFAULT 0,
  sample_data JSONB DEFAULT '{}',
  license_type TEXT DEFAULT 'subscription',
  price_monthly DECIMAL(18,2),
  price_yearly DECIMAL(18,2),
  price_one_time DECIMAL(18,2),
  api_credits_included INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  allowed_use_cases TEXT[] DEFAULT '{}',
  restricted_use_cases TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Research Data Subscriptions
CREATE TABLE public.research_data_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES public.profiles(id),
  package_id UUID REFERENCES public.research_data_packages(id),
  organization_name TEXT,
  organization_type TEXT,
  use_case_description TEXT,
  subscription_type TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  api_credits_used INTEGER DEFAULT 0,
  api_credits_limit INTEGER DEFAULT 1000,
  last_download_at TIMESTAMP WITH TIME ZONE,
  total_downloads INTEGER DEFAULT 0,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data Exchange API Access Logs
CREATE TABLE public.data_exchange_api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id),
  subscription_id UUID REFERENCES public.research_data_subscriptions(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_params JSONB DEFAULT '{}',
  response_status INTEGER,
  response_time_ms INTEGER,
  credits_used INTEGER DEFAULT 1,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data Licensing Agreements
CREATE TABLE public.data_licensing_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  licensee_id UUID REFERENCES public.profiles(id),
  license_type TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  organization_country TEXT,
  data_categories TEXT[] NOT NULL,
  usage_rights JSONB DEFAULT '{}',
  restrictions JSONB DEFAULT '{}',
  territory TEXT[] DEFAULT ARRAY['Indonesia'],
  license_fee DECIMAL(18,2) NOT NULL,
  payment_frequency TEXT DEFAULT 'annual',
  revenue_share_percentage DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_document_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listing_syndication_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndicated_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_demand_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.off_market_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_deal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_data_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_data_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exchange_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_licensing_agreements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active networks" ON public.listing_syndication_networks FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage networks" ON public.listing_syndication_networks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Agents can view own syndicated listings" ON public.syndicated_listings FOR SELECT USING (agent_id = auth.uid());
CREATE POLICY "Agents can manage own listings" ON public.syndicated_listings FOR ALL USING (agent_id = auth.uid());

CREATE POLICY "API clients can view demand data" ON public.buyer_demand_data FOR SELECT USING (true);

CREATE POLICY "Qualified investors can view deals" ON public.off_market_deals FOR SELECT USING (status = 'available');

CREATE POLICY "Investors can view own access" ON public.investor_deal_access FOR SELECT USING (investor_id = auth.uid());
CREATE POLICY "Investors can create access" ON public.investor_deal_access FOR INSERT WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Anyone can view active packages" ON public.research_data_packages FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own subscriptions" ON public.research_data_subscriptions FOR SELECT USING (subscriber_id = auth.uid());
CREATE POLICY "Users can create subscriptions" ON public.research_data_subscriptions FOR INSERT WITH CHECK (subscriber_id = auth.uid());

CREATE POLICY "Users can view own API logs" ON public.data_exchange_api_logs FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Users can view own licenses" ON public.data_licensing_agreements FOR SELECT USING (licensee_id = auth.uid());

-- Seed syndication networks
INSERT INTO public.listing_syndication_networks (network_name, network_type, supported_property_types, supported_regions, is_active) VALUES
('Rumah123', 'portal', ARRAY['house', 'apartment', 'villa', 'land'], ARRAY['Jakarta', 'Bali', 'Surabaya', 'Bandung'], true),
('OLX Property', 'aggregator', ARRAY['house', 'apartment', 'commercial', 'land'], ARRAY['All Indonesia'], true),
('PropertyGuru Indonesia', 'portal', ARRAY['house', 'apartment', 'villa', 'commercial'], ARRAY['Jakarta', 'Bali', 'Surabaya'], true),
('Lamudi', 'portal', ARRAY['house', 'apartment', 'villa', 'land', 'commercial'], ARRAY['All Indonesia'], true),
('Agent Alliance MLS', 'mls', ARRAY['house', 'apartment', 'villa'], ARRAY['Jakarta', 'Bali'], true);

-- Seed research data packages
INSERT INTO public.research_data_packages (package_name, package_type, description, anonymization_level, price_monthly, price_yearly, api_credits_included, is_active) VALUES
('Transaction Analytics Basic', 'transaction', 'Anonymized property transaction data with price trends', 'high', 2500000, 25000000, 500, true),
('Market Trends Pro', 'market_trends', 'Comprehensive market analysis with demand indicators', 'medium', 5000000, 50000000, 1000, true),
('Demographics Insights', 'demographics', 'Buyer demographics and behavioral patterns by region', 'full', 3500000, 35000000, 750, true),
('Rental Yields Index', 'rental_yields', 'Rental yield data with occupancy rates', 'high', 2000000, 20000000, 400, true),
('Enterprise Data Suite', 'transaction', 'Full access to all data categories', 'medium', 15000000, 150000000, 5000, true);

-- Create indexes
CREATE INDEX idx_syndicated_listings_property ON public.syndicated_listings(property_id);
CREATE INDEX idx_syndicated_listings_network ON public.syndicated_listings(network_id);
CREATE INDEX idx_syndicated_listings_agent ON public.syndicated_listings(agent_id);
CREATE INDEX idx_buyer_demand_location ON public.buyer_demand_data(location_city, property_type);
CREATE INDEX idx_off_market_status ON public.off_market_deals(status);
CREATE INDEX idx_investor_access_investor ON public.investor_deal_access(investor_id);
CREATE INDEX idx_research_subscriptions_subscriber ON public.research_data_subscriptions(subscriber_id);
CREATE INDEX idx_api_logs_client ON public.data_exchange_api_logs(client_id);
