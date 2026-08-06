CREATE TABLE public.social_share_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN ('share_click','share_visit')),
  channel text,
  path text NOT NULL,
  route_pattern text NOT NULL,
  property_id uuid,
  canonical_url text,
  og_url text,
  referrer text,
  referrer_host text,
  referrer_source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  session_id text,
  user_id uuid,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.social_share_events TO anon;
GRANT INSERT, SELECT ON public.social_share_events TO authenticated;
GRANT ALL ON public.social_share_events TO service_role;

ALTER TABLE public.social_share_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record share events"
ON public.social_share_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read share events"
ON public.social_share_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::user_role) OR public.has_role(auth.uid(), 'super_admin'::user_role));

CREATE INDEX idx_social_share_events_created_at ON public.social_share_events (created_at DESC);
CREATE INDEX idx_social_share_events_type_created ON public.social_share_events (event_type, created_at DESC);
CREATE INDEX idx_social_share_events_property ON public.social_share_events (property_id);