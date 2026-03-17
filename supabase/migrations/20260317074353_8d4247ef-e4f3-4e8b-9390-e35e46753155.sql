
-- Legal service types enum
CREATE TYPE public.legal_service_type AS ENUM (
  'shm_processing',
  'ajb_ppjb_documentation',
  'balik_nama',
  'certificate_verification',
  'tax_consultation'
);

-- Legal request status enum
CREATE TYPE public.legal_request_status AS ENUM (
  'request_received',
  'document_review',
  'fee_quotation',
  'awaiting_payment',
  'processing',
  'completed',
  'cancelled'
);

-- Legal service requests table
CREATE TABLE public.legal_service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_number TEXT NOT NULL DEFAULT ('LEG-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0')),
  service_type legal_service_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_address TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  status legal_request_status NOT NULL DEFAULT 'request_received',
  assigned_consultant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_consultant_name TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  fee_amount NUMERIC,
  fee_currency TEXT DEFAULT 'IDR',
  fee_approved_at TIMESTAMPTZ,
  fee_approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  admin_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Legal service documents
CREATE TABLE public.legal_service_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.legal_service_requests(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Legal service activity timeline
CREATE TABLE public.legal_service_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.legal_service_requests(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.legal_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_service_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_service_timeline ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own legal requests"
  ON public.legal_service_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create legal requests
CREATE POLICY "Users can create legal requests"
  ON public.legal_service_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own requests (for fee approval)
CREATE POLICY "Users can update own legal requests"
  ON public.legal_service_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Documents: users can view docs for their own requests
CREATE POLICY "Users can view own request documents"
  ON public.legal_service_documents FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.legal_service_requests r
    WHERE r.id = request_id AND r.user_id = auth.uid()
  ));

-- Documents: users can upload docs to their own requests
CREATE POLICY "Users can upload documents to own requests"
  ON public.legal_service_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM public.legal_service_requests r
      WHERE r.id = request_id AND r.user_id = auth.uid()
    )
  );

-- Timeline: users can view timeline for their own requests
CREATE POLICY "Users can view own request timeline"
  ON public.legal_service_timeline FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.legal_service_requests r
    WHERE r.id = request_id AND r.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_legal_requests_user ON public.legal_service_requests(user_id);
CREATE INDEX idx_legal_requests_status ON public.legal_service_requests(status);
CREATE INDEX idx_legal_documents_request ON public.legal_service_documents(request_id);
CREATE INDEX idx_legal_timeline_request ON public.legal_service_timeline(request_id);

-- Auto-insert timeline entry on status change
CREATE OR REPLACE FUNCTION public.legal_request_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.legal_service_timeline (request_id, action, description)
    VALUES (NEW.id, 'status_change', 'Status berubah dari ' || OLD.status || ' ke ' || NEW.status);
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_legal_request_status_change
  BEFORE UPDATE ON public.legal_service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.legal_request_status_change();

-- Auto-insert timeline entry on creation
CREATE OR REPLACE FUNCTION public.legal_request_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.legal_service_timeline (request_id, action, description, performed_by)
  VALUES (NEW.id, 'request_created', 'Permintaan layanan legal telah dibuat', NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_legal_request_created
  AFTER INSERT ON public.legal_service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.legal_request_created();

-- Storage bucket for legal documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('legal-documents', 'legal-documents', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload legal documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'legal-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own legal documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'legal-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
