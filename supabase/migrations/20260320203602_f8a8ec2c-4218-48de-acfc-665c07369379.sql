
-- Vendor job routing tables

CREATE TABLE public.vendor_service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL, -- renovation, cleaning, legal, interior, furnishing
  title text NOT NULL,
  description text,
  location_lat double precision,
  location_lng double precision,
  district text,
  city text,
  budget_min numeric,
  budget_max numeric,
  urgency text NOT NULL DEFAULT 'normal', -- low, normal, high, critical
  status text NOT NULL DEFAULT 'pending', -- pending, assigned, in_progress, completed, cancelled
  assigned_vendor_id uuid,
  assigned_at timestamptz,
  completed_at timestamptz,
  sla_deadline_hours integer DEFAULT 24,
  escalation_count integer DEFAULT 0,
  admin_override boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  category text NOT NULL,
  avg_rating numeric DEFAULT 0,
  total_jobs_completed integer DEFAULT 0,
  total_jobs_assigned integer DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  avg_response_minutes numeric DEFAULT 0,
  avg_completion_hours numeric DEFAULT 0,
  price_competitiveness_score numeric DEFAULT 50, -- 0-100
  current_active_jobs integer DEFAULT 0,
  max_concurrent_jobs integer DEFAULT 5,
  location_lat double precision,
  location_lng double precision,
  service_radius_km numeric DEFAULT 25,
  is_available boolean DEFAULT true,
  last_job_at timestamptz,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, category)
);

CREATE TABLE public.vendor_job_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.vendor_service_requests(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL,
  routing_score numeric NOT NULL DEFAULT 0,
  rank integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'offered', -- offered, accepted, declined, expired, escalated
  offered_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  response_deadline timestamptz,
  decline_reason text,
  is_backup boolean DEFAULT false,
  routing_breakdown jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_vendor_service_requests_status ON public.vendor_service_requests(status);
CREATE INDEX idx_vendor_service_requests_category ON public.vendor_service_requests(category);
CREATE INDEX idx_vendor_metrics_vendor_category ON public.vendor_metrics(vendor_id, category);
CREATE INDEX idx_vendor_metrics_available ON public.vendor_metrics(is_available, category);
CREATE INDEX idx_vendor_job_assignments_request ON public.vendor_job_assignments(request_id);
CREATE INDEX idx_vendor_job_assignments_vendor ON public.vendor_job_assignments(vendor_id, status);

-- RLS
ALTER TABLE public.vendor_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_job_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read service requests" ON public.vendor_service_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert service requests" ON public.vendor_service_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "Service role full access service_requests" ON public.vendor_service_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read vendor metrics" ON public.vendor_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role full access vendor_metrics" ON public.vendor_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read job assignments" ON public.vendor_job_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role full access job_assignments" ON public.vendor_job_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);
