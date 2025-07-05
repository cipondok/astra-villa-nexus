-- Create test accounts for demo purposes
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'test-vendor@astravilla.com', '$2a$10$K8BKjKK9K8BKjKK9K8BKjOwqGBVqUqUqUqUqUqUqUqUqUqUqUqUqU', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Vendor"}'),
  ('22222222-2222-2222-2222-222222222222', 'test-agent@astravilla.com', '$2a$10$K8BKjKK9K8BKjKK9K8BKjOwqGBVqUqUqUqUqUqUqUqUqUqUqUqUqU', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Agent"}'),
  ('33333333-3333-3333-3333-333333333333', 'test-property-owner@astravilla.com', '$2a$10$K8BKjKK9K8BKjKK9K8BKjOwqGBVqUqUqUqUqUqUqUqUqUqUqUqUqU', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Property Owner"}');

-- Create corresponding profiles  
INSERT INTO public.profiles (id, email, full_name, role, verification_status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'test-vendor@astravilla.com', 'Test Vendor', 'vendor', 'approved'),
  ('22222222-2222-2222-2222-222222222222', 'test-agent@astravilla.com', 'Test Agent', 'agent', 'approved'),
  ('33333333-3333-3333-3333-333333333333', 'test-property-owner@astravilla.com', 'Test Property Owner', 'property_owner', 'approved');