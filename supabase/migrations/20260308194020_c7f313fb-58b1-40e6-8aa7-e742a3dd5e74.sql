-- Add image_score column to property_seo_analysis
ALTER TABLE public.property_seo_analysis 
ADD COLUMN IF NOT EXISTS image_score INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN public.property_seo_analysis.image_score IS 'Image alt tag SEO score (0-100), part of the 4-component 25-weight model';