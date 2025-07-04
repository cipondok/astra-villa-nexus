-- Indonesian Vendor Onboarding System Database Schema

-- Add Indonesian-specific columns to vendor_applications
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS nomor_skt VARCHAR(50);
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS nomor_iujk VARCHAR(50);
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS nomor_npwp VARCHAR(20);
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS bpjs_ketenagakerjaan BOOLEAN DEFAULT FALSE;
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS bpjs_kesehatan BOOLEAN DEFAULT FALSE;
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS umkm_status BOOLEAN DEFAULT FALSE;
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS siup_number VARCHAR(50);
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS tdp_number VARCHAR(50);
ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS akta_notaris VARCHAR(100);

-- Indonesian provinces and cities table
CREATE TABLE IF NOT EXISTS indonesian_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_code VARCHAR(2) NOT NULL,
  province_name VARCHAR(100) NOT NULL,
  city_code VARCHAR(4),
  city_name VARCHAR(100),
  city_type VARCHAR(20), -- KOTA, KABUPATEN
  district_code VARCHAR(7),
  district_name VARCHAR(100),
  subdistrict_code VARCHAR(10),
  subdistrict_name VARCHAR(100),
  postal_code VARCHAR(5),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indonesian license types and requirements
CREATE TABLE IF NOT EXISTS indonesian_license_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_code VARCHAR(20) NOT NULL UNIQUE,
  license_name VARCHAR(100) NOT NULL,
  license_name_id VARCHAR(100) NOT NULL,
  issuing_authority VARCHAR(100) NOT NULL,
  issuing_authority_id VARCHAR(100) NOT NULL,
  validation_regex TEXT NOT NULL,
  vendor_type VARCHAR(20) NOT NULL, -- 'product', 'service', 'both'
  required_for_categories JSONB DEFAULT '[]',
  validity_period_months INTEGER,
  renewal_required BOOLEAN DEFAULT TRUE,
  government_api_endpoint TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indonesian validation rules
CREATE TABLE IF NOT EXISTS indonesian_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name VARCHAR(50) NOT NULL,
  field_name_id VARCHAR(50) NOT NULL,
  validation_type VARCHAR(30) NOT NULL, -- 'regex', 'api_check', 'format', 'range'
  validation_logic JSONB NOT NULL,
  error_message_en TEXT NOT NULL,
  error_message_id TEXT NOT NULL,
  vendor_type VARCHAR(20) NOT NULL,
  compliance_region VARCHAR(10) DEFAULT 'ID',
  severity VARCHAR(20) DEFAULT 'error', -- 'error', 'warning', 'info'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indonesian rejection codes
