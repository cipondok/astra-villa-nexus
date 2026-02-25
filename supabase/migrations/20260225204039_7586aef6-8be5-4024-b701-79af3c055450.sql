
-- Add nearby_facilities and payment_methods JSONB columns to properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS nearby_facilities jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS payment_methods jsonb DEFAULT '[]'::jsonb;

-- Add index for JSONB containment queries
CREATE INDEX IF NOT EXISTS idx_properties_nearby_facilities ON public.properties USING gin (nearby_facilities);
CREATE INDEX IF NOT EXISTS idx_properties_payment_methods ON public.properties USING gin (payment_methods);

-- Comment for documentation
COMMENT ON COLUMN public.properties.nearby_facilities IS 'Array of nearby facility tags e.g. ["airport","lrt_mrt","shopping_mall"]';
COMMENT ON COLUMN public.properties.payment_methods IS 'Array of accepted payment methods e.g. ["online","bank_transfer","installment"]';
