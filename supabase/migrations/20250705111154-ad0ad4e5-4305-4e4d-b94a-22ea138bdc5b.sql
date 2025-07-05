-- Create a test vendor user for login testing
-- Note: This creates the profile, but the auth user needs to be created through signup

-- First, let's check if we need to create a test user profile
INSERT INTO public.profiles (
  id,
  email, 
  full_name, 
  role, 
  verification_status
) VALUES (
  gen_random_uuid(),
  'testvendor@example.com',
  'Test Vendor User', 
  'vendor',
  'approved'
) 
ON CONFLICT (email) DO UPDATE SET
  role = 'vendor',
  verification_status = 'approved';

-- Create another test user profile
INSERT INTO public.profiles (
  id,
  email, 
  full_name, 
  role, 
  verification_status
) VALUES (
  gen_random_uuid(),
  'testuser@example.com',
  'Test User', 
  'general_user',
  'approved'
) 
ON CONFLICT (email) DO UPDATE SET
  verification_status = 'approved';