-- Fix vendor email spelling and reset password
UPDATE auth.users 
SET email = 'vendor@astralvilla.com',
    encrypted_password = crypt('master2179A', gen_salt('bf')),
    updated_at = now()
WHERE email = 'vendor@astravilla.com';

-- Update profile email to match
UPDATE public.profiles 
SET email = 'vendor@astralvilla.com',
    updated_at = now()
WHERE email = 'vendor@astravilla.com';