-- B2B Data Marketplace Tables

-- B2B Client Types Enum
CREATE TYPE public.b2b_client_type AS ENUM ('agency', 'investor', 'developer', 'bank', 'other');

-- B2B Subscription Tiers
CREATE TYPE public.b2b_tier AS ENUM ('starter', 'professional', 'enterprise');

-- B2B Clients Table
CREATE TABLE public.b2b_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    client_type b2b_client_type NOT NULL,
    tier b2b_tier DEFAULT 'starter',
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    company_address TEXT,
    tax_id TEXT,
    website_url TEXT,
    logo_url TEXT,
    credits_balance INTEGER DEFAULT 0,
    lifetime_credits_purchased INTEGER DEFAULT 0,
    lifetime_credits_used INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    white_label_enabled BOOLEAN DEFAULT false,
    white_label_config JSONB DEFAULT '{}',
    api_rate_limit INTEGER DEFAULT 100,
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- B2B API Keys
CREATE TABLE public.b2b_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.b2b_clients(id) ON DELETE CASCADE NOT NULL,
    key_name TEXT NOT NULL,
    api_key_hash TEXT NOT NULL,
    api_key_prefix TEXT NOT NULL,
    permissions JSONB DEFAULT '["read"]',
    allowed_endpoints TEXT[] DEFAULT ARRAY['leads', 'insights', 'demographics', 'valuations'],
    ip_whitelist TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- B2B Credit Packages
CREATE TABLE public.b2b_credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    price_idr NUMERIC(15,2) NOT NULL,
    price_usd NUMERIC(10,2),
    bonus_credits INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    valid_days INTEGER DEFAULT 365,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- B2B Credit Transactions
