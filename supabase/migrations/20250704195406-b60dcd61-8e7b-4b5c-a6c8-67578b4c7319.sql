-- Reset vendor password for testing
UPDATE auth.users 
SET encrypted_password = crypt('vendor123', gen_salt('bf'))
WHERE email = 'vendor@astravilla.com';