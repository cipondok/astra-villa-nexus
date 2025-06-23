
-- Drop existing locations table and recreate with better structure for Indonesia
DROP TABLE IF EXISTS public.locations CASCADE;

-- Create comprehensive Indonesian locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province_code VARCHAR(4) NOT NULL,
  province_name VARCHAR(100) NOT NULL,
  city_code VARCHAR(8) NOT NULL,
  city_name VARCHAR(100) NOT NULL,
  city_type VARCHAR(20) NOT NULL DEFAULT 'KOTA', -- KOTA, KABUPATEN
  district_code VARCHAR(12),
  district_name VARCHAR(100),
  subdistrict_code VARCHAR(16),
  subdistrict_name VARCHAR(100),
  postal_code VARCHAR(10),
  area_name VARCHAR(100) NOT NULL,
  coordinates POINT,
  population INTEGER DEFAULT 0,
  area_km2 DECIMAL(10,2) DEFAULT 0,
  is_capital BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for better performance
  UNIQUE(province_code, city_code, district_code, subdistrict_code)
);

-- Create indexes for better query performance
CREATE INDEX idx_locations_province ON public.locations(province_code, province_name);
CREATE INDEX idx_locations_city ON public.locations(city_code, city_name);
CREATE INDEX idx_locations_district ON public.locations(district_code, district_name);
CREATE INDEX idx_locations_active ON public.locations(is_active);
CREATE INDEX idx_locations_search ON public.locations(province_name, city_name, area_name);

-- Insert comprehensive Indonesian location data
INSERT INTO public.locations (province_code, province_name, city_code, city_name, city_type, district_code, district_name, area_name, is_capital, postal_code) VALUES
-- DKI Jakarta
('31', 'DKI Jakarta', '3171', 'Jakarta Selatan', 'KOTA', '317101', 'Kebayoran Baru', 'Kebayoran Baru', TRUE, '12110'),
('31', 'DKI Jakarta', '3171', 'Jakarta Selatan', 'KOTA', '317102', 'Kebayoran Lama', 'Kebayoran Lama', FALSE, '12240'),
('31', 'DKI Jakarta', '3171', 'Jakarta Selatan', 'KOTA', '317103', 'Pesanggrahan', 'Pesanggrahan', FALSE, '12320'),
('31', 'DKI Jakarta', '3171', 'Jakarta Selatan', 'KOTA', '317104', 'Cilandak', 'Cilandak', FALSE, '12430'),
('31', 'DKI Jakarta', '3171', 'Jakarta Selatan', 'KOTA', '317105', 'Pasar Minggu', 'Pasar Minggu', FALSE, '12520'),
('31', 'DKI Jakarta', '3172', 'Jakarta Timur', 'KOTA', '317201', 'Matraman', 'Matraman', FALSE, '13140'),
('31', 'DKI Jakarta', '3172', 'Jakarta Timur', 'KOTA', '317202', 'Pulo Gadung', 'Pulo Gadung', FALSE, '13250'),
('31', 'DKI Jakarta', '3172', 'Jakarta Timur', 'KOTA', '317203', 'Jatinegara', 'Jatinegara', FALSE, '13310'),
('31', 'DKI Jakarta', '3173', 'Jakarta Pusat', 'KOTA', '317301', 'Gambir', 'Gambir', FALSE, '10110'),
('31', 'DKI Jakarta', '3173', 'Jakarta Pusat', 'KOTA', '317302', 'Sawah Besar', 'Sawah Besar', FALSE, '10710'),
('31', 'DKI Jakarta', '3173', 'Jakarta Pusat', 'KOTA', '317303', 'Menteng', 'Menteng', FALSE, '10310'),
('31', 'DKI Jakarta', '3174', 'Jakarta Barat', 'KOTA', '317401', 'Tambora', 'Tambora', FALSE, '11230'),
('31', 'DKI Jakarta', '3174', 'Jakarta Barat', 'KOTA', '317402', 'Taman Sari', 'Taman Sari', FALSE, '11150'),
('31', 'DKI Jakarta', '3174', 'Jakarta Barat', 'KOTA', '317403', 'Grogol Petamburan', 'Grogol Petamburan', FALSE, '11470'),
('31', 'DKI Jakarta', '3175', 'Jakarta Utara', 'KOTA', '317501', 'Penjaringan', 'Penjaringan', FALSE, '14440'),
('31', 'DKI Jakarta', '3175', 'Jakarta Utara', 'KOTA', '317502', 'Pademangan', 'Pademangan', FALSE, '14420'),

