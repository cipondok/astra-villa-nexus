-- Video Tours table
CREATE TABLE public.video_tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_vr_enabled BOOLEAN DEFAULT true,
  tour_type TEXT DEFAULT 'panorama' CHECK (tour_type IN ('panorama', '360_video', 'walkthrough')),
  view_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{"autoRotate": true, "rotateSpeed": 0.5, "enableZoom": true, "defaultFov": 75}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tour Scenes (individual 360° images/videos)
CREATE TABLE public.tour_scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.video_tours(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scene_order INTEGER DEFAULT 0,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  initial_view JSONB DEFAULT '{"pitch": 0, "yaw": 0, "fov": 75}'::jsonb,
  is_entry_point BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Interactive Hotspots
CREATE TABLE public.tour_hotspots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID NOT NULL REFERENCES public.tour_scenes(id) ON DELETE CASCADE,
  hotspot_type TEXT NOT NULL CHECK (hotspot_type IN ('navigation', 'info', 'media', 'link')),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'info',
  position JSONB NOT NULL DEFAULT '{"pitch": 0, "yaw": 0}'::jsonb,
  target_scene_id UUID REFERENCES public.tour_scenes(id),
  media_url TEXT,
  link_url TEXT,
  style JSONB DEFAULT '{"color": "#ffffff", "size": "medium"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tour Analytics
CREATE TABLE public.tour_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.video_tours(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  scenes_visited TEXT[] DEFAULT '{}',
  hotspots_clicked TEXT[] DEFAULT '{}',
  device_type TEXT,
  is_vr_session BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_analytics ENABLE ROW LEVEL SECURITY;

-- Video Tours policies (using owner_id from properties table)
CREATE POLICY "Anyone can view published tours"
ON public.video_tours FOR SELECT
USING (is_published = true);

CREATE POLICY "Property owners can manage their tours"
ON public.video_tours FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = video_tours.property_id 
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all tours"
ON public.video_tours FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Tour Scenes policies
CREATE POLICY "Anyone can view scenes of published tours"
ON public.tour_scenes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.video_tours 
    WHERE id = tour_scenes.tour_id 
    AND is_published = true
  )
);

CREATE POLICY "Tour owners can manage scenes"
ON public.tour_scenes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.video_tours vt
    JOIN public.properties p ON p.id = vt.property_id
    WHERE vt.id = tour_scenes.tour_id 
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all scenes"
ON public.tour_scenes FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Hotspots policies
CREATE POLICY "Anyone can view hotspots of published tours"
ON public.tour_hotspots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tour_scenes ts
    JOIN public.video_tours vt ON vt.id = ts.tour_id
    WHERE ts.id = tour_hotspots.scene_id 
    AND vt.is_published = true
  )
);

CREATE POLICY "Scene owners can manage hotspots"
ON public.tour_hotspots FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tour_scenes ts
    JOIN public.video_tours vt ON vt.id = ts.tour_id
    JOIN public.properties p ON p.id = vt.property_id
    WHERE ts.id = tour_hotspots.scene_id 
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all hotspots"
ON public.tour_hotspots FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Analytics policies
CREATE POLICY "Anyone can insert analytics"
ON public.tour_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Tour owners can view their analytics"
ON public.tour_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.video_tours vt
    JOIN public.properties p ON p.id = vt.property_id
    WHERE vt.id = tour_analytics.tour_id 
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all analytics"
ON public.tour_analytics FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Indexes for performance
CREATE INDEX idx_video_tours_property ON public.video_tours(property_id);
CREATE INDEX idx_video_tours_published ON public.video_tours(is_published) WHERE is_published = true;
CREATE INDEX idx_tour_scenes_tour ON public.tour_scenes(tour_id);
CREATE INDEX idx_tour_hotspots_scene ON public.tour_hotspots(scene_id);
CREATE INDEX idx_tour_analytics_tour ON public.tour_analytics(tour_id);
CREATE INDEX idx_tour_analytics_session ON public.tour_analytics(session_id);

-- Update timestamp trigger
CREATE TRIGGER update_video_tours_updated_at
BEFORE UPDATE ON public.video_tours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();