
-- Social Commerce Platform Integrations
CREATE TABLE public.social_commerce_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT NOT NULL, -- instagram, tiktok, pinterest, facebook, whatsapp
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  api_credentials JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  webhook_url TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending',
  total_impressions BIGINT DEFAULT 0,
  total_clicks BIGINT DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(platform_name)
);

-- Property Social Commerce Listings
CREATE TABLE public.social_commerce_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.social_commerce_platforms(id) ON DELETE CASCADE,
  external_listing_id TEXT,
  listing_url TEXT,
  status TEXT DEFAULT 'draft', -- draft, pending, active, paused, rejected
  shop_now_enabled BOOLEAN DEFAULT true,
  featured_media JSONB DEFAULT '[]',
  hashtags TEXT[] DEFAULT '{}',
  caption TEXT,
  call_to_action TEXT DEFAULT 'Book Viewing',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Social Commerce Campaigns
CREATE TABLE public.social_commerce_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  platform_id UUID REFERENCES public.social_commerce_platforms(id) ON DELETE CASCADE,
  campaign_type TEXT NOT NULL, -- storefront, tour, idea_board, marketplace, automated
  target_audience JSONB DEFAULT '{}',
  budget DECIMAL(15,2),
  spent DECIMAL(15,2) DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',
  properties UUID[] DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- One-Click Mortgage Pre-Approval
CREATE TABLE public.mortgage_preapproval_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  property_id UUID REFERENCES public.properties(id),
  source_platform TEXT, -- instagram, tiktok, direct, etc.
  -- Applicant Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  -- Employment
  employment_status TEXT,
  employer_name TEXT,
  monthly_income DECIMAL(15,2),
  employment_duration_months INTEGER,
  -- Financial
  existing_debts DECIMAL(15,2) DEFAULT 0,
  down_payment_amount DECIMAL(15,2),
  requested_loan_amount DECIMAL(15,2),
  preferred_term_years INTEGER DEFAULT 20,
  -- Status
  status TEXT DEFAULT 'pending', -- pending, reviewing, approved, rejected, expired
  preapproval_amount DECIMAL(15,2),
  preapproval_rate DECIMAL(5,2),
  preapproval_valid_until DATE,
  bank_partner_id UUID REFERENCES public.acquisition_bank_partnerships(id),
  notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Virtual Tour Bookings (Enhanced)
CREATE TABLE public.virtual_tour_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  source_platform TEXT, -- whatsapp, instagram, tiktok, direct
  -- Guest Info
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  -- Booking Details
  booking_type TEXT DEFAULT 'virtual', -- virtual, in_person, hybrid
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  duration_minutes INTEGER DEFAULT 30,
  -- Status
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no_show
  meeting_link TEXT,
  meeting_provider TEXT DEFAULT 'google_meet', -- google_meet, zoom, whatsapp_video
  -- Automation
  reminder_sent BOOLEAN DEFAULT false,
  confirmation_sent BOOLEAN DEFAULT false,
  follow_up_sent BOOLEAN DEFAULT false,
  -- Agent
  assigned_agent_id UUID REFERENCES public.profiles(id),
  agent_notes TEXT,
  guest_rating INTEGER CHECK (guest_rating >= 1 AND guest_rating <= 5),
  guest_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- WhatsApp Automated Conversations
CREATE TABLE public.whatsapp_automation_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- inquiry, viewing_request, preapproval, follow_up
  trigger_keywords TEXT[] DEFAULT '{}',
  message_templates JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  response_delay_seconds INTEGER DEFAULT 5,
  working_hours JSONB DEFAULT '{"start": "08:00", "end": "20:00", "timezone": "Asia/Jakarta"}',
  total_triggered INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_commerce_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_commerce_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_commerce_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortgage_preapproval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_tour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_automation_flows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view enabled platforms" ON public.social_commerce_platforms FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins can manage platforms" ON public.social_commerce_platforms FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Anyone can view active listings" ON public.social_commerce_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage listings" ON public.social_commerce_listings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own campaigns" ON public.social_commerce_campaigns FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Admins can manage campaigns" ON public.social_commerce_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create preapproval requests" ON public.mortgage_preapproval_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own preapproval" ON public.mortgage_preapproval_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage preapprovals" ON public.mortgage_preapproval_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create tour bookings" ON public.virtual_tour_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own bookings" ON public.virtual_tour_bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage bookings" ON public.virtual_tour_bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Anyone can view active flows" ON public.whatsapp_automation_flows FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage flows" ON public.whatsapp_automation_flows FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Seed default platforms
