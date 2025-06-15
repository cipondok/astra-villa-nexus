
CREATE TABLE public.live_chat_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'pending'::text, -- pending, active, closed
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    topic text
);

CREATE TABLE public.live_chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES public.live_chat_sessions(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX ON public.live_chat_sessions (customer_id);
CREATE INDEX ON public.live_chat_sessions (agent_id);
CREATE INDEX ON public.live_chat_sessions (status);
CREATE INDEX ON public.live_chat_messages (session_id);
CREATE INDEX ON public.live_chat_messages (sender_id);

-- RLS for sessions
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own chat sessions"
  ON public.live_chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can view their own chat sessions"
  ON public.live_chat_sessions FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Support team can view all chat sessions"
  ON public.live_chat_sessions FOR SELECT
  USING (public.is_authorized_support_user());
  
CREATE POLICY "Support team can update chat sessions"
  ON public.live_chat_sessions FOR UPDATE
  USING (public.is_authorized_support_user());

-- RLS for messages
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send messages in their sessions"
  ON public.live_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    session_id IN (SELECT id FROM public.live_chat_sessions WHERE customer_id = auth.uid())
  );

CREATE POLICY "Users can view messages in their sessions"
  ON public.live_chat_messages FOR SELECT
  USING (
    session_id IN (SELECT id FROM public.live_chat_sessions WHERE customer_id = auth.uid())
  );

CREATE POLICY "Support team can send messages in any session"
  ON public.live_chat_messages FOR INSERT
  WITH CHECK (
    public.is_authorized_support_user() AND auth.uid() = sender_id
  );
  
CREATE POLICY "Support team can view all messages"
  ON public.live_chat_messages FOR SELECT
  USING (public.is_authorized_support_user());

-- Enable realtime
ALTER TABLE public.live_chat_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.live_chat_messages REPLICA IDENTITY FULL;

alter publication supabase_realtime add table public.live_chat_sessions;
alter publication supabase_realtime add table public.live_chat_messages;
