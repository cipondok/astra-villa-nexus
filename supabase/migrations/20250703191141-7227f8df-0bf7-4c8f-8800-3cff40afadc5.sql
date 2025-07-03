-- Complete Vendor Onboarding System Database Schema

-- Vendor Registration Applications (Main onboarding table)
CREATE TABLE public.vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_type VARCHAR(20) NOT NULL CHECK (vendor_type IN ('product', 'service')),
  application_status VARCHAR(20) DEFAULT 'draft' CHECK (application_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'resubmitted')),
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL,
  business_registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  business_address JSONB NOT NULL DEFAULT '{}',
  contact_info JSONB NOT NULL DEFAULT '{}',
  bank_details JSONB DEFAULT '{}',
  business_documents JSONB DEFAULT '[]', -- Array of document URLs
  category_selections JSONB DEFAULT '[]', -- Selected categories from hierarchy
  license_info JSONB DEFAULT '{}',
  service_areas JSONB DEFAULT '[]', -- For service vendors
  product_catalog JSONB DEFAULT '[]', -- For product vendors
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  approval_notes TEXT,
  rejection_reason VARCHAR(50),
  rejection_details JSONB DEFAULT '{}',
  compliance_region VARCHAR(10) DEFAULT 'UAE' CHECK (compliance_region IN ('UAE', 'US', 'EU')),
  fraud_score INTEGER DEFAULT 0 CHECK (fraud_score BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Validation Rules (Dynamic validation system)
CREATE TABLE public.validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name VARCHAR(100) NOT NULL,
  vendor_type VARCHAR(20) NOT NULL CHECK (vendor_type IN ('product', 'service', 'both')),
  category_filter JSONB DEFAULT '{}', -- Apply rule only to specific categories
  validation_type VARCHAR(50) NOT NULL CHECK (validation_type IN ('regex', 'range', 'required', 'conditional', 'custom')),
  validation_logic JSONB NOT NULL, -- Contains regex, min/max values, conditions
  error_message TEXT NOT NULL,
  trigger_event VARCHAR(50) DEFAULT 'on_blur' CHECK (trigger_event IN ('on_blur', 'on_submit', 'on_change', 'real_time')),
  severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
  compliance_region VARCHAR(10) DEFAULT 'UAE',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Rejection Codes and Management
CREATE TABLE public.rejection_codes (
  code VARCHAR(20) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  resolution_steps JSONB NOT NULL DEFAULT '[]',
  auto_resubmit_allowed BOOLEAN DEFAULT true,
  requires_admin_review BOOLEAN DEFAULT false,
  estimated_fix_time_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true
);

-- Validation Logs (Track all validation attempts)
CREATE TABLE public.validation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES vendor_applications(id) ON DELETE CASCADE NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  field_value TEXT,
  validation_rule_id UUID REFERENCES validation_rules(id),
  validation_result VARCHAR(20) NOT NULL CHECK (validation_result IN ('pass', 'fail', 'warning')),
  error_message TEXT,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resubmission History
CREATE TABLE public.resubmission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES vendor_applications(id) ON DELETE CASCADE NOT NULL,
  previous_status VARCHAR(20) NOT NULL,
  new_status VARCHAR(20) NOT NULL,
  rejection_codes TEXT[] DEFAULT '{}',
  changes_made JSONB DEFAULT '{}',
  resubmitted_by UUID REFERENCES auth.users(id) NOT NULL,
  resubmitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  admin_notes TEXT
);

-- Fraud Detection Patterns
CREATE TABLE public.fraud_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type VARCHAR(50) NOT NULL,
  pattern_name VARCHAR(100) NOT NULL,
  detection_logic JSONB NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 1 AND 100),
  auto_reject BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document Templates and Requirements
CREATE TABLE public.document_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_type VARCHAR(20) NOT NULL CHECK (vendor_type IN ('product', 'service', 'both')),
  compliance_region VARCHAR(10) NOT NULL,
  category_filter JSONB DEFAULT '{}',
  document_type VARCHAR(100) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  is_required BOOLEAN DEFAULT true,
  accepted_formats TEXT[] DEFAULT '{pdf,jpg,png}',
  max_file_size_mb INTEGER DEFAULT 10,
  validation_requirements JSONB DEFAULT '{}',
  template_url TEXT,
  description TEXT
);

-- Enable RLS on all tables
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejection_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resubmission_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Vendor Applications
CREATE POLICY "Vendors can view their own applications" 
ON vendor_applications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can create and update their applications" 
ON vendor_applications FOR ALL 
USING (auth.uid() = user_id OR check_admin_access());

CREATE POLICY "Admins can manage all applications" 
ON vendor_applications FOR ALL 
USING (check_admin_access());

-- RLS Policies for other tables (admin only for management, public read for active rules)
CREATE POLICY "Public can view active validation rules" 
ON validation_rules FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage validation rules" 
ON validation_rules FOR ALL 
USING (check_admin_access());

CREATE POLICY "Public can view active rejection codes" 
ON rejection_codes FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage rejection codes" 
ON rejection_codes FOR ALL 
USING (check_admin_access());

CREATE POLICY "Vendors can view their validation logs" 
ON validation_logs FOR SELECT 
USING (EXISTS (SELECT 1 FROM vendor_applications WHERE id = application_id AND user_id = auth.uid()));

CREATE POLICY "Admins can view all validation logs" 
ON validation_logs FOR ALL 
USING (check_admin_access());

CREATE POLICY "Vendors can view their resubmission history" 
ON resubmission_history FOR SELECT 
USING (EXISTS (SELECT 1 FROM vendor_applications WHERE id = application_id AND user_id = auth.uid()));

CREATE POLICY "Public can view document requirements" 
ON document_requirements FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage document requirements" 
ON document_requirements FOR ALL 
USING (check_admin_access());

-- Create indexes for performance
CREATE INDEX idx_vendor_applications_user_id ON vendor_applications(user_id);
CREATE INDEX idx_vendor_applications_status ON vendor_applications(application_status);
CREATE INDEX idx_vendor_applications_type ON vendor_applications(vendor_type);
CREATE INDEX idx_validation_rules_field ON validation_rules(field_name);
CREATE INDEX idx_validation_logs_application ON validation_logs(application_id);
CREATE INDEX idx_resubmission_application ON resubmission_history(application_id);

-- Add triggers for updated_at
CREATE TRIGGER update_vendor_applications_updated_at
BEFORE UPDATE ON vendor_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_rules_updated_at
BEFORE UPDATE ON validation_rules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();