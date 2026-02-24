
-- Conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  last_message_preview TEXT,
  buyer_unread_count INTEGER DEFAULT 0,
  agent_unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id, buyer_id, agent_id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversation policies: participants only
CREATE POLICY "Participants can view conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = agent_id);

CREATE POLICY "Buyers can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = agent_id);

-- Message policies: conversation participants only
CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

CREATE POLICY "Participants can update messages" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

-- Indexes
CREATE INDEX idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX idx_conversations_property_id ON public.conversations(property_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Enable realtime on messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
