-- Create table for chatbot preferences
CREATE TABLE public.chatbot_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position JSONB DEFAULT '{"x": 0, "y": 0}'::jsonb,
  size JSONB DEFAULT '{"width": 400, "height": 600}'::jsonb,
  snap_sensitivity INTEGER DEFAULT 50,
  pinned_actions JSONB DEFAULT '[]'::jsonb,
  view_mode TEXT DEFAULT 'full',
  auto_collapse_enabled BOOLEAN DEFAULT true,
  auto_collapse_duration INTEGER DEFAULT 30,
  sound_mute BOOLEAN DEFAULT false,
  custom_sounds JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.chatbot_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view own chatbot preferences"
ON public.chatbot_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own chatbot preferences"
ON public.chatbot_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own chatbot preferences"
ON public.chatbot_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete own chatbot preferences"
ON public.chatbot_preferences
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_chatbot_preferences_updated_at
BEFORE UPDATE ON public.chatbot_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();