CREATE TABLE public.b2b_credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.b2b_clients(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL, -- 'purchase', 'usage', 'refund', 'bonus', 'adjustment'
    credits INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_type TEXT, -- 'package', 'lead', 'report', 'api_call'
    reference_id UUID,
    description TEXT,
    payment_id TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Data Products Catalog
CREATE TABLE public.b2b_data_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_type TEXT NOT NULL, -- 'lead', 'insight', 'demographic', 'valuation', 'report'
    name TEXT NOT NULL,
    description TEXT,
    credit_cost INTEGER NOT NULL,
    target_clients b2b_client_type[],
    data_schema JSONB,
    sample_data JSONB,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lead Marketplace
CREATE TABLE public.b2b_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_source TEXT NOT NULL, -- 'inquiry', 'survey_booking', 'contact_form', 'chatbot'
    source_id UUID,
    property_id UUID,
    property_type TEXT,
    property_location TEXT,
    price_range_min NUMERIC(15,2),
    price_range_max NUMERIC(15,2),
    lead_name TEXT,
    lead_email TEXT,
    lead_phone TEXT,
    lead_budget NUMERIC(15,2),
    lead_intent TEXT, -- 'buy', 'rent', 'invest'
    lead_timeline TEXT,
    lead_score INTEGER DEFAULT 50,
    is_verified BOOLEAN DEFAULT false,
    is_sold BOOLEAN DEFAULT false,
    sold_to UUID REFERENCES public.b2b_clients(id),
    sold_at TIMESTAMPTZ,
    sold_price INTEGER,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Lead Purchases
CREATE TABLE public.b2b_lead_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.b2b_clients(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES public.b2b_leads(id) ON DELETE CASCADE NOT NULL,
    credits_spent INTEGER NOT NULL,
    purchase_price_idr NUMERIC(15,2),
    lead_data JSONB NOT NULL,
    contacted_at TIMESTAMPTZ,
    contact_result TEXT,
    conversion_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Market Insights
CREATE TABLE public.b2b_market_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type TEXT NOT NULL, -- 'price_trend', 'demand_analysis', 'rental_yield', 'market_forecast'
    region TEXT NOT NULL,
    city TEXT,
    district TEXT,
    property_type TEXT,
    data_period_start DATE,
    data_period_end DATE,
    insight_data JSONB NOT NULL,
    credit_cost INTEGER NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insight Purchases
CREATE TABLE public.b2b_insight_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.b2b_clients(id) ON DELETE CASCADE NOT NULL,
    insight_id UUID REFERENCES public.b2b_market_insights(id) ON DELETE CASCADE NOT NULL,
    credits_spent INTEGER NOT NULL,
    downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Custom Reports
CREATE TABLE public.b2b_custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.b2b_clients(id) ON DELETE CASCADE NOT NULL,
    report_type TEXT NOT NULL,
    report_title TEXT NOT NULL,
    parameters JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    credits_spent INTEGER NOT NULL,
    report_data JSONB,
    report_url TEXT,
    generated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- API Usage Logs
CREATE TABLE public.b2b_api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.b2b_clients(id) ON DELETE CASCADE NOT NULL,
    api_key_id UUID REFERENCES public.b2b_api_keys(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    request_params JSONB,
    response_status INTEGER,
    credits_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- White Label Configurations
CREATE TABLE public.b2b_white_label_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.b2b_clients(id) ON DELETE CASCADE NOT NULL UNIQUE,
    custom_domain TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    company_name TEXT,
    custom_css TEXT,
    email_templates JSONB DEFAULT '{}',
    report_branding JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.b2b_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_data_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_lead_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_insight_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_white_label_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- B2B Clients: Admins can do everything, clients can view their own
CREATE POLICY "Admins can manage b2b clients" ON public.b2b_clients
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own profile" ON public.b2b_clients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Clients can update own profile" ON public.b2b_clients
    FOR UPDATE USING (user_id = auth.uid());

-- API Keys: Clients manage their own
CREATE POLICY "Admins can manage api keys" ON public.b2b_api_keys
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can manage own api keys" ON public.b2b_api_keys
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.b2b_clients WHERE id = client_id AND user_id = auth.uid())
    );

-- Credit Packages: Public read, admin write
CREATE POLICY "Anyone can view active credit packages" ON public.b2b_credit_packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage credit packages" ON public.b2b_credit_packages
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Credit Transactions: Clients see their own
CREATE POLICY "Admins can manage credit transactions" ON public.b2b_credit_transactions
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own transactions" ON public.b2b_credit_transactions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.b2b_clients WHERE id = client_id AND user_id = auth.uid())
    );

-- Data Products: Public read active
CREATE POLICY "Anyone can view active products" ON public.b2b_data_products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.b2b_data_products
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Leads: Admins manage, sold leads visible to purchaser
CREATE POLICY "Admins can manage leads" ON public.b2b_leads
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view purchased leads" ON public.b2b_leads
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.b2b_clients WHERE id = sold_to AND user_id = auth.uid())
    );

-- Lead Purchases: Clients see their own
CREATE POLICY "Admins can manage lead purchases" ON public.b2b_lead_purchases
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own purchases" ON public.b2b_lead_purchases
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.b2b_clients WHERE id = client_id AND user_id = auth.uid())
    );

-- Market Insights: Public see public, clients see purchased
CREATE POLICY "Anyone can view public insights" ON public.b2b_market_insights
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage insights" ON public.b2b_market_insights
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insight Purchases
CREATE POLICY "Admins can manage insight purchases" ON public.b2b_insight_purchases
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own insight purchases" ON public.b2b_insight_purchases
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.b2b_clients WHERE id = client_id AND user_id = auth.uid())
    );

-- Custom Reports: Clients manage their own
CREATE POLICY "Admins can manage reports" ON public.b2b_custom_reports
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can manage own reports" ON public.b2b_custom_reports
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.b2b_clients WHERE id = client_id AND user_id = auth.uid())
    );

-- API Usage: Clients see their own
CREATE POLICY "Admins can view all api usage" ON public.b2b_api_usage
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own api usage" ON public.b2b_api_usage
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.b2b_clients WHERE id = client_id AND user_id = auth.uid())
    );

