-- Security fix for live_chat_sessions table
-- Enable RLS if not already enabled and ensure proper access control

-- First, ensure RLS is enabled on the table
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Drop any potentially problematic policies and recreate them securely
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON public.live_chat_sessions;
DROP POLICY IF EXISTS "CS agents can update chat sessions" ON public.live_chat_sessions;
DROP POLICY IF EXISTS "CS agents can view all chat sessions" ON public.live_chat_sessions;

-- Allow anyone (including anonymous users) to create chat sessions for customer support
CREATE POLICY "public_can_create_chat_sessions" 
ON public.live_chat_sessions 
FOR INSERT 
TO public
WITH CHECK (true);

-- Only CS agents and admins can view chat sessions
CREATE POLICY "cs_agents_can_view_all_sessions" 
ON public.live_chat_sessions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'customer_service')
  )
);

-- Only CS agents and admins can update chat sessions
CREATE POLICY "cs_agents_can_update_sessions" 
ON public.live_chat_sessions 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'customer_service')
  )
);

-- Allow customers to view their own chat sessions if they're authenticated
CREATE POLICY "customers_can_view_own_sessions" 
ON public.live_chat_sessions 
FOR SELECT 
TO authenticated
USING (customer_user_id = auth.uid());

-- Verify the policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'live_chat_sessions';