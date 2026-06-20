
CREATE TABLE IF NOT EXISTS public.sitemap_cache (
  file_name TEXT PRIMARY KEY,
  xml TEXT NOT NULL,
  url_count INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sitemap_cache TO anon;
GRANT SELECT ON public.sitemap_cache TO authenticated;
GRANT ALL ON public.sitemap_cache TO service_role;

ALTER TABLE public.sitemap_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sitemap cache is publicly readable" ON public.sitemap_cache;
CREATE POLICY "Sitemap cache is publicly readable"
  ON public.sitemap_cache FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.reschedule_sitemap_job(cron_expression TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron, extensions
AS $$
DECLARE
  job_name TEXT := 'regenerate-sitemap-job';
  fn_url TEXT := 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/regenerate-sitemap';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk';
  sql_body TEXT;
BEGIN
  IF cron_expression !~ '^(\S+\s+){4}\S+$' THEN
    RAISE EXCEPTION 'Invalid cron expression: %', cron_expression;
  END IF;

  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = job_name;

  sql_body := format(
    $cmd$select net.http_post(url:=%L, headers:=%L::jsonb, body:=%L::jsonb) as request_id;$cmd$,
    fn_url,
    json_build_object(
      'Content-Type', 'application/json',
      'apikey', anon_key,
      'Authorization', 'Bearer ' || anon_key,
      'x-sitemap-cron', 'true'
    )::text,
    json_build_object('source', 'pg_cron')::text
  );

  PERFORM cron.schedule(job_name, cron_expression, sql_body);

  RETURN cron_expression;
END;
$$;

REVOKE ALL ON FUNCTION public.reschedule_sitemap_job(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_sitemap_job(TEXT) TO service_role;
