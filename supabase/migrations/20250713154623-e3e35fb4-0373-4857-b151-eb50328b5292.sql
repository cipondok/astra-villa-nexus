-- Create API settings table for admin management
CREATE TABLE IF NOT EXISTS public.api_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_name TEXT NOT NULL,
  api_key TEXT,
  api_endpoint TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(api_name)
);

-- Enable RLS
ALTER TABLE public.api_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage API settings"
ON public.api_settings
FOR ALL
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Create trigger for updated_at
CREATE TRIGGER update_api_settings_updated_at
  BEFORE UPDATE ON public.api_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default API configurations
INSERT INTO public.api_settings (api_name, description, is_active) VALUES
('OPENAI_API_KEY', 'OpenAI API key for AI chat and image generation', true),
('ANTHROPIC_API_KEY', 'Anthropic Claude API key', false),
('GOOGLE_MAPS_API_KEY', 'Google Maps API for location services', false),
('SENDGRID_API_KEY', 'SendGrid API for email services', false),
('TWILIO_API_KEY', 'Twilio API for SMS services', false)
ON CONFLICT (api_name) DO NOTHING;