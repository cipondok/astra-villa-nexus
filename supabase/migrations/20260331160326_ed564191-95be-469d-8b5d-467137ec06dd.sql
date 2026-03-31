
-- Create a public view excluding sensitive columns
CREATE OR REPLACE VIEW public.public_listing_syndication_networks
WITH (security_invoker = on) AS
SELECT 
  id, network_name, network_type, logo_url, is_active, 
  supported_property_types, supported_regions,
  listing_fee, commission_rate, sync_frequency_hours,
  last_sync_at, total_listings_shared, total_leads_received,
  created_at, updated_at
FROM public.listing_syndication_networks
WHERE is_active = true;

-- Replace the permissive policy: only admins can SELECT directly (which includes api_key_encrypted)
DROP POLICY IF EXISTS "Public can view active networks without keys" ON public.listing_syndication_networks;

CREATE POLICY "Only admins can directly read networks"
ON public.listing_syndication_networks
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);