-- Bali
('51', 'Bali', '5171', 'Denpasar', 'KOTA', '517101', 'Denpasar Selatan', 'Sanur', TRUE, '80228'),
('51', 'Bali', '5171', 'Denpasar', 'KOTA', '517102', 'Denpasar Barat', 'Pemecutan', FALSE, '80119'),
('51', 'Bali', '5171', 'Denpasar', 'KOTA', '517103', 'Denpasar Timur', 'Kesiman', FALSE, '80237'),
('51', 'Bali', '5102', 'Badung', 'KABUPATEN', '510201', 'Kuta', 'Kuta', FALSE, '80361'),
('51', 'Bali', '5102', 'Badung', 'KABUPATEN', '510202', 'Mengwi', 'Canggu', FALSE, '80351'),
('51', 'Bali', '5102', 'Badung', 'KABUPATEN', '510203', 'Abiansemal', 'Jimbaran', FALSE, '80364'),
('51', 'Bali', '5103', 'Gianyar', 'KABUPATEN', '510301', 'Sukawati', 'Sukawati', FALSE, '80582'),
('51', 'Bali', '5103', 'Gianyar', 'KABUPATEN', '510302', 'Blahbatuh', 'Ubud', FALSE, '80571'),
('51', 'Bali', '5104', 'Klungkung', 'KABUPATEN', '510401', 'Nusa Penida', 'Nusa Penida', FALSE, '80771'),

-- Jawa Barat (West Java)
('32', 'Jawa Barat', '3273', 'Bandung', 'KOTA', '327301', 'Sumur Bandung', 'Braga', TRUE, '40111'),
('32', 'Jawa Barat', '3273', 'Bandung', 'KOTA', '327302', 'Coblong', 'Dago', FALSE, '40135'),
('32', 'Jawa Barat', '3273', 'Bandung', 'KOTA', '327303', 'Andir', 'Ciroyom', FALSE, '40181'),
('32', 'Jawa Barat', '3204', 'Bandung', 'KABUPATEN', '320401', 'Soreang', 'Soreang', FALSE, '40911'),
('32', 'Jawa Barat', '3277', 'Cimahi', 'KOTA', '327701', 'Cimahi Selatan', 'Leuwigajah', FALSE, '40532'),
('32', 'Jawa Barat', '3201', 'Bogor', 'KABUPATEN', '320101', 'Cibinong', 'Cibinong', FALSE, '16911'),
('32', 'Jawa Barat', '3271', 'Bogor', 'KOTA', '327101', 'Bogor Tengah', 'Paledang', FALSE, '16122'),

-- Jawa Tengah (Central Java)
('33', 'Jawa Tengah', '3374', 'Semarang', 'KOTA', '337401', 'Semarang Tengah', 'Simpang Lima', TRUE, '50132'),
('33', 'Jawa Tengah', '3374', 'Semarang', 'KOTA', '337402', 'Semarang Utara', 'Pendrikan Lor', FALSE, '50177'),
('33', 'Jawa Tengah', '3371', 'Magelang', 'KOTA', '337101', 'Magelang Utara', 'Kedungsari', FALSE, '56115'),
('33', 'Jawa Tengah', '3375', 'Salatiga', 'KOTA', '337501', 'Sidorejo', 'Sidorejo Lor', FALSE, '50714'),

-- DI Yogyakarta
('34', 'DI Yogyakarta', '3471', 'Yogyakarta', 'KOTA', '347101', 'Gondokusuman', 'Terban', TRUE, '55223'),
('34', 'DI Yogyakarta', '3471', 'Yogyakarta', 'KOTA', '347102', 'Jetis', 'Bumijo', FALSE, '55231'),
('34', 'DI Yogyakarta', '3471', 'Yogyakarta', 'KOTA', '347103', 'Tegalrejo', 'Karangwaru', FALSE, '55244'),
('34', 'DI Yogyakarta', '3402', 'Bantul', 'KABUPATEN', '340201', 'Sewon', 'Panggungharjo', FALSE, '55185'),
('34', 'DI Yogyakarta', '3404', 'Sleman', 'KABUPATEN', '340401', 'Mlati', 'Sendangadi', FALSE, '55285'),

