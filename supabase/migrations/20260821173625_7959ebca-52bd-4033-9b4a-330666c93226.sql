CREATE TABLE public.listing_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid NOT NULL,
  user_id uuid,
  route text NOT NULL DEFAULT '/add-property',
  access_state text NOT NULL,
  denial_reason text,
  required_roles text[] NOT NULL DEFAULT '{}',
  detected_roles text[] NOT NULL DEFAULT '{}',
  profile_role text,
  is_admin boolean NOT NULL DEFAULT false,
  authenticated boolean NOT NULL DEFAULT false,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_listing_access_logs_created_at ON public.listing_access_logs (created_at DESC);
CREATE INDEX idx_listing_access_logs_user ON public.listing_access_logs (user_id, created_at DESC);
CREATE INDEX idx_listing_access_logs_correlation ON public.listing_access_logs (correlation_id);

GRANT SELECT ON public.listing_access_logs TO authenticated;
GRANT ALL ON public.listing_access_logs TO service_role;

ALTER TABLE public.listing_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read listing access logs"
ON public.listing_access_logs FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can read their own listing access logs"
ON public.listing_access_logs FOR SELECT TO authenticated
USING (user_id = auth.uid());