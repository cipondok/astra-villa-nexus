-- Create table for IP blocks
CREATE TABLE public.ip_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address inet NOT NULL UNIQUE,
  reason TEXT,
  blocked_by UUID REFERENCES auth.users(id),
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT false,
  block_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for country blocks (for Indonesian-based website to control access)
CREATE TABLE public.country_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  reason TEXT,
  blocked_by UUID REFERENCES auth.users(id),
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add visit duration tracking to web_analytics if not exists
ALTER TABLE public.web_analytics 
ADD COLUMN IF NOT EXISTS visit_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_bounce BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS exit_page TEXT;

-- Enable RLS
ALTER TABLE public.ip_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_blocks ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for ip_blocks
CREATE POLICY "Admins can view ip_blocks" ON public.ip_blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can insert ip_blocks" ON public.ip_blocks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update ip_blocks" ON public.ip_blocks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete ip_blocks" ON public.ip_blocks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admin-only policies for country_blocks
CREATE POLICY "Admins can view country_blocks" ON public.country_blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can insert country_blocks" ON public.country_blocks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update country_blocks" ON public.country_blocks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete country_blocks" ON public.country_blocks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_ip_blocks_ip ON public.ip_blocks(ip_address);
CREATE INDEX idx_ip_blocks_blocked_at ON public.ip_blocks(blocked_at DESC);
CREATE INDEX idx_country_blocks_code ON public.country_blocks(country_code);
CREATE INDEX idx_country_blocks_active ON public.country_blocks(is_active);
CREATE INDEX idx_web_analytics_created ON public.web_analytics(created_at DESC);
CREATE INDEX idx_web_analytics_country ON public.web_analytics(country);
CREATE INDEX idx_web_analytics_ip ON public.web_analytics(ip_address);