-- Jawa Timur (East Java)
('35', 'Jawa Timur', '3578', 'Surabaya', 'KOTA', '357801', 'Genteng', 'Genteng', TRUE, '60275'),
('35', 'Jawa Timur', '3578', 'Surabaya', 'KOTA', '357802', 'Tegalsari', 'Kedungdoro', FALSE, '60252'),
('35', 'Jawa Timur', '3578', 'Surabaya', 'KOTA', '357803', 'Gubeng', 'Airlangga', FALSE, '60286'),
('35', 'Jawa Timur', '3573', 'Malang', 'KOTA', '357301', 'Klojen', 'Kasin', FALSE, '65117'),
('35', 'Jawa Timur', '3573', 'Malang', 'KOTA', '357302', 'Blimbing', 'Polowijen', FALSE, '65125'),

-- Sumatera Utara (North Sumatra)
('12', 'Sumatera Utara', '1271', 'Medan', 'KOTA', '127101', 'Medan Kota', 'Kesawan', TRUE, '20111'),
('12', 'Sumatera Utara', '1271', 'Medan', 'KOTA', '127102', 'Medan Barat', 'Glugur Darat', FALSE, '20112'),
('12', 'Sumatera Utara', '1271', 'Medan', 'KOTA', '127103', 'Medan Timur', 'Pandau Hulu', FALSE, '20231'),

-- Add more provinces for completeness
-- Sumatera Barat
('13', 'Sumatera Barat', '1371', 'Padang', 'KOTA', '137101', 'Padang Barat', 'Rimbo Kaluang', TRUE, '25115'),
('13', 'Sumatera Barat', '1371', 'Padang', 'KOTA', '137102', 'Padang Timur', 'Ganting Parak Gadang', FALSE, '25171'),

-- Riau
('14', 'Riau', '1471', 'Pekanbaru', 'KOTA', '147101', 'Sukajadi', 'Kampung Tengah', TRUE, '28122'),
('14', 'Riau', '1471', 'Pekanbaru', 'KOTA', '147102', 'Lima Puluh', 'Talang Muandau', FALSE, '28144'),

-- Kalimantan Timur
('64', 'Kalimantan Timur', '6472', 'Samarinda', 'KOTA', '647201', 'Samarinda Ulu', 'Air Hitam', TRUE, '75124'),
('64', 'Kalimantan Timur', '6472', 'Samarinda', 'KOTA', '647202', 'Samarinda Ilir', 'Pelita', FALSE, '75112'),

-- Sulawesi Selatan
('73', 'Sulawesi Selatan', '7371', 'Makassar', 'KOTA', '737101', 'Mariso', 'Mariso', TRUE, '90125'),
('73', 'Sulawesi Selatan', '7371', 'Makassar', 'KOTA', '737102', 'Mamajang', 'Mamajang Dalam', FALSE, '90135');

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public access (since this is reference data)
CREATE POLICY "Locations are viewable by everyone" 
  ON public.locations 
  FOR SELECT 
  USING (is_active = true);

-- Create policy for admin management
CREATE POLICY "Admins can manage locations" 
  ON public.locations 
  FOR ALL 
  USING (public.check_admin_access());

-- Create administrator settings table for location management
CREATE TABLE public.location_admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default administrator settings
INSERT INTO public.location_admin_settings (setting_key, setting_value, description) VALUES
('location_display_format', '{"format": "area_city_province", "separator": ", ", "show_postal_code": false}', 'How locations are displayed in dropdowns and forms'),
('location_search_priority', '{"priority_order": ["province_name", "city_name", "area_name"], "enable_fuzzy_search": true}', 'Search priority and algorithm settings'),
('location_validation_rules', '{"require_postal_code": false, "allow_custom_areas": true, "max_custom_locations": 50}', 'Validation rules for location data'),
('location_cache_settings', '{"cache_duration_minutes": 60, "preload_popular_locations": true, "max_cache_size": 1000}', 'Caching configuration for location data');

-- Enable RLS for admin settings
ALTER TABLE public.location_admin_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin settings viewable by admins" 
  ON public.location_admin_settings 
  FOR SELECT 
  USING (public.check_admin_access());

CREATE POLICY "Admin settings manageable by admins" 
  ON public.location_admin_settings 
  FOR ALL 
  USING (public.check_admin_access());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_location_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER location_admin_settings_updated_at
  BEFORE UPDATE ON public.location_admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_location_admin_settings_updated_at();
