-- Add database indexes for frequently queried columns on vendor_business_profiles
-- These indexes will improve query performance and reduce connection timeouts

-- Index for filtering by business type (commonly used in searches)
CREATE INDEX IF NOT EXISTS idx_vendor_business_profiles_business_type 
ON public.vendor_business_profiles (business_type);

-- Index for filtering by active status (most common filter)
CREATE INDEX IF NOT EXISTS idx_vendor_business_profiles_is_active 
ON public.vendor_business_profiles (is_active);

-- Index for filtering by verification status
CREATE INDEX IF NOT EXISTS idx_vendor_business_profiles_is_verified 
ON public.vendor_business_profiles (is_verified);

-- Composite index for active and verified status (common combination)
CREATE INDEX IF NOT EXISTS idx_vendor_business_profiles_active_verified 
ON public.vendor_business_profiles (is_active, is_verified);

-- Index for sorting by rating (used in listings)
CREATE INDEX IF NOT EXISTS idx_vendor_business_profiles_rating 
ON public.vendor_business_profiles (rating DESC) 
WHERE is_active = true;

-- Index for filtering by creation date (used in admin panels)
CREATE INDEX IF NOT EXISTS idx_vendor_business_profiles_created_at 
ON public.vendor_business_profiles (created_at DESC);

-- Index for filtering by business finalization status
CREATE INDEX IF NOT EXISTS idx_vendor_business_profiles_business_finalized 
ON public.vendor_business_profiles (business_finalized_at) 
WHERE business_finalized_at IS NOT NULL;

-- Composite index for location-based queries (if using business_address as JSONB)
CREATE INDEX IF NOT EXISTS idx_vendor_business_profiles_service_areas 
ON public.vendor_business_profiles USING GIN (service_areas);

-- Index for BPJS status filtering (Indonesian compliance)
CREATE INDEX IF NOT EXISTS idx_vendor_business_profiles_bpjs_status 
ON public.vendor_business_profiles (bpjs_ketenagakerjaan_verified, bpjs_kesehatan_verified) 
WHERE is_active = true;