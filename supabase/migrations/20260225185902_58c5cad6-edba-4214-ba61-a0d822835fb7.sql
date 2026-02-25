
-- Add Indonesian property specification columns
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS land_area_sqm numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS building_area_sqm numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS floors integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS has_pool boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS garage_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS furnishing text DEFAULT NULL;

-- Add investment filter columns
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS roi_percentage numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rental_yield_percentage numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS legal_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_plan_available boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS handover_year integer DEFAULT NULL;

-- Add technology filter columns
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS has_vr boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_360_view boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_drone_video boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_interactive_floorplan boolean DEFAULT false;

-- Create indexes for commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_properties_legal_status ON public.properties (legal_status);
CREATE INDEX IF NOT EXISTS idx_properties_roi ON public.properties (roi_percentage) WHERE roi_percentage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_rental_yield ON public.properties (rental_yield_percentage) WHERE rental_yield_percentage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_view_type ON public.properties (view_type) WHERE view_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_furnishing ON public.properties (furnishing) WHERE furnishing IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_floors ON public.properties (floors) WHERE floors IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_land_area ON public.properties (land_area_sqm) WHERE land_area_sqm IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_building_area ON public.properties (building_area_sqm) WHERE building_area_sqm IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_handover ON public.properties (handover_year) WHERE handover_year IS NOT NULL;

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_listing_price_type ON public.properties (listing_type, price, property_type);
CREATE INDEX IF NOT EXISTS idx_properties_city_type_price ON public.properties (city, property_type, price);
