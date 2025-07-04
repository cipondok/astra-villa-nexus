-- =============================================
-- COMPREHENSIVE SERVICE BOOKING PLATFORM SCHEMA
-- =============================================

-- 1. CATEGORY SYSTEM (5-Level Hierarchical)
-- =============================================

CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
    image_path TEXT DEFAULT '/images/categories/default-category.jpg',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    UNIQUE(slug, parent_id),
    CONSTRAINT valid_hierarchy CHECK (
        (level = 1 AND parent_id IS NULL) OR 
        (level > 1 AND parent_id IS NOT NULL)
    )
);

-- Indexes for category system
CREATE INDEX idx_service_categories_parent ON public.service_categories(parent_id);
CREATE INDEX idx_service_categories_level ON public.service_categories(level);
CREATE INDEX idx_service_categories_active ON public.service_categories(is_active);
CREATE INDEX idx_service_categories_slug ON public.service_categories(slug);

-- 2. LOCATION MANAGEMENT (3-Tier System)
-- =============================================

CREATE TABLE IF NOT EXISTS public.service_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_name VARCHAR(255) NOT NULL,
    state_code VARCHAR(10) NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    city_code VARCHAR(10) NOT NULL,
    area_name VARCHAR(255) NOT NULL,
    area_code VARCHAR(10) NOT NULL,
    postal_code VARCHAR(20),
    coordinates POINT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure no duplicate state/city/area combinations
    UNIQUE(state_code, city_code, area_code)
);

-- Indexes for fast location search
CREATE INDEX idx_locations_state ON public.service_locations(state_name, state_code);
CREATE INDEX idx_locations_city ON public.service_locations(city_name, city_code);
CREATE INDEX idx_locations_area ON public.service_locations(area_name, area_code);
CREATE INDEX idx_locations_active ON public.service_locations(is_active);
CREATE INDEX idx_locations_postal ON public.service_locations(postal_code);

-- 3. ENHANCED USER SYSTEM
-- =============================================

-- User roles enum
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('customer', 'vendor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enhanced profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role user_role_type DEFAULT 'customer',
    avatar_url TEXT DEFAULT '/images/avatars/default-avatar.jpg',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendor business profiles
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_description TEXT,
    business_address TEXT,
    business_phone VARCHAR(20),
    business_email VARCHAR(255),
    business_registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    logo_url TEXT DEFAULT '/images/vendors/default-logo.jpg',
    banner_url TEXT DEFAULT '/images/vendors/default-banner.jpg',
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    verification_documents JSONB DEFAULT '[]',
    business_hours JSONB DEFAULT '{}',
    service_areas JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customer preferences
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    preferred_locations UUID[] DEFAULT '{}',
    preferred_categories UUID[] DEFAULT '{}',
    booking_preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. SERVICE MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS public.vendor_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    service_description TEXT,
    
    -- Complete 5-level category path (all levels required)
    category_level_1 UUID NOT NULL REFERENCES public.service_categories(id),
    category_level_2 UUID NOT NULL REFERENCES public.service_categories(id),
    category_level_3 UUID NOT NULL REFERENCES public.service_categories(id),
    category_level_4 UUID NOT NULL REFERENCES public.service_categories(id),
    category_level_5 UUID NOT NULL REFERENCES public.service_categories(id),
    
    -- Location reference
    location_id UUID NOT NULL REFERENCES public.service_locations(id),
    
    -- Pricing and duration
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    price_currency VARCHAR(3) DEFAULT 'USD',
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    pricing_type VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'hourly', 'custom')),
    
    -- Service details
    requirements TEXT,
    includes TEXT,
    excludes TEXT,
    cancellation_policy TEXT,
    
    -- Media
    featured_image TEXT DEFAULT '/images/services/default-service.jpg',
    gallery_images JSONB DEFAULT '[]',
    
    -- Status and metrics
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_bookings INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Availability
    availability_schedule JSONB DEFAULT '{}',
    advance_booking_days INTEGER DEFAULT 30,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure valid category hierarchy
    CONSTRAINT valid_category_hierarchy CHECK (
        category_level_1 != category_level_2 AND
        category_level_2 != category_level_3 AND
        category_level_3 != category_level_4 AND
        category_level_4 != category_level_5
    )
);

-- Indexes for service management
CREATE INDEX idx_services_vendor ON public.vendor_services(vendor_id);
CREATE INDEX idx_services_location ON public.vendor_services(location_id);
CREATE INDEX idx_services_categories ON public.vendor_services(category_level_1, category_level_2, category_level_3, category_level_4, category_level_5);
CREATE INDEX idx_services_active ON public.vendor_services(is_active);
CREATE INDEX idx_services_featured ON public.vendor_services(is_featured);
CREATE INDEX idx_services_price ON public.vendor_services(base_price);
CREATE INDEX idx_services_rating ON public.vendor_services(rating);

