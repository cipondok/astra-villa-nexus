-- Add BPJS verification fields and enhanced commercial pricing rules

-- Add BPJS verification to vendor_business_profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_business_profiles' 
                   AND column_name = 'bpjs_ketenagakerjaan_verified') THEN
        ALTER TABLE public.vendor_business_profiles 
        ADD COLUMN bpjs_ketenagakerjaan_verified BOOLEAN DEFAULT false,
        ADD COLUMN bpjs_kesehatan_verified BOOLEAN DEFAULT false,
        ADD COLUMN bpjs_verification_date TIMESTAMP WITH TIME ZONE,
        ADD COLUMN bpjs_verification_method TEXT DEFAULT 'manual';
    END IF;
END $$;

-- Add BPJS fields to vendor_applications if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_applications' 
                   AND column_name = 'bpjs_ketenagakerjaan_verified') THEN
        ALTER TABLE public.vendor_applications 
        ADD COLUMN bpjs_ketenagakerjaan_verified BOOLEAN DEFAULT false,
        ADD COLUMN bpjs_kesehatan_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add property_type to vendor_applications if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_applications' 
                   AND column_name = 'property_type') THEN
        ALTER TABLE public.vendor_applications 
        ADD COLUMN property_type TEXT DEFAULT 'residential' CHECK (property_type IN ('residential', 'commercial'));
    END IF;
END $$;

-- Create BPJS verification logs table
CREATE TABLE IF NOT EXISTS public.bpjs_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL,
    bpjs_number TEXT NOT NULL,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('ketenagakerjaan', 'kesehatan')),
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'failed', 'pending')),
    api_response JSONB,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on BPJS verification logs
ALTER TABLE public.bpjs_verification_logs ENABLE ROW LEVEL SECURITY;

-- Policy for vendors to view their own BPJS logs
CREATE POLICY "Vendors can view their BPJS logs" 
ON public.bpjs_verification_logs 
FOR SELECT 
USING (vendor_id = auth.uid());

-- Policy for admins to manage BPJS logs
CREATE POLICY "Admins can manage BPJS logs" 
ON public.bpjs_verification_logs 
FOR ALL 
USING (check_admin_access());

-- Create enhanced pricing rules table
CREATE TABLE IF NOT EXISTS public.service_pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_category TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial')),
    base_multiplier DECIMAL(3,2) DEFAULT 1.00,
    minimum_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Insert default pricing rules
INSERT INTO public.service_pricing_rules (service_category, property_type, base_multiplier, minimum_price) VALUES
('cleaning_residential', 'residential', 1.00, 50000),
('cleaning_residential', 'commercial', 1.50, 75000),
('ac_repair', 'residential', 1.00, 100000),
('ac_repair', 'commercial', 1.75, 175000),
('shifting_services', 'residential', 1.00, 150000),
('shifting_services', 'commercial', 1.60, 240000),
('default', 'residential', 1.00, 50000),
('default', 'commercial', 1.50, 75000)
ON CONFLICT DO NOTHING;

-- Enable RLS on pricing rules
ALTER TABLE public.service_pricing_rules ENABLE ROW LEVEL SECURITY;

-- Policy for public to view pricing rules
CREATE POLICY "Public can view pricing rules" 
ON public.service_pricing_rules 
FOR SELECT 
USING (is_active = true);

-- Policy for admins to manage pricing rules
CREATE POLICY "Admins can manage pricing rules" 
ON public.service_pricing_rules 
FOR ALL 
USING (check_admin_access());