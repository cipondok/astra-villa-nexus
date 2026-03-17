
-- Extend conversations to support multi-role messaging contexts
ALTER TABLE public.conversations 
  ADD COLUMN IF NOT EXISTS conversation_type text NOT NULL DEFAULT 'property',
  ADD COLUMN IF NOT EXISTS participant_role_a text DEFAULT 'buyer',
  ADD COLUMN IF NOT EXISTS participant_role_b text DEFAULT 'agent',
  ADD COLUMN IF NOT EXISTS service_booking_id uuid REFERENCES vendor_bookings(id),
  ADD COLUMN IF NOT EXISTS legal_case_id text;

-- Create index for new conversation types
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(conversation_type);

COMMENT ON COLUMN public.conversations.conversation_type IS 'property | rental | service | legal | general';
COMMENT ON COLUMN public.conversations.participant_role_a IS 'Role label for buyer_id participant';
COMMENT ON COLUMN public.conversations.participant_role_b IS 'Role label for agent_id participant';
