
-- Chatbot Training Q&A Pairs
CREATE TABLE public.chatbot_training_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_category TEXT NOT NULL DEFAULT 'general',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  variations TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  language TEXT DEFAULT 'id',
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  last_matched_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Response Templates
CREATE TABLE public.chatbot_response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  template_content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  tone TEXT DEFAULT 'professional',
  language TEXT DEFAULT 'id',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chatbot Settings (singleton-style per key)
CREATE TABLE public.chatbot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default chatbot settings
INSERT INTO public.chatbot_settings (setting_key, setting_value) VALUES
('tone', '{"style": "professional", "formality": "semi-formal", "emoji_usage": "minimal", "language_preference": "bilingual"}'),
('behavior', '{"max_response_length": 150, "fallback_message": "Maaf, saya belum bisa menjawab pertanyaan tersebut. Silakan hubungi agen kami untuk bantuan lebih lanjut.", "greeting_message": "Halo! Saya asisten AI ASTRA Villa. Ada yang bisa saya bantu?", "escalation_threshold": 2}'),
('branding', '{"assistant_name": "ASTRA AI", "avatar_emoji": "🏠", "primary_topics": ["property_search", "pricing", "location", "mortgage", "legal"]}');

-- Enable RLS
ALTER TABLE public.chatbot_training_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin access via admin_users table
CREATE POLICY "Admins can manage training pairs" ON public.chatbot_training_pairs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage response templates" ON public.chatbot_response_templates
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage chatbot settings" ON public.chatbot_settings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Public read for edge functions (service role bypasses RLS, but anon needs read for chatbot)
CREATE POLICY "Public can read active training pairs" ON public.chatbot_training_pairs
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Public can read active templates" ON public.chatbot_response_templates
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Public can read chatbot settings" ON public.chatbot_settings
  FOR SELECT TO anon
  USING (true);
