
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS longitude double precision;

CREATE INDEX IF NOT EXISTS idx_properties_lat_lng ON public.properties (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

COMMENT ON COLUMN public.properties.latitude IS 'Property latitude coordinate';
COMMENT ON COLUMN public.properties.longitude IS 'Property longitude coordinate';
