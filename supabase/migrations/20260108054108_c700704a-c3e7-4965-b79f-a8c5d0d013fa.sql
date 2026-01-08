-- Performance indexes for heavy traffic optimization (fixed)

-- Properties table - core search indexes
CREATE INDEX IF NOT EXISTS idx_properties_status_created 
ON public.properties(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_properties_city_status 
ON public.properties(city, status) WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_properties_price_status 
ON public.properties(price, status) WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_properties_property_type_status 
ON public.properties(property_type, status) WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_properties_listing_type_status 
ON public.properties(listing_type, status) WHERE status = 'approved';

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_search_composite 
ON public.properties(status, listing_type, city, property_type, price);

-- Filter usage table - for trending/suggestions
CREATE INDEX IF NOT EXISTS idx_filter_usage_count_recent 
ON public.filter_usage(usage_count DESC, last_used_at DESC);

CREATE INDEX IF NOT EXISTS idx_filter_usage_location 
ON public.filter_usage(location, usage_count DESC) WHERE location IS NOT NULL;

-- User interactions - for behavior analysis
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_recent 
ON public.user_interactions(user_id, created_at DESC);

-- Profiles - simple index for batch loading
CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON public.profiles(id);

-- Vendor business profiles - for vendor queries
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_active 
ON public.vendor_business_profiles(is_active, created_at DESC) WHERE is_active = true;

-- Search analytics - for performance tracking
CREATE INDEX IF NOT EXISTS idx_search_analytics_session_time 
ON public.search_analytics(session_id, created_at DESC);

-- Web analytics - for visitor tracking
CREATE INDEX IF NOT EXISTS idx_web_analytics_visitor_time 
ON public.web_analytics(visitor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_web_analytics_session_time 
ON public.web_analytics(session_id, created_at DESC);

-- Login attempts - for rate limiting
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time 
ON public.login_attempts(ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
ON public.login_attempts(email, created_at DESC);

-- Account lockouts - for security checks
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email_active 
ON public.account_lockouts(email, is_active) WHERE is_active = true;