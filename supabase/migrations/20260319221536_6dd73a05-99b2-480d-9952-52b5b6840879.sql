
-- =============================================
-- PLANETARY WEALTH INTELLIGENCE ENGINE
-- =============================================

-- 1) Global Wealth Flow Observatory
CREATE TABLE public.wealth_flow_observatory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_type TEXT NOT NULL CHECK (flow_type IN (
    'cross_border_capital', 'institutional_reallocation', 'sovereign_fund_entry',
    'uhnw_migration', 'pension_fund_deployment', 'family_office_allocation'
  )),
  origin_country TEXT,
  destination_country TEXT NOT NULL DEFAULT 'Indonesia',
  destination_city TEXT,
  flow_volume_usd NUMERIC(18,2) DEFAULT 0,
  flow_velocity NUMERIC(8,2) DEFAULT 0,
  confidence_score NUMERIC(4,2) DEFAULT 0.5 CHECK (confidence_score BETWEEN 0 AND 1),
  signal_sources JSONB DEFAULT '[]'::jsonb,
  trend_direction TEXT CHECK (trend_direction IN ('accelerating', 'stable', 'decelerating', 'reversing')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wealth_flow_dest ON public.wealth_flow_observatory (destination_country, destination_city);
CREATE INDEX idx_wealth_flow_type ON public.wealth_flow_observatory (flow_type);

-- 2) Property Wealth Creation Index
CREATE TABLE public.wealth_creation_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  -- Component metrics
  capital_appreciation_rate NUMERIC(6,2) DEFAULT 0,
  rental_yield_stability NUMERIC(5,2) DEFAULT 0,
  liquidity_adjusted_roi NUMERIC(6,2) DEFAULT 0,
  time_to_exit_months NUMERIC(5,1) DEFAULT 0,
  absorption_rate NUMERIC(5,2) DEFAULT 0,
  price_momentum NUMERIC(5,2) DEFAULT 0,
  -- Composite
  wealth_creation_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (wealth_creation_score BETWEEN 0 AND 100),
  wealth_tier TEXT CHECK (wealth_tier IN (
    'sovereign_grade', 'institutional_grade', 'premium', 'standard', 'speculative'
  )),
  yoy_change_pct NUMERIC(6,2) DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city, district)
);

CREATE INDEX idx_wci_score ON public.wealth_creation_index (wealth_creation_score DESC);
CREATE INDEX idx_wci_city ON public.wealth_creation_index (city);

-- 3) Wealth Concentration Heatmap
CREATE TABLE public.wealth_concentration_heatmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  total_asset_value_usd NUMERIC(18,2) DEFAULT 0,
  luxury_demand_index NUMERIC(5,2) DEFAULT 0,
  asset_density_per_sqkm NUMERIC(10,2) DEFAULT 0,
  uhnw_resident_estimate INTEGER DEFAULT 0,
  wealth_accumulation_velocity NUMERIC(8,2) DEFAULT 0,
  concentration_tier TEXT CHECK (concentration_tier IN (
    'ultra_concentrated', 'high_concentration', 'moderate', 'emerging', 'nascent'
  )),
  emerging_cluster BOOLEAN DEFAULT false,
  cluster_signals JSONB DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city, district)
);

CREATE INDEX idx_wealth_conc_tier ON public.wealth_concentration_heatmap (concentration_tier);

-- 4) Intergenerational Asset Growth Predictor
CREATE TABLE public.intergenerational_asset_predictor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  -- Compounding projections
  compound_growth_5y NUMERIC(6,2) DEFAULT 0,
  compound_growth_10y NUMERIC(6,2) DEFAULT 0,
  compound_growth_25y NUMERIC(6,2) DEFAULT 0,
  -- Resilience metrics
  district_resilience_score NUMERIC(5,2) DEFAULT 0,
  macro_preservation_index NUMERIC(5,2) DEFAULT 0,
  inflation_hedge_effectiveness NUMERIC(5,2) DEFAULT 0,
  -- Forecasts
  projected_value_multiplier_10y NUMERIC(6,2) DEFAULT 1,
  generational_wealth_score NUMERIC(5,2) DEFAULT 0 CHECK (generational_wealth_score BETWEEN 0 AND 100),
  wealth_preservation_tier TEXT CHECK (wealth_preservation_tier IN (
    'dynastic', 'multi_generational', 'generational', 'medium_term', 'short_term'
  )),
  model_confidence NUMERIC(4,2) DEFAULT 0.5,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city, district)
);

CREATE INDEX idx_intergen_score ON public.intergenerational_asset_predictor (generational_wealth_score DESC);

-- 5) Wealth Risk Radar
CREATE TABLE public.wealth_risk_radar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  risk_type TEXT NOT NULL CHECK (risk_type IN (
    'asset_bubble', 'debt_driven_appreciation', 'liquidity_contraction',
    'regulatory_shock', 'currency_depreciation', 'oversupply_wave',
    'demand_collapse', 'geopolitical_disruption'
  )),
  risk_severity NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (risk_severity BETWEEN 0 AND 100),
  risk_probability NUMERIC(4,2) DEFAULT 0.5 CHECK (risk_probability BETWEEN 0 AND 1),
  potential_impact_pct NUMERIC(6,2) DEFAULT 0,
  risk_indicators JSONB DEFAULT '{}'::jsonb,
  mitigation_strategy TEXT,
  alert_status TEXT CHECK (alert_status IN ('monitoring', 'elevated', 'critical', 'triggered')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_radar_city ON public.wealth_risk_radar (city);
CREATE INDEX idx_risk_radar_severity ON public.wealth_risk_radar (risk_severity DESC);
CREATE INDEX idx_risk_radar_status ON public.wealth_risk_radar (alert_status);

-- 6) Enable RLS
ALTER TABLE public.wealth_flow_observatory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wealth_creation_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wealth_concentration_heatmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intergenerational_asset_predictor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wealth_risk_radar ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Authenticated read wealth flows" ON public.wealth_flow_observatory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read wealth index" ON public.wealth_creation_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read wealth heatmap" ON public.wealth_concentration_heatmap FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read asset predictor" ON public.intergenerational_asset_predictor FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read risk radar" ON public.wealth_risk_radar FOR SELECT TO authenticated USING (true);

-- Service role write policies
CREATE POLICY "Service manage wealth flows" ON public.wealth_flow_observatory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage wealth index" ON public.wealth_creation_index FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage wealth heatmap" ON public.wealth_concentration_heatmap FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage asset predictor" ON public.intergenerational_asset_predictor FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage risk radar" ON public.wealth_risk_radar FOR ALL USING (true) WITH CHECK (true);

-- 7) Trigger: emit critical wealth risk signal
CREATE OR REPLACE FUNCTION public.trg_wealth_risk_critical()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.alert_status = 'critical' AND NEW.risk_severity >= 80 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'wealth_risk_critical',
      'wealth_risk',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'city', NEW.city,
        'district', NEW.district,
        'risk_type', NEW.risk_type,
        'risk_severity', NEW.risk_severity,
        'risk_probability', NEW.risk_probability,
        'potential_impact_pct', NEW.potential_impact_pct,
        'alert_status', NEW.alert_status
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_wealth_risk_critical_alert
  AFTER INSERT OR UPDATE ON public.wealth_risk_radar
  FOR EACH ROW EXECUTE FUNCTION public.trg_wealth_risk_critical();
