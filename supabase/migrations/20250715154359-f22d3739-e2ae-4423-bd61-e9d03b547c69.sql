-- Ensure vendor user exists with correct credentials
DO $$
DECLARE
    vendor_user_id UUID;
BEGIN
    -- Check if vendor user exists
    SELECT id INTO vendor_user_id FROM auth.users WHERE email = 'vendor@astralvilla.com';
    
    IF vendor_user_id IS NULL THEN
        -- Create new vendor user if doesn't exist
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
            'vendor@astralvilla.com',
            crypt('master2179A', gen_salt('bf')),
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
            'vendor@astralvilla.com',
            'Vendor User',
            'vendor',
            'approved'
        );
    ELSE
        -- Update existing vendor user password
        UPDATE auth.users 
        SET encrypted_password = crypt('master2179A', gen_salt('bf')),
            updated_at = now()
        WHERE id = vendor_user_id;
        
        -- Update profile if exists
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            verification_status
        ) VALUES (
            vendor_user_id,
            'vendor@astralvilla.com',
            'Vendor User',
            'vendor',
            'approved'
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            verification_status = EXCLUDED.verification_status,
            updated_at = now();
    END IF;
END $$;