
-- Create table for AI conversations
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  function_call JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user interactions (for AI recommendations)
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  interaction_type TEXT NOT NULL,
  interaction_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for vendor services (if not exists)
CREATE TABLE IF NOT EXISTS public.vendor_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id),
  service_name TEXT NOT NULL,
  service_description TEXT,
  price NUMERIC(15,2),
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for ai_conversations
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" 
  ON public.ai_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
  ON public.ai_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for user_interactions
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interactions" 
  ON public.user_interactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions" 
  ON public.user_interactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for vendor_services
ALTER TABLE public.vendor_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active vendor services" 
  ON public.vendor_services 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Vendors can manage their own services" 
  ON public.vendor_services 
  FOR ALL 
  USING (auth.uid() = vendor_id);

-- Create indexes for better performance
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_conversation_id ON public.ai_conversations(conversation_id);
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_created_at ON public.user_interactions(created_at);
CREATE INDEX idx_vendor_services_vendor_id ON public.vendor_services(vendor_id);
CREATE INDEX idx_vendor_services_active ON public.vendor_services(is_active);
