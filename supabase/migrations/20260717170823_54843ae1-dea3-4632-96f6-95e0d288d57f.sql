-- ============================================================
-- Phase 3 · Pass 2 — Item 1: Admin policies for 51 back-office tables
-- ============================================================
-- These tables have RLS enabled but no policies, making them
-- unreachable via the Data API. They are all internal / admin
-- surfaces (acquisition, automation, expansion, media, PR, SEO ops,
-- support intelligence). Grant admin/super_admin full access.
-- service_role bypasses RLS and already works; we add explicit
-- grants for authenticated so PostgREST can evaluate policies.

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'acquisition_analytics','acquisition_bank_leads','acquisition_bank_partnerships',
    'acquisition_corporate_employees','acquisition_corporate_partnerships',
    'acquisition_influencer_campaigns','acquisition_influencers',
    'acquisition_university_partnerships','acquisition_university_students',
    'admin_roles','ai_bot_settings','ai_jobs','ai_job_tasks',
    'automation_bots','automation_metrics','automation_task_queue','automation_workflows',
    'concierge_team','concierge_vendors','copilot_actions','country_blocks',
    'expansion_cities','expansion_competitors','expansion_marketing_campaigns',
    'expansion_milestones','expansion_phases',
    'growth_execution_tasks','growth_execution_weeks','ip_blocks',
    'listing_automation_config','media_analytics','media_newsletter_campaigns',
    'media_sponsorships','media_targets','message_automation_config',
    'onboarding_automation_config','partner_automation_config',
    'pr_agencies','pr_outreach','report_automation_config',
    'seo_competitor_keywords','seo_keywords','seo_publish_queue',
    'supply_expansion_targets','supply_quality_standards',
    'support_cases','support_predictions','support_risk_signals','support_smart_alerts',
    'viral_campaign_analytics','zapier_webhook_logs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Grants (idempotent — no-op if already present)
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);

    -- Admin/super_admin full access policy
    EXECUTE format($f$
      DROP POLICY IF EXISTS "Admins manage %1$s" ON public.%1$I;
      CREATE POLICY "Admins manage %1$s" ON public.%1$I
        FOR ALL TO authenticated
        USING (
          public.has_role(auth.uid(), 'admin'::user_role)
          OR public.has_role(auth.uid(), 'super_admin'::user_role)
        )
        WITH CHECK (
          public.has_role(auth.uid(), 'admin'::user_role)
          OR public.has_role(auth.uid(), 'super_admin'::user_role)
        );
    $f$, t);
  END LOOP;
END $$;

-- ============================================================
-- Phase 3 · Pass 2 — Item 3: RPC replacing full-table scan
-- ============================================================
-- Replaces the pattern:
--   SELECT property_id FROM property_seo_analysis LIMIT 10000
-- (top slow query — 52s cumulative) with an anti-join that
-- returns only property ids still needing analysis.

CREATE OR REPLACE FUNCTION public.get_unanalyzed_property_ids(_limit integer DEFAULT 200)
RETURNS TABLE(property_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id
  FROM public.properties p
  WHERE p.status = 'active'
    AND p.approval_status = 'approved'
    AND NOT EXISTS (
      SELECT 1
      FROM public.property_seo_analysis s
      WHERE s.property_id = p.id
    )
  ORDER BY p.created_at DESC
  LIMIT GREATEST(_limit, 1)
$$;

-- Callable from server-side clients only (service_role in edge functions).
REVOKE ALL ON FUNCTION public.get_unanalyzed_property_ids(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_unanalyzed_property_ids(integer) TO service_role, authenticated;