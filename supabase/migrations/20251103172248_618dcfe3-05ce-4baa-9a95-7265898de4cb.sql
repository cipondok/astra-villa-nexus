-- Create table for AI message reaction feedback
CREATE TABLE IF NOT EXISTS public.ai_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  conversation_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_content TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('positive', 'negative')),
  property_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_ai_message_reactions_user_id ON public.ai_message_reactions(user_id);
CREATE INDEX idx_ai_message_reactions_reaction_type ON public.ai_message_reactions(reaction_type);
CREATE INDEX idx_ai_message_reactions_created_at ON public.ai_message_reactions(created_at DESC);
CREATE INDEX idx_ai_message_reactions_conversation_id ON public.ai_message_reactions(conversation_id);

-- Enable Row Level Security
ALTER TABLE public.ai_message_reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.ai_message_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.ai_message_reactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can insert feedback (without user_id)
CREATE POLICY "Anonymous users can insert feedback"
  ON public.ai_message_reactions
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Policy: Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
  ON public.ai_message_reactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Create a view for reaction analytics
CREATE OR REPLACE VIEW public.ai_reaction_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  reaction_type,
  COUNT(*) as reaction_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT conversation_id) as unique_conversations
FROM public.ai_message_reactions
GROUP BY DATE_TRUNC('day', created_at), reaction_type
ORDER BY date DESC;

-- Grant access to the view
GRANT SELECT ON public.ai_reaction_analytics TO authenticated;