INSERT INTO public.social_commerce_platforms (platform_name, display_name, is_enabled, settings) VALUES
('instagram', 'Instagram Storefront', true, '{"shop_enabled": true, "story_links": true, "reels_shopping": true}'),
('tiktok', 'TikTok Shop', true, '{"shop_now_button": true, "live_shopping": false, "product_links": true}'),
('pinterest', 'Pinterest Ideas', true, '{"rich_pins": true, "idea_pins": true, "shop_tab": true}'),
('facebook', 'Facebook Marketplace', true, '{"marketplace_premium": true, "shop_integration": true, "messenger_bot": true}'),
('whatsapp', 'WhatsApp Business', true, '{"automated_replies": true, "catalog": true, "booking_flow": true}');

-- Seed WhatsApp automation flows
INSERT INTO public.whatsapp_automation_flows (flow_name, trigger_type, trigger_keywords, message_templates, is_active) VALUES
('Viewing Request', 'viewing_request', ARRAY['jadwal', 'lihat', 'kunjungi', 'survey', 'viewing', 'visit'], 
 '[{"step": 1, "message": "Terima kasih atas minat Anda! 🏠\n\nSilakan pilih waktu yang tersedia untuk melihat properti:\n\n1️⃣ Hari ini\n2️⃣ Besok\n3️⃣ Minggu ini\n4️⃣ Pilih tanggal lain", "wait_for_response": true},
   {"step": 2, "message": "Baik, silakan pilih waktu:\n\n🌅 Pagi (09:00-12:00)\n☀️ Siang (13:00-16:00)\n🌆 Sore (16:00-18:00)", "wait_for_response": true},
   {"step": 3, "message": "Sempurna! Jadwal Anda telah dikonfirmasi ✅\n\nDetail:\n📍 {property_address}\n📅 {date}\n⏰ {time}\n\nAgen kami akan menghubungi Anda untuk konfirmasi. Terima kasih!", "wait_for_response": false}]', true),
('Pre-Approval Inquiry', 'preapproval', ARRAY['kpr', 'kredit', 'cicilan', 'mortgage', 'loan', 'dp'], 
 '[{"step": 1, "message": "Ingin mengajukan KPR? 🏦\n\nKami bisa membantu Anda mendapatkan pre-approval dalam hitungan menit!\n\nApakah Anda ingin:\n1️⃣ Cek kelayakan KPR\n2️⃣ Hitung simulasi cicilan\n3️⃣ Ajukan pre-approval sekarang", "wait_for_response": true},
   {"step": 2, "message": "Untuk pre-approval cepat, silakan klik link berikut:\n\n🔗 {preapproval_link}\n\nAtau balas dengan informasi berikut:\n- Penghasilan bulanan\n- Uang muka tersedia\n- Properti yang diminati", "wait_for_response": false}]', true),
('General Inquiry', 'inquiry', ARRAY['harga', 'info', 'detail', 'price', 'available', 'tersedia'], 
 '[{"step": 1, "message": "Halo! 👋 Terima kasih telah menghubungi kami.\n\nBagaimana kami bisa membantu Anda hari ini?\n\n🏠 Cari properti\n💰 Tanya harga\n📅 Jadwal viewing\n🏦 Info KPR", "wait_for_response": true}]', true);

-- Create indexes for performance
CREATE INDEX idx_social_listings_property ON public.social_commerce_listings(property_id);
CREATE INDEX idx_social_listings_platform ON public.social_commerce_listings(platform_id);
CREATE INDEX idx_social_listings_status ON public.social_commerce_listings(status);
CREATE INDEX idx_preapproval_user ON public.mortgage_preapproval_requests(user_id);
CREATE INDEX idx_preapproval_status ON public.mortgage_preapproval_requests(status);
CREATE INDEX idx_tour_bookings_property ON public.virtual_tour_bookings(property_id);
CREATE INDEX idx_tour_bookings_date ON public.virtual_tour_bookings(scheduled_date);
CREATE INDEX idx_tour_bookings_status ON public.virtual_tour_bookings(status);
