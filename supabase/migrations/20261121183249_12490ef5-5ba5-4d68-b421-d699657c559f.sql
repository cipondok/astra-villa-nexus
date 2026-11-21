-- 1) Scheduler secret kept in vault, verifiable only by the service role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'edge_internal_cron_secret') THEN
    PERFORM vault.create_secret(
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      'edge_internal_cron_secret',
      'Shared secret proving a request comes from pg_cron'
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.verify_edge_cron_secret(p_secret text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_secret IS NOT NULL
     AND length(p_secret) >= 32
     AND EXISTS (
       SELECT 1 FROM vault.decrypted_secrets
       WHERE name = 'edge_internal_cron_secret' AND decrypted_secret = p_secret
     );
$$;
REVOKE ALL ON FUNCTION public.verify_edge_cron_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_edge_cron_secret(text) TO service_role;

-- Existing cron jobs keep their schedule; only the request headers change to include the secret.
DO $do$
DECLARE
  v_anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk';
  v_base text := 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/';
  r record;
  v_cmd text;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('process-email-queue', 'process-email-queue', '{}'),
      ('seo-auto-optimizer-6h', 'seo-scheduler', '{"mode": "auto", "threshold": 60, "limit": 50}'),
      ('regenerate-sitemap-job', 'regenerate-sitemap', '{"source": "pg_cron"}')
    ) AS t(jobname, fn, body)
  LOOP
    v_cmd := format(
      $f$SELECT net.http_post(url := %L, headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', %L, 'Authorization', %L, 'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_internal_cron_secret')), body := %L::jsonb) AS request_id;$f$,
      v_base || r.fn, v_anon, 'Bearer ' || v_anon, r.body
    );
    PERFORM cron.alter_job(j.jobid, command := v_cmd) FROM cron.job j WHERE j.jobname = r.jobname;
  END LOOP;
END
$do$;

-- Keep the sitemap re-scheduler consistent with the secret header
CREATE OR REPLACE FUNCTION public.reschedule_sitemap_job(cron_expression TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron, extensions
AS $$
DECLARE
  job_name TEXT := 'regenerate-sitemap-job';
  v_anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk';
  sql_body TEXT;
BEGIN
  IF cron_expression !~ '^(\S+\s+){4}\S+$' THEN
    RAISE EXCEPTION 'Invalid cron expression: %', cron_expression;
  END IF;

  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = job_name;

  sql_body := format(
    $f$SELECT net.http_post(url := %L, headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', %L, 'Authorization', %L, 'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_internal_cron_secret')), body := %L::jsonb) AS request_id;$f$,
    'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/regenerate-sitemap', v_anon, 'Bearer ' || v_anon, '{"source": "pg_cron"}'
  );

  PERFORM cron.schedule(job_name, cron_expression, sql_body);
  RETURN cron_expression;
END;
$$;
REVOKE ALL ON FUNCTION public.reschedule_sitemap_job(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_sitemap_job(TEXT) TO service_role;

-- 2) Server-only helpers
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;

REVOKE ALL ON FUNCTION public.acquire_batch_lock(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_batch_lock(text, integer) TO service_role;

-- 3) Trusted backend context (service role, or database-internal with no API JWT)
CREATE OR REPLACE FUNCTION private.is_trusted_backend()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
      OR (auth.uid() IS NULL AND COALESCE(auth.jwt() ->> 'role', '') = '');
$$;
REVOKE ALL ON FUNCTION private.is_trusted_backend() FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.admin_global_search(text, integer) SET SCHEMA private;
ALTER FUNCTION public.analyze_portfolio_strategy(uuid) SET SCHEMA private;
ALTER FUNCTION public.calculate_tenant_score(uuid) SET SCHEMA private;
ALTER FUNCTION public.award_xp(uuid, text, integer, text, uuid, text) SET SCHEMA private;
ALTER FUNCTION public.award_badge(uuid, text) SET SCHEMA private;
ALTER FUNCTION public.can_edit_profile(uuid) SET SCHEMA private;

REVOKE ALL ON FUNCTION private.admin_global_search(text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.analyze_portfolio_strategy(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.calculate_tenant_score(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.award_xp(uuid, text, integer, text, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.award_badge(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.can_edit_profile(uuid) FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.admin_global_search(p_query text, p_limit integer DEFAULT 8)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.is_admin_user() OR private.is_trusted_backend()) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  RETURN private.admin_global_search(left(coalesce(p_query, ''), 200), LEAST(GREATEST(coalesce(p_limit, 8), 1), 50));
END $$;

CREATE FUNCTION public.analyze_portfolio_strategy(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (p_user_id = auth.uid() OR public.is_admin_user() OR private.is_trusted_backend()) THEN
    RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
  END IF;
  RETURN private.analyze_portfolio_strategy(p_user_id);
END $$;

CREATE FUNCTION public.calculate_tenant_score(p_tenant_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    p_tenant_id = auth.uid()
    OR public.is_admin_user()
    OR private.is_trusted_backend()
    OR EXISTS (
      SELECT 1 FROM public.rental_bookings b
      LEFT JOIN public.properties p ON p.id = b.property_id
      WHERE b.customer_id = p_tenant_id
        AND (b.agent_id = auth.uid() OR p.owner_id = auth.uid())
    )
  ) THEN
    RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
  END IF;
  RETURN private.calculate_tenant_score(p_tenant_id);
END $$;

CREATE FUNCTION public.award_xp(p_user_id uuid, p_action_type text, p_xp_amount integer, p_description text DEFAULT NULL, p_reference_id uuid DEFAULT NULL, p_reference_type text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (p_user_id = auth.uid() OR public.is_admin_user() OR private.is_trusted_backend()) THEN
    RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
  END IF;
  RETURN private.award_xp(p_user_id, p_action_type, p_xp_amount, p_description, p_reference_id, p_reference_type);
END $$;

CREATE FUNCTION public.award_badge(p_user_id uuid, p_badge_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (p_user_id = auth.uid() OR public.is_admin_user() OR private.is_trusted_backend()) THEN
    RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
  END IF;
  RETURN private.award_badge(p_user_id, p_badge_key);
END $$;

CREATE FUNCTION public.can_edit_profile(user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (user_id = auth.uid() OR public.is_admin_user() OR private.is_trusted_backend()) THEN
    RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
  END IF;
  RETURN private.can_edit_profile(user_id);
END $$;

REVOKE ALL ON FUNCTION public.admin_global_search(text, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.analyze_portfolio_strategy(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.calculate_tenant_score(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.award_xp(uuid, text, integer, text, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.award_badge(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_edit_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_global_search(text, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.analyze_portfolio_strategy(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_tenant_score(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_xp(uuid, text, integer, text, uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_badge(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_edit_profile(uuid) TO authenticated, service_role;

-- 4) Internal AI/strategy tables: admin-only reads
DROP POLICY IF EXISTS "Allow service role_read" ON public.ai_feature_dataset_exports;
DROP POLICY IF EXISTS "Allow service role_read" ON public.ai_model_training_logs;
DROP POLICY IF EXISTS "Allow service role_read" ON public.ai_prediction_accuracy;
CREATE POLICY "Admins read dataset exports" ON public.ai_feature_dataset_exports FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "Admins read training logs" ON public.ai_model_training_logs FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "Admins read prediction accuracy" ON public.ai_prediction_accuracy FOR SELECT TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "anon_read_cwse_insight" ON public.cwse_civilization_insight;
DROP POLICY IF EXISTS "anon_read_cwse_generational" ON public.cwse_generational_wealth;
DROP POLICY IF EXISTS "anon_read_cwse_interventions" ON public.cwse_intervention_scenarios;
DROP POLICY IF EXISTS "anon_read_cwse_shock" ON public.cwse_shock_absorption;
DROP POLICY IF EXISTS "anon_read_cwse_resilience" ON public.cwse_structural_resilience;
CREATE POLICY "Admins read cwse insight" ON public.cwse_civilization_insight FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "Admins read cwse generational" ON public.cwse_generational_wealth FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "Admins read cwse interventions" ON public.cwse_intervention_scenarios FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "Admins read cwse shock" ON public.cwse_shock_absorption FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "Admins read cwse resilience" ON public.cwse_structural_resilience FOR SELECT TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "mfcb_fund_structure_read" ON public.mfcb_fund_structure;
DROP POLICY IF EXISTS "mfcb_fund_thesis_read" ON public.mfcb_fund_thesis;
DROP POLICY IF EXISTS "mfcb_flywheel_read" ON public.mfcb_performance_flywheel;
CREATE POLICY "Admins read mfcb fund structure" ON public.mfcb_fund_structure FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "Admins read mfcb fund thesis" ON public.mfcb_fund_thesis FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "Admins read mfcb flywheel" ON public.mfcb_performance_flywheel FOR SELECT TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "Authenticated read cycle data" ON public.market_cycle_classifications;
CREATE POLICY "Admins read cycle data" ON public.market_cycle_classifications FOR SELECT TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "Auth read demand signals" ON public.market_demand_signals;
CREATE POLICY "Admins read demand signals" ON public.market_demand_signals FOR SELECT TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "Authenticated users can read tier requirements" ON public.portal_tier_requirements;

DROP POLICY IF EXISTS "Public can view document requirements" ON public.document_requirements;

DROP POLICY IF EXISTS "Service role manages market stories_read" ON public.market_story_signals;

-- 5) Storage: public links keep working; listing limited to uploader and admins
DROP POLICY IF EXISTS "Authenticated can list vr-media" ON storage.objects;
DROP POLICY IF EXISTS "Hero banners are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read system assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can list checkin photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can list review photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for system assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can list inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can list vendor assets" ON storage.objects;

CREATE POLICY "Owners and admins can list public media"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id IN ('vr-media','hero-banners','avatars','property-images','system-assets','checkin-photos','review-photos','inspection-photos','vendor-assets')
  AND (owner_id = (auth.uid())::text OR public.is_admin_user())
);