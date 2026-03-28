-- Fix 1: Payment gateway credentials - restrict to admin only
CREATE POLICY "Admin can view all gateways"
ON payment_gateway_profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Safe view for non-admin users (excludes config column with credentials)
CREATE OR REPLACE VIEW public.public_payment_gateways
WITH (security_invoker = true)
AS SELECT 
  id, provider_name, supported_currencies, is_active, created_at
FROM payment_gateway_profiles
WHERE is_active = true;

-- Fix 2: Institutional access - restrict to admin only
CREATE POLICY "Admin read inst access"
ON gpi_institutional_access FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage inst access"
ON gpi_institutional_access FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));