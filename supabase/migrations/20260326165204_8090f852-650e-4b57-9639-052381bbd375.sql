
CREATE TABLE IF NOT EXISTS public.astra_platform_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_status text NOT NULL DEFAULT 'unknown',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_astra_platform_metrics_key ON public.astra_platform_metrics (metric_key, recorded_at DESC);

ALTER TABLE public.astra_platform_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read platform metrics"
  ON public.astra_platform_metrics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert platform metrics"
  ON public.astra_platform_metrics FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_latest_platform_metrics()
RETURNS SETOF public.astra_platform_metrics
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT ON (metric_key) *
  FROM public.astra_platform_metrics
  ORDER BY metric_key, recorded_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_platform_metric_trends(p_metric_key text, p_limit int DEFAULT 30)
RETURNS SETOF public.astra_platform_metrics
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM public.astra_platform_metrics
  WHERE metric_key = p_metric_key
  ORDER BY recorded_at DESC
  LIMIT p_limit;
$$;