-- 5. BOOKING SYSTEM
-- =============================================

DO $$ BEGIN
    CREATE TYPE booking_status_type AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.vendor_services(id) ON DELETE CASCADE,
    
    -- Booking details
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Customer information
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    service_address TEXT NOT NULL,
    special_requests TEXT,
    
    -- Status tracking
    status booking_status_type DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    
    -- Timestamps
    confirmed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional data
    vendor_notes TEXT,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_review TEXT,
    vendor_rating INTEGER CHECK (vendor_rating >= 1 AND vendor_rating <= 5),
    vendor_review TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_booking_datetime CHECK (booking_date >= CURRENT_DATE),
    CONSTRAINT valid_status_transitions CHECK (
        (status = 'pending' AND confirmed_at IS NULL) OR
        (status = 'confirmed' AND confirmed_at IS NOT NULL) OR
        (status IN ('in_progress', 'completed', 'cancelled', 'refunded'))
    )
);

-- Indexes for booking system
CREATE INDEX idx_bookings_customer ON public.service_bookings(customer_id);
CREATE INDEX idx_bookings_vendor ON public.service_bookings(vendor_id);
CREATE INDEX idx_bookings_service ON public.service_bookings(service_id);
CREATE INDEX idx_bookings_date ON public.service_bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.service_bookings(status);
CREATE INDEX idx_bookings_payment ON public.service_bookings(payment_status);

-- 6. MEDIA MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL UNIQUE,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('category', 'service', 'vendor', 'user')),
    entity_id UUID NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure valid file types for different entities
    CONSTRAINT valid_media_type CHECK (
        (entity_type = 'category' AND mime_type LIKE 'image/%') OR
        (entity_type = 'service' AND mime_type LIKE 'image/%') OR
        (entity_type = 'vendor' AND mime_type LIKE 'image/%') OR
        (entity_type = 'user' AND mime_type LIKE 'image/%')
    )
);

-- Indexes for media management
CREATE INDEX idx_media_entity ON public.media_files(entity_type, entity_id);
CREATE INDEX idx_media_uploaded_by ON public.media_files(uploaded_by);
CREATE INDEX idx_media_featured ON public.media_files(is_featured);

-- 7. TRIGGERS AND FUNCTIONS
-- =============================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all relevant tables
CREATE TRIGGER update_service_categories_updated_at
    BEFORE UPDATE ON public.service_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_locations_updated_at
    BEFORE UPDATE ON public.service_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_profiles_updated_at
    BEFORE UPDATE ON public.vendor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at
    BEFORE UPDATE ON public.customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_services_updated_at
    BEFORE UPDATE ON public.vendor_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_bookings_updated_at
    BEFORE UPDATE ON public.service_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Categories: Public read, admin write
CREATE POLICY "Categories public read" ON public.service_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Categories admin write" ON public.service_categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Locations: Public read, admin write
CREATE POLICY "Locations public read" ON public.service_locations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Locations admin write" ON public.service_locations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- User profiles: Users can manage their own
CREATE POLICY "Users manage own profile" ON public.user_profiles
    FOR ALL USING (id = auth.uid());

-- Vendor profiles: Vendors manage their own
CREATE POLICY "Vendors manage own profile" ON public.vendor_profiles
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public read vendor profiles" ON public.vendor_profiles
    FOR SELECT USING (is_verified = true);

-- Customer profiles: Customers manage their own
CREATE POLICY "Customers manage own profile" ON public.customer_profiles
    FOR ALL USING (user_id = auth.uid());

-- Services: Vendors manage their own, public read active
CREATE POLICY "Vendors manage own services" ON public.vendor_services
    FOR ALL USING (
        vendor_id IN (SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Public read active services" ON public.vendor_services
    FOR SELECT USING (is_active = true);

-- Bookings: Users can see their own bookings
CREATE POLICY "Customers see own bookings" ON public.service_bookings
    FOR ALL USING (customer_id = auth.uid());

CREATE POLICY "Vendors see own bookings" ON public.service_bookings
    FOR ALL USING (
        vendor_id IN (SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid())
    );

-- Media: Users can manage their uploads, public read
CREATE POLICY "Users manage own media" ON public.media_files
    FOR ALL USING (uploaded_by = auth.uid());

CREATE POLICY "Public read media" ON public.media_files
    FOR SELECT USING (true);