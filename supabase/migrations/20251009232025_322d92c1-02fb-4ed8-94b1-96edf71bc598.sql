-- Create cloudflare_settings table
CREATE TABLE IF NOT EXISTS public.cloudflare_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- API Credentials
  zone_id TEXT,
  account_id TEXT,
  api_email TEXT,
  api_token TEXT,
  
  -- CDN Configuration
  cdn_enabled BOOLEAN DEFAULT false,
  
  -- Auto Minification
  auto_minify_enabled BOOLEAN DEFAULT false,
  auto_minify_css BOOLEAN DEFAULT false,
  auto_minify_js BOOLEAN DEFAULT false,
  auto_minify_html BOOLEAN DEFAULT false,
  
  -- Caching Settings
  cache_level TEXT DEFAULT 'standard',
  browser_cache_ttl INTEGER DEFAULT 14400,
  edge_cache_ttl INTEGER DEFAULT 7200,
  always_online BOOLEAN DEFAULT true,
  development_mode BOOLEAN DEFAULT false,
  
  -- Performance Settings
  rocket_loader BOOLEAN DEFAULT false,
  mirage BOOLEAN DEFAULT false,
  polish TEXT DEFAULT 'off',
  webp_enabled BOOLEAN DEFAULT true,
  brotli_enabled BOOLEAN DEFAULT true,
  http2_enabled BOOLEAN DEFAULT true,
  http3_enabled BOOLEAN DEFAULT true,
  early_hints BOOLEAN DEFAULT false,
  
  -- Security Settings
  ssl_mode TEXT DEFAULT 'flexible',
  always_use_https BOOLEAN DEFAULT true,
  automatic_https_rewrites BOOLEAN DEFAULT true,
  tls_version TEXT DEFAULT '1.2',
  rate_limiting_enabled BOOLEAN DEFAULT false,
  ddos_protection TEXT DEFAULT 'medium',
  challenge_passage INTEGER DEFAULT 30,
  
  -- Image Optimization
  image_resizing_enabled BOOLEAN DEFAULT false,
  image_optimization_quality INTEGER DEFAULT 85,
  
  -- Analytics
  analytics_enabled BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cloudflare_settings ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "Admins can manage cloudflare settings"
  ON public.cloudflare_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
      AND user_roles.is_active = true
    )
  );

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.cloudflare_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id UUID REFERENCES public.cloudflare_settings(id),
  action TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.cloudflare_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin can view audit logs
CREATE POLICY "Admins can view cloudflare audit logs"
  ON public.cloudflare_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
      AND user_roles.is_active = true
    )
  );

-- Function to log changes
CREATE OR REPLACE FUNCTION public.log_cloudflare_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.cloudflare_audit_log (setting_id, action, changed_by, old_values, new_values)
    VALUES (
      NEW.id,
      'UPDATE',
      auth.uid(),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.cloudflare_audit_log (setting_id, action, changed_by, new_values)
    VALUES (
      NEW.id,
      'INSERT',
      auth.uid(),
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER cloudflare_settings_audit_trigger
  AFTER INSERT OR UPDATE ON public.cloudflare_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_cloudflare_settings_changes();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_cloudflare_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cloudflare_settings_timestamp
  BEFORE UPDATE ON public.cloudflare_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cloudflare_settings_timestamp();