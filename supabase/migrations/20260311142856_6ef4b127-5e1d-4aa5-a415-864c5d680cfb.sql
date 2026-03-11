
-- Infrastructure Expansion Signals
CREATE TABLE IF NOT EXISTS public.smart_city_infrastructure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  district text,
  infrastructure_type text NOT NULL, -- highway, metro, airport, cbd, industrial, tourism
  project_name text NOT NULL,
  impact_score numeric DEFAULT 0,
  accessibility_index numeric DEFAULT 0,
  expansion_velocity numeric DEFAULT 0,
  value_uplift_pct numeric DEFAULT 0,
  completion_stage text DEFAULT 'planned', -- planned, approved, under_construction, completed
  estimated_completion text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- District Evolution Predictions
CREATE TABLE IF NOT EXISTS public.smart_city_districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  district text NOT NULL,
  evolution_type text NOT NULL, -- cbd_migration, lifestyle, tech_hub, education_cluster, luxury_corridor
  premiumization_probability numeric DEFAULT 0,
  rental_demand_strength numeric DEFAULT 0,
  lifestyle_desirability numeric DEFAULT 0,
  capital_appreciation_index numeric DEFAULT 0,
  current_price_sqm numeric,
  projected_price_sqm_3y numeric,
  projected_price_sqm_5y numeric,
  drivers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Demographic Migration Forecasts
CREATE TABLE IF NOT EXISTS public.smart_city_demographics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  district text,
  population_inflow_score numeric DEFAULT 0,
  income_migration_shift text, -- upward, stable, downward
  remote_work_index numeric DEFAULT 0,
  expat_settlement_probability numeric DEFAULT 0,
  young_professional_demand numeric DEFAULT 0,
  housing_demand_growth numeric DEFAULT 0,
  absorption_capacity numeric DEFAULT 0,
  price_pressure_probability numeric DEFAULT 0,
  demographic_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Policy & Urban Planning Signals
CREATE TABLE IF NOT EXISTS public.smart_city_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  policy_type text NOT NULL, -- spatial_planning, tax_incentive, sez, foreign_ownership, green_city
  policy_name text NOT NULL,
  growth_acceleration_score numeric DEFAULT 0,
  investment_friendliness numeric DEFAULT 0,
  urban_transformation_index numeric DEFAULT 0,
  effective_date text,
  impact_summary text,
  policy_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Opportunity Zones
CREATE TABLE IF NOT EXISTS public.smart_city_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  district text NOT NULL,
  opportunity_type text NOT NULL, -- residential, commercial, land_banking, mixed_use
  growth_corridor_score numeric DEFAULT 0,
  investment_priority numeric DEFAULT 0,
  expected_roi_5y numeric DEFAULT 0,
  risk_level text DEFAULT 'moderate',
  entry_timing text,
  infrastructure_drivers jsonb DEFAULT '[]'::jsonb,
  demographic_drivers jsonb DEFAULT '[]'::jsonb,
  policy_drivers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.smart_city_infrastructure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_city_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_city_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_city_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_city_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read smart_city_infrastructure" ON public.smart_city_infrastructure FOR SELECT USING (true);
CREATE POLICY "Public read smart_city_districts" ON public.smart_city_districts FOR SELECT USING (true);
CREATE POLICY "Public read smart_city_demographics" ON public.smart_city_demographics FOR SELECT USING (true);
CREATE POLICY "Public read smart_city_policies" ON public.smart_city_policies FOR SELECT USING (true);
CREATE POLICY "Public read smart_city_opportunities" ON public.smart_city_opportunities FOR SELECT USING (true);

CREATE POLICY "Service insert smart_city_infrastructure" ON public.smart_city_infrastructure FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert smart_city_districts" ON public.smart_city_districts FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert smart_city_demographics" ON public.smart_city_demographics FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert smart_city_policies" ON public.smart_city_policies FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert smart_city_opportunities" ON public.smart_city_opportunities FOR INSERT WITH CHECK (true);
