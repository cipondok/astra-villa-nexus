-- Add missing RLS policies for vendor_requests table
-- Allow users to insert their own vendor requests
CREATE POLICY "Users can create their own vendor requests"
ON vendor_requests
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow users to view their own vendor requests
CREATE POLICY "Users can view their own vendor requests"
ON vendor_requests
FOR SELECT
USING (user_id = auth.uid());

-- Allow users to update their pending vendor requests  
CREATE POLICY "Users can update their pending vendor requests"
ON vendor_requests
FOR UPDATE
USING (user_id = auth.uid() AND status = 'pending');

-- Also ensure admin_alerts allows trigger inserts (SECURITY DEFINER functions)
-- Grant insert on admin_alerts for the trigger function
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_alerts' 
    AND policyname = 'Allow trigger inserts for admin alerts'
  ) THEN
    CREATE POLICY "Allow trigger inserts for admin alerts"
    ON admin_alerts
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;