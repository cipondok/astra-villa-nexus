-- Populate Validation Rules for different regions and vendor types

-- UAE Business Registration Validation
INSERT INTO validation_rules (field_name, vendor_type, validation_type, validation_logic, error_message, compliance_region) VALUES
('business_registration_number', 'both', 'regex', '{"pattern": "^(CN|BN)-\\d{7}$"}', 'UAE business registration must be format CN-1234567 or BN-1234567', 'UAE'),
('tax_id', 'both', 'regex', '{"pattern": "^\\d{15}$"}', 'UAE Tax Registration Number must be 15 digits', 'UAE'),
('license_number', 'service', 'conditional', '{"condition": "category_contains_electrical", "pattern": "^ELE-\\d{6}$"}', 'Electrical license must be format ELE-123456', 'UAE');

-- US Business Registration Validation  
INSERT INTO validation_rules (field_name, vendor_type, validation_type, validation_logic, error_message, compliance_region) VALUES
('business_registration_number', 'both', 'regex', '{"pattern": "^[A-Z]{2}\\d{8}$"}', 'US business registration must be format AB12345678', 'US'),
('tax_id', 'both', 'regex', '{"pattern": "^\\d{2}-\\d{7}$"}', 'US EIN must be format 12-3456789', 'US'),
('license_number', 'service', 'conditional', '{"condition": "category_contains_electrical", "pattern": "^[A-Z]{2}-\\d{4,6}$"}', 'US electrical license format varies by state', 'US');

-- Product SKU Validation
INSERT INTO validation_rules (field_name, vendor_type, validation_type, validation_logic, error_message, trigger_event) VALUES
('product_sku', 'product', 'regex', '{"pattern": "^[A-Z]{3}-\\d{6}$"}', 'Product SKU must be format ABC-123456', 'on_blur'),
('product_price', 'product', 'range', '{"min": 0.01, "max": 999999.99}', 'Product price must be between 0.01 and 999,999.99', 'on_change');

-- Service Pricing Validation
INSERT INTO validation_rules (field_name, vendor_type, validation_type, validation_logic, error_message, trigger_event) VALUES
('hourly_rate', 'service', 'range', '{"min": 10, "max": 1000}', 'Hourly rate must be between 10 and 1,000', 'on_blur'),
('service_radius_km', 'service', 'range', '{"min": 1, "max": 200}', 'Service radius must be between 1 and 200 km', 'on_change');

-- Bank Account Validation (Fraud Detection)
INSERT INTO validation_rules (field_name, vendor_type, validation_type, validation_logic, error_message, severity) VALUES
('bank_account_number', 'both', 'custom', '{"check_duplicates": true, "fraud_check": true}', 'This bank account is already registered with another vendor', 'error');

-- Populate Rejection Codes
INSERT INTO rejection_codes (code, category, description, resolution_steps, auto_resubmit_allowed, estimated_fix_time_hours) VALUES
('DOC-MISSING', 'Documentation', 'Required business documents are missing or incomplete', 
 '["Upload business registration certificate", "Provide tax identification document", "Submit valid ID copy"]', 
 true, 24),

('LICENSE-INVALID', 'Licensing', 'Professional license is invalid, expired, or incorrect format', 
 '["Upload current valid license", "Ensure license matches business type", "Contact licensing authority if needed"]', 
 true, 72),

('BANK-DUPLICATE', 'Financial', 'Bank account already registered with another vendor (fraud prevention)', 
 '["Contact support to resolve duplicate account issue", "Provide proof of account ownership", "Use different business account"]', 
 false, 168),

('ADDR-UNVERIFIED', 'Address', 'Business address cannot be verified or is invalid', 
 '["Provide utility bill or lease agreement", "Ensure address matches registration documents", "Contact support for address verification"]', 
 true, 48),

('CAT-MISMATCH', 'Category', 'Selected service/product categories do not match business license or expertise', 
 '["Review and correct category selections", "Provide additional certifications for selected categories", "Remove unqualified categories"]', 
 true, 24),

