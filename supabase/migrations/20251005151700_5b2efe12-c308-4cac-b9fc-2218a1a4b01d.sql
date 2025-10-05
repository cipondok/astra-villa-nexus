-- Fix user_login_alerts table to allow null user_id for failed login tracking
-- This allows tracking failed login attempts even when user_id is not available
ALTER TABLE user_login_alerts 
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment to explain why null is allowed
COMMENT ON COLUMN user_login_alerts.user_id IS 'User ID - can be null for failed login attempts where user is not identified';

-- Update RLS policies to handle null user_id cases
DROP POLICY IF EXISTS "users_view_own_login_alerts" ON user_login_alerts;
DROP POLICY IF EXISTS "admins_cs_view_login_alerts" ON user_login_alerts;

-- Recreate policies with null safety
CREATE POLICY "users_view_own_login_alerts" 
ON user_login_alerts 
FOR SELECT 
USING (
  user_id IS NOT NULL AND user_id = auth.uid()
);

CREATE POLICY "admins_cs_view_login_alerts" 
ON user_login_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'customer_service')
  )
);

-- Allow system to insert security alerts (including with null user_id)
CREATE POLICY "system_insert_login_alerts"
ON user_login_alerts
FOR INSERT
WITH CHECK (true);