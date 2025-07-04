-- Create vendor user with proper credentials
DO $$
DECLARE
    vendor_user_id uuid;
BEGIN
    -- First, delete existing vendor if exists
    DELETE FROM auth.users WHERE email = 'vendor@astravilla.com';
    
    -- Create new vendor user
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
        recovery_token,
        aud,
        role
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
        '',
        'authenticated',
        'authenticated'
    ) RETURNING id INTO vendor_user_id;
    
    -- Create vendor profile
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        verification_status
    ) VALUES (
        vendor_user_id,
        'vendor@astravilla.com',
        'Vendor User',
        'vendor',
        'approved'
    );
END $$;