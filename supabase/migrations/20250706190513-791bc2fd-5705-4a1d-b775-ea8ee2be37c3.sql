-- Create live chat tables
CREATE TABLE public.live_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_user_id UUID,
  customer_name TEXT NOT NULL DEFAULT 'Anonymous Customer',
  customer_email TEXT,
  agent_user_id UUID,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'resolved', 'abandoned')),
  subject TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  customer_ip INET,
  user_agent TEXT,
  referrer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.live_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.live_chat_sessions(id) ON DELETE CASCADE,
  sender_user_id UUID,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.live_chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.live_chat_sessions(id) ON DELETE CASCADE,
  user_id UUID,
  participant_type TEXT NOT NULL CHECK (participant_type IN ('customer', 'agent')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_participants ENABLE ROW LEVEL SECURITY;

-- Policies for live_chat_sessions
CREATE POLICY "CS agents can view all chat sessions" 
ON public.live_chat_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  )
);

CREATE POLICY "CS agents can update chat sessions" 
ON public.live_chat_sessions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  )
);

CREATE POLICY "Anyone can create chat sessions" 
ON public.live_chat_sessions 
FOR INSERT 
WITH CHECK (true);

-- Policies for live_chat_messages
CREATE POLICY "CS agents can view all chat messages" 
ON public.live_chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  )
);

CREATE POLICY "Anyone can create chat messages" 
ON public.live_chat_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "CS agents can update message read status" 
ON public.live_chat_messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  )
);

-- Policies for live_chat_participants
CREATE POLICY "CS agents can view all chat participants" 
ON public.live_chat_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  )
);

CREATE POLICY "Anyone can create chat participants" 
ON public.live_chat_participants 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "CS agents can update participant status" 
ON public.live_chat_participants 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  )
);

-- Create indexes for better performance
CREATE INDEX idx_live_chat_sessions_status ON public.live_chat_sessions(status);
CREATE INDEX idx_live_chat_sessions_agent ON public.live_chat_sessions(agent_user_id);
CREATE INDEX idx_live_chat_sessions_started_at ON public.live_chat_sessions(started_at);
CREATE INDEX idx_live_chat_messages_session_id ON public.live_chat_messages(session_id);
CREATE INDEX idx_live_chat_messages_created_at ON public.live_chat_messages(created_at);
CREATE INDEX idx_live_chat_participants_session_id ON public.live_chat_participants(session_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_live_chat_sessions_updated_at
BEFORE UPDATE ON public.live_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_participants;