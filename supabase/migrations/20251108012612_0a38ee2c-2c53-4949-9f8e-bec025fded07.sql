-- Create user_devices table for device fingerprinting and management
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  ip_address INET,
  location_data JSONB DEFAULT '{}',
  is_trusted BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_fingerprint)
);

-- Enable Row Level Security
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Users can view their own devices
CREATE POLICY "users_view_own_devices"
  ON public.user_devices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own devices (e.g., mark as trusted, rename)
CREATE POLICY "users_update_own_devices"
  ON public.user_devices
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own devices (revoke trust)
CREATE POLICY "users_delete_own_devices"
  ON public.user_devices
  FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert device records
CREATE POLICY "system_insert_devices"
  ON public.user_devices
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX idx_user_devices_fingerprint ON public.user_devices(device_fingerprint);
CREATE INDEX idx_user_devices_last_used ON public.user_devices(last_used_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_devices_updated_at
  BEFORE UPDATE ON public.user_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_user_devices_updated_at();