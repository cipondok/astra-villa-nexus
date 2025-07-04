-- Simple password reset for vendor user
DO $$
DECLARE
    vendor_user_id uuid;
BEGIN
    -- Get the vendor user ID
    SELECT id INTO vendor_user_id FROM auth.users WHERE email = 'vendor@astravilla.com';
    
    -- Update password if user exists
    IF vendor_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET encrypted_password = crypt('vendor123', gen_salt('bf')),
            updated_at = now()
        WHERE id = vendor_user_id;
        
        -- Update or insert profile
        INSERT INTO public.profiles (id, email, full_name, role, verification_status)
        VALUES (vendor_user_id, 'vendor@astravilla.com', 'Vendor User', 'vendor', 'approved')
        ON CONFLICT (id) DO UPDATE SET
            role = 'vendor',
            verification_status = 'approved',
            updated_at = now();
    END IF;
END $$;