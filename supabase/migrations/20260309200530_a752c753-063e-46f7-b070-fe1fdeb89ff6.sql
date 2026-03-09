
CREATE TABLE IF NOT EXISTS public.property_roi_forecast (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  expected_roi NUMERIC,
  rental_yield NUMERIC,
  price_growth_forecast NUMERIC,
  market_risk TEXT DEFAULT 'medium',
  confidence_score INTEGER DEFAULT 0,
  comparable_count INTEGER DEFAULT 0,
  forecast_data JSONB,
  last_calculated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id)
);

ALTER TABLE public.property_roi_forecast ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ROI forecasts"
  ON public.property_roi_forecast
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage ROI forecasts"
  ON public.property_roi_forecast
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_roi_forecast_property ON public.property_roi_forecast(property_id);
CREATE INDEX idx_roi_forecast_roi ON public.property_roi_forecast(expected_roi DESC);
CREATE INDEX idx_roi_forecast_yield ON public.property_roi_forecast(rental_yield DESC);
