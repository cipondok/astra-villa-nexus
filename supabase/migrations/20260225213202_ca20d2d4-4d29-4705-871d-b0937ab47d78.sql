
-- Create rental documents table
CREATE TABLE public.rental_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.rental_bookings(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  document_type TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  requires_signature BOOLEAN NOT NULL DEFAULT false,
  signed_by UUID REFERENCES auth.users(id),
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_rental_documents_booking ON public.rental_documents(booking_id);

ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

-- Participants can view documents
CREATE POLICY "Booking participants can view documents"
  ON public.rental_documents FOR SELECT
  TO authenticated
  USING (public.is_booking_participant(auth.uid(), booking_id));

-- Participants can upload documents
CREATE POLICY "Booking participants can upload documents"
  ON public.rental_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND public.is_booking_participant(auth.uid(), booking_id)
  );

-- Participants can update documents (for signing)
CREATE POLICY "Booking participants can update documents"
  ON public.rental_documents FOR UPDATE
  TO authenticated
  USING (public.is_booking_participant(auth.uid(), booking_id));

-- Uploader can delete own documents
CREATE POLICY "Uploaders can delete own documents"
  ON public.rental_documents FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Create storage bucket for rental documents
INSERT INTO storage.buckets (id, name, public) VALUES ('rental-documents', 'rental-documents', false);

-- Storage RLS: authenticated users can upload
CREATE POLICY "Authenticated users can upload rental docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'rental-documents');

-- Storage RLS: authenticated users can read their booking docs
CREATE POLICY "Authenticated users can read rental docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'rental-documents');

-- Storage RLS: users can delete own uploads
CREATE POLICY "Users can delete own rental docs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'rental-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
