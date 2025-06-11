
-- Add admin vendor service management tables
CREATE TABLE public.admin_vendor_service_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.vendor_services(id) ON DELETE CASCADE,
  admin_action TEXT NOT NULL, -- 'approved', 'rejected', 'suspended'
  admin_notes TEXT,
  admin_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add vendor membership levels
CREATE TABLE public.vendor_membership_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_name TEXT NOT NULL,
  level_number INTEGER NOT NULL UNIQUE,
  requirements JSONB DEFAULT '{}',
  benefits JSONB DEFAULT '{}',
  tasks_required INTEGER DEFAULT 0,
  time_requirement_days INTEGER DEFAULT 0,
  min_rating DECIMAL DEFAULT 0,
  min_completed_bookings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add vendor KYC verification
CREATE TABLE public.vendor_kyc_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id),
  ktp_number TEXT,
  ktp_image_url TEXT,
  face_verification_url TEXT,
  mobile_number TEXT,
  mobile_verified_at TIMESTAMP WITH TIME ZONE,
  whatsapp_number TEXT,
  whatsapp_verified_at TIMESTAMP WITH TIME ZONE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  face_verified_at TIMESTAMP WITH TIME ZONE,
  ktp_verified_at TIMESTAMP WITH TIME ZONE,
  overall_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  verified_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add vendor membership progress
CREATE TABLE public.vendor_membership_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id),
  current_level_id UUID REFERENCES public.vendor_membership_levels(id),
  next_level_id UUID REFERENCES public.vendor_membership_levels(id),
  completed_tasks INTEGER DEFAULT 0,
  level_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  level_achieved_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add currency settings
ALTER TABLE public.vendor_services 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IDR';

ALTER TABLE public.vendor_service_items 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IDR';

ALTER TABLE public.vendor_invoices 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IDR';

-- Insert default membership levels
INSERT INTO public.vendor_membership_levels (level_name, level_number, requirements, benefits, tasks_required, time_requirement_days, min_completed_bookings) VALUES
('Bronze', 1, '{"verification": "basic", "documents": "ktp"}', '{"commission": 15, "features": "basic"}', 5, 30, 0),
('Silver', 2, '{"verification": "full", "rating": 4.0}', '{"commission": 12, "features": "advanced"}', 15, 60, 10),
('Gold', 3, '{"verification": "full", "rating": 4.5}', '{"commission": 10, "features": "premium"}', 30, 90, 25),
('Platinum', 4, '{"verification": "full", "rating": 4.8}', '{"commission": 8, "features": "enterprise"}', 50, 180, 50);

-- Add Indonesian company categories
INSERT INTO public.vendor_business_nature_categories (name, description, display_order) VALUES
('Jasa Rumah Tangga', 'Pembersihan, perawatan, perbaikan rumah', 1),
('Jasa Profesional', 'Konsultan, hukum, akuntansi', 2),
('Kesehatan & Kebugaran', 'Medis, terapi, fitness', 3),
('Pendidikan & Pelatihan', 'Les privat, kursus, workshop', 4),
('Teknologi & IT', 'Support IT, software, web development', 5),
('Pengiriman & Logistik', 'Delivery makanan, kurir, pindahan', 6),
('Hiburan & Acara', 'Fotografi, DJ, katering', 7),
('Retail & E-commerce', 'Toko online, penjualan produk', 8);

-- Enable RLS
ALTER TABLE public.admin_vendor_service_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_membership_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_kyc_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_membership_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage service controls" ON public.admin_vendor_service_controls FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view membership levels" ON public.vendor_membership_levels FOR SELECT USING (is_active = true);

CREATE POLICY "Vendors can view their own KYC" ON public.vendor_kyc_verification FOR SELECT USING (vendor_id = auth.uid());
CREATE POLICY "Vendors can create their own KYC" ON public.vendor_kyc_verification FOR INSERT WITH CHECK (vendor_id = auth.uid());
CREATE POLICY "Admins can manage all KYC" ON public.vendor_kyc_verification FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Vendors can view their own progress" ON public.vendor_membership_progress FOR SELECT USING (vendor_id = auth.uid());
CREATE POLICY "System can manage progress" ON public.vendor_membership_progress FOR ALL USING (true);
