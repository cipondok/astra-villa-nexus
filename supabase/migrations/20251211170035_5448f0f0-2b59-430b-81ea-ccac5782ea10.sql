-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own chatbot preferences" ON public.chatbot_preferences;
DROP POLICY IF EXISTS "Users can insert their own chatbot preferences" ON public.chatbot_preferences;
DROP POLICY IF EXISTS "Users can update their own chatbot preferences" ON public.chatbot_preferences;
DROP POLICY IF EXISTS "Users can delete their own chatbot preferences" ON public.chatbot_preferences;

-- Enable RLS if not already enabled
ALTER TABLE public.chatbot_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for chatbot_preferences
CREATE POLICY "Users can view their own chatbot preferences" 
ON public.chatbot_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chatbot preferences" 
ON public.chatbot_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatbot preferences" 
ON public.chatbot_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chatbot preferences" 
ON public.chatbot_preferences 
FOR DELETE 
USING (auth.uid() = user_id);