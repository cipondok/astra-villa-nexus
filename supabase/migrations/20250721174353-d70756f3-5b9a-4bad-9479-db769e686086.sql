-- Create live chat sessions table
CREATE TABLE IF NOT EXISTS public.live_chat_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID,
    agent_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'closed', 'transferred')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    subject TEXT,
    customer_name TEXT,
    customer_email TEXT,
    waiting_time INTEGER DEFAULT 0,
    is_online BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live chat messages table
CREATE TABLE IF NOT EXISTS public.live_chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.live_chat_sessions(id) ON DELETE CASCADE,
    sender_user_id UUID REFERENCES auth.users(id),
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system')),
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for live_chat_sessions
CREATE POLICY "Customer service agents can view all chat sessions" 
ON public.live_chat_sessions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('customer_service', 'admin')
    )
);

CREATE POLICY "Customer service agents can update assigned sessions" 
ON public.live_chat_sessions FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('customer_service', 'admin')
    )
);

CREATE POLICY "Customer service agents can create sessions" 
ON public.live_chat_sessions FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('customer_service', 'admin')
    )
);

-- Create policies for live_chat_messages
CREATE POLICY "Customer service agents can view all chat messages" 
ON public.live_chat_messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('customer_service', 'admin')
    )
);

CREATE POLICY "Customer service agents can insert messages" 
ON public.live_chat_messages FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('customer_service', 'admin')
    )
);

CREATE POLICY "Customer service agents can update messages" 
ON public.live_chat_messages FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('customer_service', 'admin')
    )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_live_chat_sessions_updated_at
    BEFORE UPDATE ON public.live_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_status ON public.live_chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_agent_id ON public.live_chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_created_at ON public.live_chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_session_id ON public.live_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_created_at ON public.live_chat_messages(created_at);

-- Add realtime publication for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;