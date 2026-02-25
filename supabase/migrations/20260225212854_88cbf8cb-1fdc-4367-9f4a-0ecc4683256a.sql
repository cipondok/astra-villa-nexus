
-- Create rental messages table for per-booking chat
CREATE TABLE public.rental_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.rental_bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups by booking
CREATE INDEX idx_rental_messages_booking_id ON public.rental_messages(booking_id);
CREATE INDEX idx_rental_messages_created_at ON public.rental_messages(booking_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.rental_messages ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is a participant in the booking
CREATE OR REPLACE FUNCTION public.is_booking_participant(_user_id UUID, _booking_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM rental_bookings rb
    JOIN properties p ON p.id = rb.property_id
    WHERE rb.id = _booking_id
      AND (
        rb.customer_id = _user_id
        OR rb.agent_id = _user_id
        OR p.owner_id = _user_id
      )
  )
$$;

-- RLS: participants can read messages
CREATE POLICY "Booking participants can read messages"
  ON public.rental_messages FOR SELECT
  TO authenticated
  USING (public.is_booking_participant(auth.uid(), booking_id));

-- RLS: participants can send messages (sender must be self)
CREATE POLICY "Booking participants can send messages"
  ON public.rental_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_booking_participant(auth.uid(), booking_id)
  );

-- RLS: sender can update own messages (mark read, etc.)
CREATE POLICY "Users can update own messages"
  ON public.rental_messages FOR UPDATE
  TO authenticated
  USING (public.is_booking_participant(auth.uid(), booking_id));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_messages;
