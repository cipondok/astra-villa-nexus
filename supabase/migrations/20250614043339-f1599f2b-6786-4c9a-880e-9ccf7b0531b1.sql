
-- Fix the properties table structure - remove duplicate approval columns
-- and standardize on 'status' column only
ALTER TABLE public.properties DROP COLUMN IF EXISTS approval_status;

-- Update any existing properties to have proper status values
UPDATE public.properties 
SET status = 'approved' 
WHERE status = 'pending_approval' AND owner_id IS NOT NULL;

-- Ensure we have some test data for search to work
INSERT INTO public.properties (
  title, 
  description, 
  property_type, 
  listing_type, 
  location, 
  city, 
  state, 
  price, 
  bedrooms, 
  bathrooms, 
  area_sqm, 
  status,
  owner_id
) VALUES 
  ('Modern Villa Jakarta', 'Beautiful modern villa in South Jakarta with swimming pool', 'villa', 'sale', 'South Jakarta', 'Jakarta', 'DKI Jakarta', 2500000000, 4, 3, 300, 'approved', (SELECT id FROM auth.users LIMIT 1)),
  ('Luxury Apartment Bali', 'Stunning apartment with ocean view in Seminyak', 'apartment', 'rent', 'Seminyak, Bali', 'Denpasar', 'Bali', 15000000, 2, 2, 120, 'approved', (SELECT id FROM auth.users LIMIT 1)),
  ('Family House Surabaya', 'Comfortable family house in East Surabaya', 'house', 'sale', 'East Surabaya', 'Surabaya', 'East Java', 1200000000, 3, 2, 200, 'approved', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Fix admin authorization by ensuring profiles table has proper admin role
-- Update the specific admin user
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'mycode103@gmail.com';

-- Ensure admin_users table has the super admin entry
INSERT INTO public.admin_users (user_id, is_super_admin)
SELECT p.id, true
FROM public.profiles p 
WHERE p.email = 'mycode103@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET is_super_admin = true;

-- Create RLS policies for properties table to allow public read access for approved properties
DROP POLICY IF EXISTS "Public can view approved properties" ON public.properties;
CREATE POLICY "Public can view approved properties" 
  ON public.properties 
  FOR SELECT 
  USING (status = 'approved');

DROP POLICY IF EXISTS "Property owners can manage their properties" ON public.properties;
CREATE POLICY "Property owners can manage their properties" 
  ON public.properties 
  FOR ALL 
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
CREATE POLICY "Admins can manage all properties" 
  ON public.properties 
  FOR ALL 
  USING (public.check_admin_access());
