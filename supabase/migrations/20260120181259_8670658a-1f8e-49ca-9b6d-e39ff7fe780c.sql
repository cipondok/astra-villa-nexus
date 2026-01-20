-- Add WNA eligibility field to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS wna_eligible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS investor_highlight boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.properties.wna_eligible IS 'Indicates if the property is eligible for foreign nationals (WNA) to purchase';
COMMENT ON COLUMN public.properties.is_featured IS 'Indicates if the property is featured/premium';
COMMENT ON COLUMN public.properties.investor_highlight IS 'Indicates if the property is highlighted for investors';

-- Create index for faster investor property queries
CREATE INDEX IF NOT EXISTS idx_properties_wna_eligible ON public.properties(wna_eligible) WHERE wna_eligible = true;
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_properties_investor ON public.properties(investor_highlight) WHERE investor_highlight = true;