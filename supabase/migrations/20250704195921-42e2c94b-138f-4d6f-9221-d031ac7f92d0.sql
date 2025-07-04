-- Create vendor user properly with known credentials
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'vendor@astravilla.com',
  crypt('vendor123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('vendor123', gen_salt('bf')),
  updated_at = now();

-- Ensure vendor profile exists
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  verification_status
) 
SELECT 
  u.id,
  u.email,
  'Vendor User',
  'vendor'::user_role,
  'approved'
FROM auth.users u 
WHERE u.email = 'vendor@astravilla.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'vendor'::user_role,
  verification_status = 'approved',
  updated_at = now();