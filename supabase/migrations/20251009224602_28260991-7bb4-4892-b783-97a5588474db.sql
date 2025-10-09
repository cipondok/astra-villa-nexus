-- Critical indexes for property search performance under heavy traffic
-- These indexes will significantly improve query speed for common search patterns

-- Primary filters (most frequently used)
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);

-- Numeric range filters (price, area, rooms)
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price) WHERE price > 0;
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_bathrooms ON properties(bathrooms);
CREATE INDEX IF NOT EXISTS idx_properties_area_sqm ON properties(area_sqm);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- Location-based searches
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_location_text ON properties USING GIN(to_tsvector('english', location));

-- JSONB property_features index (critical for heavy traffic)
-- This enables fast filtering on furnishing, parking, amenities, certifications, etc.
CREATE INDEX IF NOT EXISTS idx_properties_features_gin ON properties USING GIN(property_features);

-- Full-text search index for title, description, and location
-- Enables fast text-based searches across multiple fields
CREATE INDEX IF NOT EXISTS idx_properties_fulltext ON properties 
  USING GIN(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(location,'')));

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_listing_price ON properties(listing_type, price) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_type_city ON properties(property_type, city) WHERE status = 'active';

-- Special feature indexes
CREATE INDEX IF NOT EXISTS idx_properties_3d_model ON properties(three_d_model_url) WHERE three_d_model_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_virtual_tour ON properties(virtual_tour_url) WHERE virtual_tour_url IS NOT NULL;