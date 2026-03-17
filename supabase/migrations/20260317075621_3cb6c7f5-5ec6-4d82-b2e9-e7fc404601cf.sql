
-- Developer Projects
CREATE TABLE public.developer_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  developer_name text,
  developer_logo_url text,
  description text,
  concept text,
  city text NOT NULL,
  district text,
  province text,
  full_address text,
  latitude numeric,
  longitude numeric,
  nearby_landmarks jsonb DEFAULT '[]'::jsonb,
  property_type text DEFAULT 'villa',
  hero_images text[] DEFAULT '{}',
  masterplan_images text[] DEFAULT '{}',
  gallery_images text[] DEFAULT '{}',
  video_url text,
  total_units int DEFAULT 0,
  available_units int DEFAULT 0,
  reserved_units int DEFAULT 0,
  sold_units int DEFAULT 0,
  price_range_min numeric,
  price_range_max numeric,
  expected_completion_date date,
  launch_date date,
  launch_phase text DEFAULT 'pre_launch' CHECK (launch_phase IN ('pre_launch', 'soft_launch', 'launching', 'active_sales', 'sold_out', 'completed')),
  amenities text[] DEFAULT '{}',
  facilities jsonb DEFAULT '[]'::jsonb,
  ai_demand_label text,
  ai_demand_score int,
  ai_investment_grade text,
  ai_rental_yield numeric,
  ai_roi_5y numeric,
  project_score int,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  early_investor_access boolean DEFAULT false,
  commission_rate numeric DEFAULT 2.0,
  total_leads int DEFAULT 0,
  total_views int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.developer_projects ENABLE ROW LEVEL SECURITY;

-- Public can view published projects
CREATE POLICY "Public can view published projects" ON public.developer_projects
  FOR SELECT USING (is_published = true);

-- Developers manage own projects
CREATE POLICY "Developers manage own projects" ON public.developer_projects
  FOR ALL TO authenticated USING (auth.uid() = developer_id) WITH CHECK (auth.uid() = developer_id);

-- Project Units
CREATE TABLE public.project_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  unit_name text NOT NULL,
  unit_type text NOT NULL,
  floor_plan_url text,
  bedrooms int,
  bathrooms int,
  building_area_sqm numeric,
  land_area_sqm numeric,
  price numeric NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'hold')),
  reserved_by uuid REFERENCES auth.users(id),
  reserved_at timestamptz,
  features text[] DEFAULT '{}',
  floor_level int,
  view_direction text,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_units ENABLE ROW LEVEL SECURITY;

-- Public can view units of published projects
CREATE POLICY "Public can view project units" ON public.project_units
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.developer_projects dp WHERE dp.id = project_id AND dp.is_published = true)
  );

-- Project owner manages units
CREATE POLICY "Developer manages own project units" ON public.project_units
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.developer_projects dp WHERE dp.id = project_id AND dp.developer_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.developer_projects dp WHERE dp.id = project_id AND dp.developer_id = auth.uid())
  );

-- Project Leads
CREATE TABLE public.project_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  budget_range text,
  preferred_unit_type text,
  message text,
  intent text DEFAULT 'interest' CHECK (intent IN ('interest', 'reservation', 'viewing', 'investment')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source text DEFAULT 'website',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  notes text,
  contacted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_leads ENABLE ROW LEVEL SECURITY;

-- Users can create leads (register interest)
CREATE POLICY "Authenticated users can create leads" ON public.project_leads
  FOR INSERT TO authenticated WITH CHECK (true);

-- Anon can also register interest
CREATE POLICY "Anon can create leads" ON public.project_leads
  FOR INSERT TO anon WITH CHECK (true);

-- Users see own leads
CREATE POLICY "Users see own leads" ON public.project_leads
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Developers see leads for their projects
CREATE POLICY "Developers see project leads" ON public.project_leads
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.developer_projects dp WHERE dp.id = project_id AND dp.developer_id = auth.uid())
  );

-- Developers update leads for their projects
CREATE POLICY "Developers update project leads" ON public.project_leads
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.developer_projects dp WHERE dp.id = project_id AND dp.developer_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_dev_projects_developer ON public.developer_projects(developer_id);
CREATE INDEX idx_dev_projects_city ON public.developer_projects(city);
CREATE INDEX idx_dev_projects_phase ON public.developer_projects(launch_phase);
CREATE INDEX idx_project_units_project ON public.project_units(project_id);
CREATE INDEX idx_project_leads_project ON public.project_leads(project_id);
CREATE INDEX idx_project_leads_user ON public.project_leads(user_id);

-- Auto-update triggers
CREATE TRIGGER trg_developer_projects_updated
  BEFORE UPDATE ON public.developer_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_watchlist_updated_at();

CREATE TRIGGER trg_project_units_updated
  BEFORE UPDATE ON public.project_units
  FOR EACH ROW EXECUTE FUNCTION public.update_watchlist_updated_at();

CREATE TRIGGER trg_project_leads_updated
  BEFORE UPDATE ON public.project_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_watchlist_updated_at();
