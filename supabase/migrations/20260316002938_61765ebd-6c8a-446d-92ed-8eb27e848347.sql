
-- Agent Acquisition Pipeline

CREATE TABLE public.agent_acquisition_pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL,
  phone text,
  email text,
  city text NOT NULL,
  source_channel text NOT NULL CHECK (source_channel IN ('whatsapp','instagram','community_group','referral','direct','event','linkedin')),
  listing_portfolio_size int DEFAULT 0,
  specialization text,
  stage text NOT NULL DEFAULT 'identified' CHECK (stage IN ('identified','contacted','interested','onboarding','activated','churned')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  notes text,
  first_contacted_at timestamptz,
  activated_at timestamptz,
  first_listing_at timestamptz,
  first_lead_response_at timestamptz,
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_acquisition_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read agent pipeline" ON public.agent_acquisition_pipeline FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage agent pipeline" ON public.agent_acquisition_pipeline FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Seed realistic pipeline data
INSERT INTO public.agent_acquisition_pipeline (agent_name, phone, city, source_channel, listing_portfolio_size, specialization, stage, priority, notes) VALUES
('Budi Santoso', '+6281234567890', 'Jakarta Selatan', 'whatsapp', 45, 'Luxury villas & landed houses', 'activated', 'high', 'Top performer in Kemang area, 3 years experience'),
('Dewi Anggraeni', '+6281234567891', 'Jakarta Selatan', 'instagram', 30, 'Apartments & condos', 'activated', 'high', 'Strong social media presence, 5K followers'),
('Eko Prasetyo', '+6281234567892', 'Surabaya', 'community_group', 25, 'Commercial properties', 'onboarding', 'high', 'ERA Indonesia affiliate, East Java focus'),
('Fitri Handayani', '+6281234567893', 'Bandung', 'referral', 20, 'Highland villas', 'onboarding', 'medium', 'Referred by Budi Santoso'),
('Gunawan Tanjung', '+6281234567894', 'Bali', 'instagram', 60, 'Luxury villas & investment', 'activated', 'high', 'Top Bali agent, expat network strong'),
('Hadi Kurniawan', '+6281234567895', 'Semarang', 'whatsapp', 15, 'Residential houses', 'interested', 'medium', 'Responded positively, scheduling demo'),
('Indah Permata', '+6281234567896', 'Yogyakarta', 'community_group', 10, 'Student housing', 'interested', 'medium', 'Active in Jogja property groups'),
('Joko Widodo', '+6281234567897', 'Jakarta Barat', 'direct', 35, 'Mixed-use development', 'contacted', 'high', 'Developer contact, large portfolio'),
('Kartini Rahayu', '+6281234567898', 'Medan', 'linkedin', 20, 'Residential & commercial', 'contacted', 'medium', 'North Sumatra market specialist'),
('Lukman Hakim', '+6281234567899', 'Makassar', 'whatsapp', 12, 'Landed houses', 'identified', 'medium', 'Sulawesi expansion target'),
('Maya Sari', '+6281234567900', 'Jakarta Utara', 'event', 40, 'Waterfront properties', 'activated', 'high', 'Met at REI expo, premium segment'),
('Nanda Pratama', '+6281234567901', 'Tangerang', 'referral', 18, 'New development projects', 'onboarding', 'medium', 'BSD City and Alam Sutera specialist'),
('Oscar Hutapea', '+6281234567902', 'Balikpapan', 'whatsapp', 8, 'Residential', 'identified', 'low', 'Kalimantan expansion - early stage'),
('Putri Maharani', '+6281234567903', 'Surabaya', 'instagram', 28, 'Luxury apartments', 'interested', 'high', 'Strong personal brand, 8K followers'),
('Rizky Fauzan', '+6281234567904', 'Bandung', 'community_group', 22, 'Villa & homestay', 'onboarding', 'medium', 'Lembang area specialist');
