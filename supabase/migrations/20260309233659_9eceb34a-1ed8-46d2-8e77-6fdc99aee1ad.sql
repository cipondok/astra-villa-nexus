-- Performance indexes for map search at 100k+ scale
-- (demand_heat_score index removed - column doesn't exist on properties table)

-- Index for SEO analysis lookups
CREATE INDEX IF NOT EXISTS idx_property_seo_score 
ON public.property_seo_analysis (seo_score, last_analyzed_at DESC);

-- Index for AI job queue performance
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status_created 
ON public.ai_jobs (status, created_at DESC);

-- Index for ROI forecast lookups
CREATE INDEX IF NOT EXISTS idx_roi_forecast_property 
ON public.property_roi_forecast (property_id, created_at DESC);