CREATE TABLE IF NOT EXISTS indonesian_rejection_codes (
  code VARCHAR(10) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  reason_en TEXT NOT NULL,
  reason_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_id TEXT NOT NULL,
  resolution_steps_en JSONB DEFAULT '[]',
  resolution_steps_id JSONB DEFAULT '[]',
  auto_resubmit_allowed BOOLEAN DEFAULT TRUE,
  estimated_fix_time_hours INTEGER DEFAULT 24,
  requires_document_upload BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indonesian business categories (localized)
CREATE TABLE IF NOT EXISTS indonesian_business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES indonesian_business_categories(id),
  category_code VARCHAR(20) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_id VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_id TEXT,
  level INTEGER NOT NULL, -- 1=main, 2=sub, 3=service/product, 4=specification
  vendor_type VARCHAR(20) NOT NULL,
  required_licenses JSONB DEFAULT '[]',
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BPJS verification logs
CREATE TABLE IF NOT EXISTS bpjs_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  bpjs_type VARCHAR(20) NOT NULL, -- 'ketenagakerjaan', 'kesehatan'
  verification_number VARCHAR(50) NOT NULL,
  verification_status VARCHAR(20) NOT NULL, -- 'active', 'inactive', 'pending', 'invalid'
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  verification_response JSONB,
  is_valid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE indonesian_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE indonesian_license_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE indonesian_validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE indonesian_rejection_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE indonesian_business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bpjs_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view Indonesian locations" ON indonesian_locations FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view license types" ON indonesian_license_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view validation rules" ON indonesian_validation_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view rejection codes" ON indonesian_rejection_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view business categories" ON indonesian_business_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Vendors can view their BPJS verifications" ON bpjs_verifications FOR SELECT USING (vendor_id = auth.uid());

-- Admin policies
CREATE POLICY "Admins can manage Indonesian locations" ON indonesian_locations FOR ALL USING (check_admin_access());
CREATE POLICY "Admins can manage license types" ON indonesian_license_types FOR ALL USING (check_admin_access());
CREATE POLICY "Admins can manage validation rules" ON indonesian_validation_rules FOR ALL USING (check_admin_access());
CREATE POLICY "Admins can manage rejection codes" ON indonesian_rejection_codes FOR ALL USING (check_admin_access());
CREATE POLICY "Admins can manage business categories" ON indonesian_business_categories FOR ALL USING (check_admin_access());
CREATE POLICY "Admins can manage BPJS verifications" ON bpjs_verifications FOR ALL USING (check_admin_access());

-- Insert Indonesian provinces data
INSERT INTO indonesian_locations (province_code, province_name, city_code, city_name, city_type) VALUES
('11', 'Aceh', '1171', 'Banda Aceh', 'KOTA'),
('12', 'Sumatera Utara', '1271', 'Medan', 'KOTA'),
('13', 'Sumatera Barat', '1371', 'Padang', 'KOTA'),
('14', 'Riau', '1471', 'Pekanbaru', 'KOTA'),
('15', 'Jambi', '1571', 'Jambi', 'KOTA'),
('16', 'Sumatera Selatan', '1671', 'Palembang', 'KOTA'),
('17', 'Bengkulu', '1771', 'Bengkulu', 'KOTA'),
('18', 'Lampung', '1871', 'Bandar Lampung', 'KOTA'),
('19', 'Kepulauan Bangka Belitung', '1971', 'Pangkal Pinang', 'KOTA'),
('21', 'Kepulauan Riau', '2171', 'Batam', 'KOTA'),
('31', 'DKI Jakarta', '3171', 'Jakarta Selatan', 'KOTA'),
('31', 'DKI Jakarta', '3172', 'Jakarta Timur', 'KOTA'),
('31', 'DKI Jakarta', '3173', 'Jakarta Pusat', 'KOTA'),
('31', 'DKI Jakarta', '3174', 'Jakarta Barat', 'KOTA'),
('31', 'DKI Jakarta', '3175', 'Jakarta Utara', 'KOTA'),
('32', 'Jawa Barat', '3273', 'Bandung', 'KOTA'),
('32', 'Jawa Barat', '3274', 'Bekasi', 'KOTA'),
('32', 'Jawa Barat', '3275', 'Depok', 'KOTA'),
('32', 'Jawa Barat', '3276', 'Cimahi', 'KOTA'),
('32', 'Jawa Barat', '3277', 'Cirebon', 'KOTA'),
('32', 'Jawa Barat', '3278', 'Bogor', 'KOTA'),
('33', 'Jawa Tengah', '3371', 'Semarang', 'KOTA'),
('33', 'Jawa Tengah', '3372', 'Salatiga', 'KOTA'),
('33', 'Jawa Tengah', '3373', 'Pekalongan', 'KOTA'),
('33', 'Jawa Tengah', '3374', 'Tegal', 'KOTA'),
('33', 'Jawa Tengah', '3375', 'Magelang', 'KOTA'),
('33', 'Jawa Tengah', '3376', 'Surakarta', 'KOTA'),
('34', 'DI Yogyakarta', '3471', 'Yogyakarta', 'KOTA'),
('35', 'Jawa Timur', '3571', 'Surabaya', 'KOTA'),
('35', 'Jawa Timur', '3572', 'Malang', 'KOTA'),
('35', 'Jawa Timur', '3573', 'Probolinggo', 'KOTA'),
('35', 'Jawa Timur', '3574', 'Pasuruan', 'KOTA'),
('35', 'Jawa Timur', '3575', 'Mojokerto', 'KOTA'),
('35', 'Jawa Timur', '3576', 'Madiun', 'KOTA'),
('35', 'Jawa Timur', '3577', 'Kediri', 'KOTA'),
('35', 'Jawa Timur', '3578', 'Blitar', 'KOTA'),
('35', 'Jawa Timur', '3579', 'Batu', 'KOTA'),
('36', 'Banten', '3671', 'Tangerang', 'KOTA'),
('36', 'Banten', '3672', 'Cilegon', 'KOTA'),
('36', 'Banten', '3673', 'Serang', 'KOTA'),
('36', 'Banten', '3674', 'Tangerang Selatan', 'KOTA'),
('51', 'Bali', '5171', 'Denpasar', 'KOTA'),
('52', 'Nusa Tenggara Barat', '5271', 'Mataram', 'KOTA'),
('53', 'Nusa Tenggara Timur', '5371', 'Kupang', 'KOTA'),
('61', 'Kalimantan Barat', '6171', 'Pontianak', 'KOTA'),
('62', 'Kalimantan Tengah', '6271', 'Palangka Raya', 'KOTA'),
('63', 'Kalimantan Selatan', '6371', 'Banjarmasin', 'KOTA'),
('64', 'Kalimantan Timur', '6471', 'Samarinda', 'KOTA'),
('64', 'Kalimantan Timur', '6472', 'Balikpapan', 'KOTA'),
('65', 'Kalimantan Utara', '6571', 'Tarakan', 'KOTA'),
('71', 'Sulawesi Utara', '7171', 'Manado', 'KOTA'),
('72', 'Sulawesi Tengah', '7271', 'Palu', 'KOTA'),
('73', 'Sulawesi Selatan', '7371', 'Makassar', 'KOTA'),
('74', 'Sulawesi Tenggara', '7471', 'Kendari', 'KOTA'),
('75', 'Gorontalo', '7571', 'Gorontalo', 'KOTA'),
('76', 'Sulawesi Barat', '7671', 'Mamuju', 'KOTA'),
('81', 'Maluku', '8171', 'Ambon', 'KOTA'),
('82', 'Maluku Utara', '8271', 'Ternate', 'KOTA'),
('91', 'Papua Barat', '9171', 'Sorong', 'KOTA'),
('94', 'Papua', '9471', 'Jayapura', 'KOTA');

-- Insert Indonesian license types
INSERT INTO indonesian_license_types (license_code, license_name, license_name_id, issuing_authority, issuing_authority_id, validation_regex, vendor_type, validity_period_months) VALUES
('SKT', 'Certificate of Competence', 'Sertifikat Kompetensi Tenaga Kerja', 'LPJK', 'Lembaga Pengembangan Jasa Konstruksi', '^SKT-[A-Z]{2}/\d{6}/LPJK$', 'service', 60),
('SKA', 'Certificate of Work Skills', 'Sertifikat Keterampilan Kerja', 'LPJK', 'Lembaga Pengembangan Jasa Konstruksi', '^SKA-[A-Z]{2}/\d{6}/LPJK$', 'service', 60),
('IUJK', 'Construction Service Business License', 'Izin Usaha Jasa Konstruksi', 'DINAS PU', 'Dinas Pekerjaan Umum', '^IUJK-\d{12}/KAB-[A-Z]{3}$', 'service', 36),
('SIUP', 'Trade Business License', 'Surat Izin Usaha Perdagangan', 'PEMDA', 'Pemerintah Daerah', '^SIUP/\d{3}/\d{2}/\d{4}$', 'both', 60),
('TDP', 'Company Registration Certificate', 'Tanda Daftar Perusahaan', 'PEMDA', 'Pemerintah Daerah', '^TDP/\d{13}$', 'both', 60),
('NPWP', 'Taxpayer Registration Number', 'Nomor Pokok Wajib Pajak', 'DITJEN PAJAK', 'Direktorat Jenderal Pajak', '^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$', 'both', NULL);

-- Insert Indonesian validation rules
INSERT INTO indonesian_validation_rules (field_name, field_name_id, validation_type, validation_logic, error_message_en, error_message_id, vendor_type) VALUES
('nomor_npwp', 'nomor_npwp', 'regex', '{"pattern": "^\\d{2}\\.\\d{3}\\.\\d{3}\\.\\d-\\d{3}\\.\\d{3}$"}', 'NPWP must be 15 digits (example: 12.345.678.9-012.345)', 'NPWP harus 15 digit (contoh: 12.345.678.9-012.345)', 'both'),
('nomor_skt', 'nomor_skt', 'regex', '{"pattern": "^SKT-[A-Z]{2}/\\d{6}/LPJK$"}', 'SKT format invalid (example: SKT-EL/123456/LPJK)', 'Format SKT tidak valid (contoh: SKT-EL/123456/LPJK)', 'service'),
('nomor_iujk', 'nomor_iujk', 'regex', '{"pattern": "^IUJK-\\d{12}/KAB-[A-Z]{3}$"}', 'IUJK format invalid', 'Format IUJK tidak valid', 'service'),
('harga', 'harga', 'range', '{"min": 10000, "max": 1000000000}', 'Price must be Rp 10k - 1B', 'Harga harus Rp 10k - 1M', 'both'),
('tarif_per_jam', 'tarif_per_jam', 'range', '{"min": 25000, "max": 1000000}', 'Hourly rate must be Rp 25k - 1M', 'Tarif per jam harus Rp 25k - 1M', 'service');

-- Insert Indonesian rejection codes
INSERT INTO indonesian_rejection_codes (code, category, reason_en, reason_id, description_en, description_id, resolution_steps_en, resolution_steps_id) VALUES
('ID-01', 'license', 'Missing SKT License', 'SKT belum diunggah', 'SKT certificate is required for electrical work', 'Sertifikat SKT diperlukan untuk pekerjaan listrik', '["Upload valid SKT certificate", "Contact LPJK for new certificate"]', '["Unggah sertifikat SKT yang valid", "Hubungi LPJK untuk sertifikat baru"]'),
('ID-02', 'tax', 'Invalid NPWP', 'Format NPWP salah', 'NPWP format does not match Indonesian standard', 'Format NPWP tidak sesuai standar Indonesia', '["Check NPWP format (XX.XXX.XXX.X-XXX.XXX)", "Contact tax office for correction"]', '["Periksa format NPWP (XX.XXX.XXX.X-XXX.XXX)", "Hubungi kantor pajak untuk koreksi"]'),
('ID-03', 'bpjs', 'BPJS Not Active', 'BPJS tidak aktif', 'BPJS Ketenagakerjaan registration is required', 'Pendaftaran BPJS Ketenagakerjaan diperlukan', '["Register with BPJS Ketenagakerjaan", "Upload BPJS certificate"]', '["Daftar BPJS Ketenagakerjaan", "Unggah sertifikat BPJS"]'),
('ID-04', 'address', 'Invalid Address', 'Alamat tidak valid', 'Address does not match Indonesian postal system', 'Alamat tidak sesuai sistem pos Indonesia', '["Verify complete address", "Include correct postal code"]', '["Verifikasi alamat lengkap", "Sertakan kode pos yang benar"]'),
('ID-05', 'pricing', 'Invalid Pricing', 'Harga tidak wajar', 'Pricing is outside acceptable range', 'Harga di luar rentang yang dapat diterima', '["Adjust pricing to market range", "Provide justification for pricing"]', '["Sesuaikan harga ke rentang pasar", "Berikan justifikasi untuk harga"]');

-- Insert Indonesian business categories
INSERT INTO indonesian_business_categories (category_code, name_en, name_id, level, vendor_type, display_order) VALUES
-- Level 1 - Main Categories
('MAT_BANGUNAN', 'Building Materials', 'Material Bangunan', 1, 'product', 1),
('FURNITUR', 'Furniture & Decor', 'Furnitur & Dekorasi', 1, 'product', 2),
('JASA_KONSTRUKSI', 'Construction Services', 'Jasa Konstruksi', 1, 'service', 3),
('JASA_LISTRIK', 'Electrical Services', 'Jasa Listrik', 1, 'service', 4),
('JASA_PLUMBING', 'Plumbing Services', 'Jasa Plambing', 1, 'service', 5),
('JASA_PROPERTI', 'Property Services', 'Jasa Properti', 1, 'service', 6);

-- Level 2 - Sub Categories for Building Materials
INSERT INTO indonesian_business_categories (parent_id, category_code, name_en, name_id, level, vendor_type, display_order) 
SELECT id, 'LANTAI', 'Flooring', 'Lantai', 2, 'product', 1 FROM indonesian_business_categories WHERE category_code = 'MAT_BANGUNAN';

INSERT INTO indonesian_business_categories (parent_id, category_code, name_en, name_id, level, vendor_type, display_order) 
SELECT id, 'DINDING', 'Wall Materials', 'Material Dinding', 2, 'product', 2 FROM indonesian_business_categories WHERE category_code = 'MAT_BANGUNAN';

INSERT INTO indonesian_business_categories (parent_id, category_code, name_en, name_id, level, vendor_type, display_order) 
SELECT id, 'ATAP', 'Roofing', 'Atap', 2, 'product', 3 FROM indonesian_business_categories WHERE category_code = 'MAT_BANGUNAN';

-- Level 2 - Sub Categories for Electrical Services
INSERT INTO indonesian_business_categories (parent_id, category_code, name_en, name_id, level, vendor_type, display_order, required_licenses) 
SELECT id, 'INSTALASI_LISTRIK', 'Electrical Installation', 'Instalasi Listrik', 2, 'service', 1, '["SKT", "SIUP"]' FROM indonesian_business_categories WHERE category_code = 'JASA_LISTRIK';

INSERT INTO indonesian_business_categories (parent_id, category_code, name_en, name_id, level, vendor_type, display_order, required_licenses) 
SELECT id, 'MAINTENANCE_LISTRIK', 'Electrical Maintenance', 'Maintenance Listrik', 2, 'service', 2, '["SKT", "SIUP"]' FROM indonesian_business_categories WHERE category_code = 'JASA_LISTRIK';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_indonesian_locations_province ON indonesian_locations(province_code);
CREATE INDEX IF NOT EXISTS idx_indonesian_locations_city ON indonesian_locations(city_code);
CREATE INDEX IF NOT EXISTS idx_indonesian_business_categories_parent ON indonesian_business_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_indonesian_business_categories_level ON indonesian_business_categories(level);
CREATE INDEX IF NOT EXISTS idx_bpjs_verifications_vendor ON bpjs_verifications(vendor_id);

-- Add update trigger for bpjs_verifications
CREATE TRIGGER update_bpjs_verifications_updated_at
  BEFORE UPDATE ON bpjs_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();