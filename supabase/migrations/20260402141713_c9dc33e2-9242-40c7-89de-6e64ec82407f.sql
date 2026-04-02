
-- =============================================
-- 1. Fix permissive UPDATE policies (authenticated users can update ANY row)
-- =============================================

-- ai_signals: restrict UPDATE to admin/super_admin
DROP POLICY IF EXISTS "Auth update ai_signals" ON public.ai_signals;
CREATE POLICY "Admin update ai_signals" ON public.ai_signals FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

-- ai_surface_rules: restrict UPDATE to admin/super_admin
DROP POLICY IF EXISTS "Auth update ai_surface_rules" ON public.ai_surface_rules;
CREATE POLICY "Admin update ai_surface_rules" ON public.ai_surface_rules FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

-- ai_tasks: restrict UPDATE to admin/super_admin
DROP POLICY IF EXISTS "Auth update ai_tasks" ON public.ai_tasks;
CREATE POLICY "Admin update ai_tasks" ON public.ai_tasks FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

-- founder_alerts: restrict UPDATE to admin/super_admin
DROP POLICY IF EXISTS "Update founder_alerts" ON public.founder_alerts;
CREATE POLICY "Admin update founder_alerts" ON public.founder_alerts FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

-- =============================================
-- 2. Fix mutable search_path on all 38 public functions
-- =============================================

ALTER FUNCTION public.emit_phes_automation_signal() SET search_path = public;
ALTER FUNCTION public.fn_afiba_governance_alert() SET search_path = public;
ALTER FUNCTION public.fn_amda_threat_signal() SET search_path = public;
ALTER FUNCTION public.fn_ceos_equilibrium_alert() SET search_path = public;
ALTER FUNCTION public.fn_ckper_phase_dominant() SET search_path = public;
ALTER FUNCTION public.fn_cmpc_sentiment_alert() SET search_path = public;
ALTER FUNCTION public.fn_giws_readiness_alert() SET search_path = public;
ALTER FUNCTION public.fn_gmma_fortress_moat() SET search_path = public;
ALTER FUNCTION public.fn_gpewm_immediate_entry() SET search_path = public;
ALTER FUNCTION public.fn_gpws_momentum_signal() SET search_path = public;
ALTER FUNCTION public.fn_hawce_synergy_milestone() SET search_path = public;
ALTER FUNCTION public.fn_icd_churn_alert() SET search_path = public;
ALTER FUNCTION public.fn_icta_trust_signal() SET search_path = public;
ALTER FUNCTION public.fn_ipoex_milestone_alert() SET search_path = public;
ALTER FUNCTION public.fn_ivms_momentum_signal() SET search_path = public;
ALTER FUNCTION public.fn_mcbm_blitz_signal() SET search_path = public;
ALTER FUNCTION public.fn_mpeem_frontier_breakthrough() SET search_path = public;
ALTER FUNCTION public.fn_mrde_tipping_point() SET search_path = public;
ALTER FUNCTION public.fn_newf_gravity_signal() SET search_path = public;
ALTER FUNCTION public.fn_pmlg_loop_signal() SET search_path = public;
ALTER FUNCTION public.fn_pmne_flagship_signal() SET search_path = public;
ALTER FUNCTION public.fn_ppop_prosperity_acceleration() SET search_path = public;
ALTER FUNCTION public.notify_ahcss_copilot_autonomous() SET search_path = public;
ALTER FUNCTION public.notify_fcss_control_alert() SET search_path = public;
ALTER FUNCTION public.notify_fspcm_exponential_power() SET search_path = public;
ALTER FUNCTION public.notify_fycs_megacity_formation() SET search_path = public;
ALTER FUNCTION public.notify_geiti_window_peak() SET search_path = public;
ALTER FUNCTION public.notify_gvem_milestone() SET search_path = public;
ALTER FUNCTION public.notify_hycb_autonomous_city() SET search_path = public;
ALTER FUNCTION public.notify_mfcb_fund_milestone() SET search_path = public;
ALTER FUNCTION public.notify_pesa_critical_volatility() SET search_path = public;
ALTER FUNCTION public.trg_acecm_self_sustaining() SET search_path = public;
ALTER FUNCTION public.trg_expansion_breakout_signal() SET search_path = public;
ALTER FUNCTION public.trg_gpids_window_open() SET search_path = public;
ALTER FUNCTION public.trg_gpla_irreplaceable() SET search_path = public;
ALTER FUNCTION public.trg_psnem_tipping_reached() SET search_path = public;
ALTER FUNCTION public.trg_swfps_partnership_advance() SET search_path = public;
ALTER FUNCTION public.trg_umtcs_cycle_transition() SET search_path = public;
