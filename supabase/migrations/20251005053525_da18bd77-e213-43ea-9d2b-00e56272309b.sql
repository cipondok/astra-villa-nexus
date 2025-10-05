-- Create homepage slider settings table
CREATE TABLE IF NOT EXISTS public.homepage_slider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_order INTEGER NOT NULL,
  title_en TEXT,
  title_id TEXT,
  subtitle_en TEXT,
  subtitle_id TEXT,
  image_url TEXT NOT NULL,
  image_mobile TEXT,
  image_tablet TEXT,
  image_desktop TEXT,
  link_url TEXT,
  button_text_en TEXT,
  button_text_id TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Device-specific settings
  desktop_height INTEGER DEFAULT 600,
  tablet_height INTEGER DEFAULT 500,
  mobile_height INTEGER DEFAULT 400,
  
  -- Animation settings
  animation_type TEXT DEFAULT 'fade',
  animation_duration INTEGER DEFAULT 500,
  auto_play BOOLEAN DEFAULT true,
  auto_play_delay INTEGER DEFAULT 5000,
  
  -- Display settings
  show_navigation BOOLEAN DEFAULT true,
  show_pagination BOOLEAN DEFAULT true,
  show_on_mobile BOOLEAN DEFAULT true,
  show_on_tablet BOOLEAN DEFAULT true,
  show_on_desktop BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.homepage_slider_settings ENABLE ROW LEVEL SECURITY;

-- Public can view active slides
CREATE POLICY "Anyone can view active homepage slides"
  ON public.homepage_slider_settings
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage slides
CREATE POLICY "Admins can manage homepage slides"
  ON public.homepage_slider_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_homepage_slider_settings_updated_at
  BEFORE UPDATE ON public.homepage_slider_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default slides
INSERT INTO public.homepage_slider_settings (
  slide_order, title_en, title_id, subtitle_en, subtitle_id,
  image_url, is_active, show_on_mobile, show_on_tablet, show_on_desktop
) VALUES
(1, 'Find Your Dream Property', 'Temukan Properti Impian Anda', 
 'Discover amazing properties across Indonesia', 'Temukan properti luar biasa di seluruh Indonesia',
 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80', true, true, true, true),
(2, 'Luxury Living Awaits', 'Hunian Mewah Menanti', 
 'Experience premium properties with world-class amenities', 'Rasakan properti premium dengan fasilitas kelas dunia',
 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80', true, true, true, true),
(3, 'Investment Opportunities', 'Peluang Investasi', 
 'Smart investments in prime real estate locations', 'Investasi cerdas di lokasi properti utama',
 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80', true, true, true, true);