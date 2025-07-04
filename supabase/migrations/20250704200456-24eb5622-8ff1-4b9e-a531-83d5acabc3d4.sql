-- Just reset vendor password without deleting user
UPDATE auth.users 
SET encrypted_password = crypt('vendor123', gen_salt('bf')),
    updated_at = now()
WHERE email = 'vendor@astravilla.com';

-- Ensure vendor profile is correct
UPDATE public.profiles 
SET role = 'vendor',
    verification_status = 'approved',
    full_name = 'Vendor User',
    updated_at = now()
WHERE email = 'vendor@astravilla.com';