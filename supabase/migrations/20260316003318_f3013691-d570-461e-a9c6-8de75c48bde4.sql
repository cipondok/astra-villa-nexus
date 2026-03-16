
-- Supply Expansion Tracking

CREATE TABLE public.supply_expansion_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  province text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('tier_1','tier_2','tier_3')),
  priority_rank int NOT NULL DEFAULT 0,
  target_listings int NOT NULL DEFAULT 0,
  current_listings int NOT NULL DEFAULT 0,
  target_agents int NOT NULL DEFAULT 0,
  current_agents int NOT NULL DEFAULT 0,
  demand_score int NOT NULL DEFAULT 0 CHECK (demand_score BETWEEN 0 AND 100),
  supply_gap_score int NOT NULL DEFAULT 0 CHECK (supply_gap_score BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','seeding','active','scaling','mature')),
  sourcing_channels jsonb DEFAULT '[]',
  notes text,
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.supply_quality_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  rule_category text NOT NULL CHECK (rule_category IN ('photos','description','pricing','location','completeness')),
  min_threshold int NOT NULL DEFAULT 0,
  description text,
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('blocker','warning','suggestion')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.supply_expansion_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_quality_standards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read supply targets" ON public.supply_expansion_targets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage supply targets" ON public.supply_expansion_targets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admin read quality standards" ON public.supply_quality_standards FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admin manage quality standards" ON public.supply_quality_standards FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Seed city expansion targets
INSERT INTO public.supply_expansion_targets (city, province, tier, priority_rank, target_listings, current_listings, target_agents, current_agents, demand_score, supply_gap_score, status, sourcing_channels, notes) VALUES
('Jakarta Selatan', 'DKI Jakarta', 'tier_1', 1, 500, 180, 50, 18, 92, 78, 'active', '["agent_onboarding","developer_partnership","owner_self_listing"]', 'Highest demand zone — luxury & premium residential'),
('Jakarta Barat', 'DKI Jakarta', 'tier_1', 2, 400, 120, 40, 12, 85, 82, 'seeding', '["agent_onboarding","owner_self_listing"]', 'Growing middle-class market, new developments'),
('Jakarta Utara', 'DKI Jakarta', 'tier_1', 3, 350, 95, 35, 8, 80, 85, 'seeding', '["agent_onboarding","developer_partnership"]', 'Waterfront & PIK area high demand'),
('Surabaya', 'Jawa Timur', 'tier_1', 4, 400, 85, 40, 10, 88, 88, 'active', '["agent_onboarding","community_group","developer_partnership"]', 'East Java capital — strong commercial demand'),
('Bandung', 'Jawa Barat', 'tier_1', 5, 350, 70, 35, 8, 82, 85, 'seeding', '["agent_onboarding","owner_self_listing"]', 'Highland villas, student housing, weekend retreats'),
('Denpasar', 'Bali', 'tier_1', 6, 500, 200, 45, 20, 95, 70, 'active', '["agent_onboarding","developer_partnership","owner_self_listing"]', 'Top tourist/investment destination — expat demand strong'),
('Tangerang Selatan', 'Banten', 'tier_1', 7, 300, 60, 30, 6, 78, 88, 'seeding', '["agent_onboarding","developer_partnership"]', 'BSD City, Alam Sutera — new development corridor'),
('Semarang', 'Jawa Tengah', 'tier_2', 8, 200, 30, 20, 4, 72, 90, 'planned', '["agent_onboarding","community_group"]', 'Central Java hub — emerging investment zone'),
('Yogyakarta', 'DI Yogyakarta', 'tier_2', 9, 200, 25, 20, 3, 68, 92, 'planned', '["agent_onboarding","owner_self_listing"]', 'Student city — rental demand, cultural tourism'),
('Medan', 'Sumatera Utara', 'tier_2', 10, 200, 20, 20, 2, 70, 93, 'planned', '["agent_onboarding","community_group"]', 'North Sumatra capital — untapped market'),
('Makassar', 'Sulawesi Selatan', 'tier_2', 11, 150, 10, 15, 1, 65, 95, 'planned', '["agent_onboarding"]', 'Eastern Indonesia gateway — early mover advantage'),
('Balikpapan', 'Kalimantan Timur', 'tier_3', 12, 100, 5, 10, 1, 60, 96, 'planned', '["agent_onboarding"]', 'Nusantara capital proximity — long-term growth play'),
('Malang', 'Jawa Timur', 'tier_2', 13, 150, 15, 15, 2, 66, 92, 'planned', '["agent_onboarding","owner_self_listing"]', 'Education city — highland retreat market'),
('Bekasi', 'Jawa Barat', 'tier_1', 14, 300, 45, 25, 5, 75, 88, 'seeding', '["agent_onboarding","developer_partnership"]', 'Jakarta satellite — affordable housing demand'),
('Depok', 'Jawa Barat', 'tier_2', 15, 200, 30, 20, 3, 72, 90, 'planned', '["agent_onboarding","owner_self_listing"]', 'University town — student and family housing');

-- Seed quality standards
INSERT INTO public.supply_quality_standards (rule_name, rule_category, min_threshold, description, severity) VALUES
('Minimum 5 photos per listing', 'photos', 5, 'Listings must have at least 5 high-quality photos showing exterior, interior rooms, and surroundings', 'blocker'),
('Primary photo resolution ≥ 1200px', 'photos', 1200, 'Main listing photo must be at least 1200px wide for optimal display', 'warning'),
('Description minimum 150 characters', 'description', 150, 'Property description must be at least 150 characters with meaningful content', 'blocker'),
('SEO-optimized title required', 'description', 1, 'Title must include property type, location, and key feature (AI-assisted)', 'warning'),
('Price must be specified', 'pricing', 1, 'All listings must have a valid price or price range', 'blocker'),
('Price within market range ±40%', 'pricing', 40, 'Price should be within 40% of area median to flag suspicious listings', 'warning'),
('GPS coordinates required', 'location', 1, 'Latitude and longitude must be provided for map display', 'blocker'),
('Complete address fields', 'location', 1, 'Province, city, district, and village/area must be filled', 'warning'),
('Property type specified', 'completeness', 1, 'Property type (house, apartment, villa, land, etc.) must be selected', 'blocker'),
('Bedrooms and bathrooms count', 'completeness', 1, 'Number of bedrooms and bathrooms required for residential properties', 'warning'),
('Land and building area specified', 'completeness', 1, 'Land area (m²) and building area (m²) must be provided', 'warning'),
('Certificate type indicated', 'completeness', 1, 'Property certificate type (SHM, SHGB, etc.) should be specified', 'suggestion');