('PRICE-INVALID', 'Pricing', 'Product prices or service rates are unrealistic or incorrectly formatted', 
 '["Review and correct pricing information", "Ensure prices are in correct currency", "Provide justification for premium pricing if applicable"]', 
 true, 12),

('INFO-INCOMPLETE', 'Information', 'Business information is incomplete or inconsistent across forms', 
 '["Complete all required business information fields", "Ensure consistency across all forms", "Provide additional business details"]', 
 true, 24),

('QUALITY-CONCERN', 'Quality', 'Business history or references indicate quality concerns', 
 '["Provide additional business references", "Submit portfolio or work samples", "Address quality concerns with explanations"]', 
 false, 120),

('FRAUD-SUSPECTED', 'Security', 'Application flagged by fraud detection system', 
 '["Contact support immediately", "Provide additional verification documents", "Schedule verification call with admin"]', 
 false, 240),

('REGION-RESTRICTED', 'Geographic', 'Business cannot operate in selected service regions due to licensing restrictions', 
 '["Update service areas to match license coverage", "Obtain additional regional licenses", "Provide proof of authorization for selected regions"]', 
 true, 96);

-- Populate Fraud Detection Patterns
INSERT INTO fraud_patterns (pattern_type, pattern_name, detection_logic, risk_score, auto_reject) VALUES
('duplicate_bank', 'Duplicate Bank Account', 
 '{"check_fields": ["bank_details.account_number"], "match_threshold": "exact"}', 
 90, true),

('suspicious_address', 'Suspicious Business Address', 
 '{"check_patterns": ["po_box_only", "residential_area", "non_existent_street"], "verification_required": true}', 
 70, false),

('rapid_applications', 'Multiple Applications Same IP', 
 '{"time_window_hours": 24, "max_applications": 3, "check_ip": true}', 
 60, false),

('document_similarity', 'Similar Document Uploads', 
 '{"image_hash_similarity": 0.95, "text_extraction_match": 0.90}', 
 80, false),

('blacklisted_info', 'Blacklisted Information', 
 '{"check_fields": ["business_registration_number", "tax_id", "contact_info.phone"], "blacklist_match": true}', 
 100, true);

-- Populate Document Requirements
INSERT INTO document_requirements (vendor_type, compliance_region, document_type, document_name, is_required, description) VALUES
-- UAE Requirements
('both', 'UAE', 'business_license', 'Trade License', true, 'Valid UAE Trade License issued by DED or relevant authority'),
('both', 'UAE', 'tax_certificate', 'Tax Registration Certificate', true, 'VAT Registration Certificate from FTA'),
('both', 'UAE', 'bank_statement', 'Bank Statement', true, 'Recent bank statement (last 3 months)'),
('service', 'UAE', 'professional_license', 'Professional License', true, 'Valid professional license for specific service category'),
('product', 'UAE', 'import_license', 'Import License', false, 'Required only for imported goods'),

-- US Requirements  
('both', 'US', 'business_license', 'Business License', true, 'State business license or incorporation documents'),
('both', 'US', 'tax_certificate', 'EIN Certificate', true, 'Federal Tax ID (EIN) from IRS'),
('both', 'US', 'insurance', 'Liability Insurance', true, 'General liability insurance certificate'),
('service', 'US', 'professional_license', 'Trade License', true, 'State-specific trade or professional license'),
('product', 'US', 'reseller_permit', 'Reseller Permit', false, 'Sales tax permit for product vendors');

-- Create storage bucket for vendor documents
INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-docs', 'vendor-docs', false);

-- Storage policies for vendor documents
CREATE POLICY "Vendors can upload their own documents" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'vendor-docs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vendors can view their own documents" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'vendor-docs' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR check_admin_access())
);

CREATE POLICY "Admins can view all vendor documents" 
ON storage.objects FOR ALL 
USING (bucket_id = 'vendor-docs' AND check_admin_access());