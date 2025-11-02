-- Create carousel settings table for admin control
CREATE TABLE IF NOT EXISTS public.carousel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carousel_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  auto_scroll BOOLEAN DEFAULT true,
  scroll_speed INTEGER DEFAULT 1 CHECK (scroll_speed >= 1 AND scroll_speed <= 10),
  scroll_direction TEXT DEFAULT 'rtl' CHECK (scroll_direction IN ('ltr', 'rtl')),
  loop_mode TEXT DEFAULT 'stop' CHECK (loop_mode IN ('stop', 'loop', 'seamless')),
  pause_on_hover BOOLEAN DEFAULT true,
  interval_ms INTEGER DEFAULT 25 CHECK (interval_ms >= 10 AND interval_ms <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings for Featured Properties carousel
INSERT INTO public.carousel_settings (carousel_name, is_enabled, auto_scroll, scroll_speed, scroll_direction, loop_mode, pause_on_hover)
VALUES ('featured_properties', true, true, 1, 'rtl', 'stop', true)
ON CONFLICT (carousel_name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.carousel_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read carousel settings
CREATE POLICY "Anyone can view carousel settings"
  ON public.carousel_settings
  FOR SELECT
  USING (true);

-- Policy: Only admins can modify carousel settings
CREATE POLICY "Only admins can modify carousel settings"
  ON public.carousel_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_carousel_settings_updated_at
  BEFORE UPDATE ON public.carousel_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();