-- White Label: Clients manage their own
CREATE POLICY "Admins can manage white label" ON public.b2b_white_label_configs
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can manage own white label" ON public.b2b_white_label_configs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.b2b_clients WHERE id = client_id AND user_id = auth.uid())
    );

-- Insert default credit packages
INSERT INTO public.b2b_credit_packages (name, description, credits, price_idr, price_usd, bonus_credits, is_featured) VALUES
    ('Starter Pack', 'Perfect for small agencies', 100, 1500000, 95, 0, false),
    ('Professional Pack', 'Most popular for growing businesses', 500, 6000000, 380, 50, true),
    ('Business Pack', 'For established companies', 1000, 10000000, 630, 150, false),
    ('Enterprise Pack', 'Maximum value for large operations', 5000, 40000000, 2500, 1000, false);

-- Insert default data products
INSERT INTO public.b2b_data_products (product_type, name, description, credit_cost, target_clients, is_premium) VALUES
    ('lead', 'Property Inquiry Lead', 'Verified buyer/renter inquiry with contact details', 10, ARRAY['agency']::b2b_client_type[], false),
    ('lead', 'Premium Investment Lead', 'High-value investor inquiry with budget verification', 25, ARRAY['agency', 'investor']::b2b_client_type[], true),
    ('insight', 'Regional Price Trends', 'Quarterly price analysis for specified region', 15, ARRAY['investor', 'developer', 'bank']::b2b_client_type[], false),
    ('insight', 'Rental Yield Analysis', 'ROI and yield calculations by area', 20, ARRAY['investor']::b2b_client_type[], false),
    ('demographic', 'Area Demographics Report', 'Population, income, and lifestyle data', 30, ARRAY['developer', 'investor']::b2b_client_type[], false),
    ('valuation', 'Property Valuation Data', 'Automated valuation with comparables', 5, ARRAY['bank', 'agency']::b2b_client_type[], false),
    ('report', 'Custom Market Report', 'Tailored analysis based on your parameters', 50, ARRAY['investor', 'developer', 'bank']::b2b_client_type[], true);

-- Create indexes for performance
CREATE INDEX idx_b2b_clients_user ON public.b2b_clients(user_id);
CREATE INDEX idx_b2b_clients_type ON public.b2b_clients(client_type);
CREATE INDEX idx_b2b_api_keys_client ON public.b2b_api_keys(client_id);
CREATE INDEX idx_b2b_credit_transactions_client ON public.b2b_credit_transactions(client_id);
CREATE INDEX idx_b2b_leads_sold ON public.b2b_leads(is_sold, sold_to);
CREATE INDEX idx_b2b_api_usage_client ON public.b2b_api_usage(client_id);
CREATE INDEX idx_b2b_api_usage_created ON public.b2b_api_usage(created_at);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_b2b_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_b2b_clients_updated_at BEFORE UPDATE ON public.b2b_clients
    FOR EACH ROW EXECUTE FUNCTION public.update_b2b_updated_at();

CREATE TRIGGER update_b2b_credit_packages_updated_at BEFORE UPDATE ON public.b2b_credit_packages
    FOR EACH ROW EXECUTE FUNCTION public.update_b2b_updated_at();

CREATE TRIGGER update_b2b_data_products_updated_at BEFORE UPDATE ON public.b2b_data_products
    FOR EACH ROW EXECUTE FUNCTION public.update_b2b_updated_at();

CREATE TRIGGER update_b2b_market_insights_updated_at BEFORE UPDATE ON public.b2b_market_insights
    FOR EACH ROW EXECUTE FUNCTION public.update_b2b_updated_at();

CREATE TRIGGER update_b2b_white_label_updated_at BEFORE UPDATE ON public.b2b_white_label_configs
    FOR EACH ROW EXECUTE FUNCTION public.update_b2b_updated_at();