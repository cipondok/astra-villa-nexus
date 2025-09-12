-- Fix RLS policies and storage access for vendor profiles and locations, and ensure vendor-assets bucket access
BEGIN;

-- Vendor business profiles: replace restrictive policies with permissive ones
DROP POLICY IF EXISTS admins_can_manage_all_profiles ON public.vendor_business_profiles;
DROP POLICY IF EXISTS public_can_view_verified_profiles ON public.vendor_business_profiles;
DROP POLICY IF EXISTS vendors_can_manage_own_profile ON public.vendor_business_profiles;

-- Vendors can read their own profile
CREATE POLICY vendors_select_own_profile
ON public.vendor_business_profiles
FOR SELECT
USING (vendor_id = auth.uid());

-- Vendors can insert their own profile
CREATE POLICY vendors_insert_own_profile
ON public.vendor_business_profiles
FOR INSERT
WITH CHECK (vendor_id = auth.uid());

-- Vendors can update their own profile
CREATE POLICY vendors_update_own_profile
ON public.vendor_business_profiles
FOR UPDATE
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- Vendors can delete their own profile
CREATE POLICY vendors_delete_own_profile
ON public.vendor_business_profiles
FOR DELETE
USING (vendor_id = auth.uid());

-- Public (authenticated) can read verified, active vendor profiles
CREATE POLICY public_select_verified_profiles
ON public.vendor_business_profiles
FOR SELECT
USING (is_active = true AND is_verified = true);

-- Admins can manage everything
CREATE POLICY admins_manage_vendor_profiles
ON public.vendor_business_profiles
FOR ALL
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Locations: replace restrictive policies with permissive ones
DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;
DROP POLICY IF EXISTS "Locations are viewable by everyone" ON public.locations;

CREATE POLICY public_select_active_locations
ON public.locations
FOR SELECT
USING (is_active = true);

CREATE POLICY admins_manage_locations
ON public.locations
FOR ALL
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Ensure vendor-assets bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-assets', 'vendor-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for vendor-assets
DROP POLICY IF EXISTS "Public read vendor-assets" ON storage.objects;
DROP POLICY IF EXISTS "Vendors upload vendor-assets" ON storage.objects;
DROP POLICY IF EXISTS "Vendors update vendor-assets" ON storage.objects;
DROP POLICY IF EXISTS "Vendors delete vendor-assets" ON storage.objects;

CREATE POLICY "Public read vendor-assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vendor-assets');

CREATE POLICY "Vendors upload vendor-assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-assets'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Vendors update vendor-assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vendor-assets'
  AND (auth.uid()::text = (storage.foldername(name))[1])
)
WITH CHECK (
  bucket_id = 'vendor-assets'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Vendors delete vendor-assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vendor-assets'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

COMMIT;
