
-- Fix the infinite recursion issue in admin_users table policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "admin_users_select_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_insert_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_delete_policy" ON public.admin_users;

-- Create simple, non-recursive policies for admin_users table
CREATE POLICY "admin_users_select_policy" ON public.admin_users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.email = 'mycode103@gmail.com'
  )
  OR
  user_id = auth.uid()
);

CREATE POLICY "admin_users_insert_policy" ON public.admin_users
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.email = 'mycode103@gmail.com'
  )
);

CREATE POLICY "admin_users_update_policy" ON public.admin_users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.email = 'mycode103@gmail.com'
  )
);

CREATE POLICY "admin_users_delete_policy" ON public.admin_users
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.email = 'mycode103@gmail.com'
  )
);

-- Add watermark settings table for comprehensive watermark configuration
CREATE TABLE IF NOT EXISTS public.property_watermark_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT true,
  watermark_type text DEFAULT 'text', -- 'text', 'image', 'both'
  
  -- Text watermark settings
  text_content text DEFAULT 'VillaAstra',
  text_color text DEFAULT '#FFFFFF',
  text_opacity numeric(3,2) DEFAULT 0.70,
  text_size integer DEFAULT 24,
  text_font text DEFAULT 'Arial',
  
  -- Image watermark settings
  watermark_image_url text,
  image_opacity numeric(3,2) DEFAULT 0.70,
  image_scale numeric(3,2) DEFAULT 1.00,
  
  -- Position settings (both text and image)
  position_x text DEFAULT 'center', -- 'left', 'center', 'right'
  position_y text DEFAULT 'center', -- 'top', 'center', 'bottom'
  offset_x integer DEFAULT 0,
  offset_y integer DEFAULT 0,
  
  -- Global settings
  applies_to_all boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_property_watermark_settings_updated_at
  BEFORE UPDATE ON public.property_watermark_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policies for watermark settings
ALTER TABLE public.property_watermark_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watermark_settings_select_policy" ON public.property_watermark_settings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'property_owner')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND (p.owner_id = auth.uid() OR p.agent_id = auth.uid())
  )
);

CREATE POLICY "watermark_settings_insert_policy" ON public.property_watermark_settings
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'property_owner')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND (p.owner_id = auth.uid() OR p.agent_id = auth.uid())
  )
);

CREATE POLICY "watermark_settings_update_policy" ON public.property_watermark_settings
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'property_owner')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND (p.owner_id = auth.uid() OR p.agent_id = auth.uid())
  )
);

CREATE POLICY "watermark_settings_delete_policy" ON public.property_watermark_settings
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'property_owner')
  )
);
