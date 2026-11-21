-- Helper functions (avoid policy recursion between vendor tables)
CREATE OR REPLACE FUNCTION public.is_service_request_owner(_request_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.vendor_service_requests r WHERE r.id = _request_id AND r.requested_by = auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.is_vendor_on_request(_request_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.vendor_job_assignments a WHERE a.request_id = _request_id AND a.vendor_id = auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.can_owner_view_tenant_file(_name text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_documents td JOIN public.properties p ON p.id = td.property_id
    WHERE p.owner_id = auth.uid() AND td.file_url LIKE '%/tenant-documents/' || _name
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_service_request_owner(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_vendor_on_request(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_owner_view_tenant_file(text) FROM anon;
ALTER TABLE public.property_survey_bookings ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.property_survey_bookings ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.mortgage_inquiries ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.media_event_registrations ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.seo_internal_searches ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.customer_support_tickets ALTER COLUMN customer_id SET DEFAULT auth.uid();
ALTER TABLE public.feedback_monitoring ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.mortgage_simulations ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.tour_analytics ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.media_newsletter_subscribers ALTER COLUMN user_id SET DEFAULT auth.uid();
-- Replace open "read everything" rules with admin-only reads on internal / platform tables
DO $mig$
DECLARE r record; skip_tables text[] := ARRAY['agent_blocked_dates','ai_investment_recommendations','article_comments','article_likes','article_ratings','community_leaderboard','document_requirements','filter_sequences','filter_usage','hedging_downside_protection','hedging_macro_risk','hedging_portfolio_exposure','hedging_safe_havens','hedging_strategies','indonesian_rejection_codes','investment_forecasts','investment_hotspots','investor_behavior_events','investor_credibility','investor_follows','investor_post_comments','investor_post_likes','launch_radar_alerts','launch_radar_demand_forecasts','launch_radar_developer_risks','launch_radar_developer_signals','launch_radar_price_predictions','liquidity_absorption','liquidity_crisis_resilience','liquidity_demand_elasticity','liquidity_exit_timing','liquidity_rental_stability','location_market_insights','ml_valuation_models','ml_valuation_predictions','portfolio_optimizer_allocations','portfolio_optimizer_diversification','portfolio_optimizer_performance','portfolio_optimizer_rebalancing','portfolio_optimizer_scenarios','property_deal_analysis','property_investment_scores','property_liquidity_scores','property_ratings','property_recommendations','property_roi_forecast','property_valuations','role_permissions','security_alerts','signup_conversion_events','smart_city_demographics','smart_city_districts','smart_city_infrastructure','smart_city_opportunities','smart_city_policies','stress_crisis_strategies','stress_portfolio_projections','stress_recovery_forecasts','stress_scenarios','stress_survival_scores','ugc_votes','user_badges','user_verifications','vendor_job_assignments','vendor_main_categories','vendor_metrics','vendor_service_categories','vendor_service_requests','vendor_subcategories'];
  skip_pairs text[] := ARRAY['ab_test_variants|Anyone can read active variants','agent_leaderboard_rewards|Public view leaderboard','ai_feature_dataset_exports|Allow service role_read','ai_model_training_logs|Allow service role_read','ai_prediction_accuracy|Allow service role_read','articles|Articles are viewable by everyone','badge_definitions|Anyone can read badge definitions','carousel_settings|Anyone can view carousel settings','city_network_density|Public read city_network_density','cwse_civilization_insight|anon_read_cwse_insight','cwse_generational_wealth|anon_read_cwse_generational','cwse_intervention_scenarios|anon_read_cwse_interventions','cwse_shock_absorption|anon_read_cwse_shock','cwse_structural_resilience|anon_read_cwse_resilience','disposable_email_domains|Anyone can read disposable domains','document_requirements|Public can view document requirements','flash_deals|Flash deals are publicly readable','global_regions|Authenticated read regions','location_price_trends|Anyone can read location price trends','locations|allow_public_read_locations','market_clusters|Allow authenticated read market_clusters','market_cycle_classifications|Authenticated read cycle data','market_demand_signals|Auth read demand signals','market_heat_clusters|Market heat clusters are publicly readable','market_liquidity_metrics|Authenticated users can read liquidity metrics','market_price_trends|Anyone can read market trends','market_story_signals|Authenticated users read market stories','market_story_signals|Service role manages market stories_read','market_trend_factors|Market trends are public','market_trends|Allow public read-only access on trends','mfcb_fund_structure|mfcb_fund_structure_read','mfcb_fund_thesis|mfcb_fund_thesis_read','mfcb_performance_flywheel|mfcb_flywheel_read','ml_valuation_city_stats|Authenticated read ml_valuation_city_stats','mobile_live_auctions|Auctions are publicly readable','mobile_live_auctions|Auctions viewable by all','platform_countries|Anyone can view countries','platform_countries|Service role manages countries_read','pmne_category_narrative|Auth read pmne_category_narrative','portal_tier_requirements|Authenticated users can read tier requirements','property_facilities|Anyone can view property facilities','property_rating_aggregates|Anyone can view rating aggregates','rental_market_insights|Anyone can read rental insights','user_activation_milestones|Service role can read all milestones'];
  tbls text[] := '{}';
BEGIN
  FOR r IN SELECT tablename, policyname FROM pg_policies
    WHERE schemaname='public' AND cmd='SELECT' AND qual IN ('true','(auth.uid() IS NOT NULL)')
      AND NOT (tablename = ANY(skip_tables)) AND NOT ((tablename||'|'||policyname) = ANY(skip_pairs))
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    IF NOT (r.tablename = ANY(tbls)) THEN tbls := tbls || r.tablename; END IF;
  END LOOP;
  FOR i IN 1..coalesce(array_length(tbls,1),0) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', left(tbls[i],45)||'_admin_read', tbls[i]);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_admin_user())', left(tbls[i],45)||'_admin_read', tbls[i]);
  END LOOP;
  RAISE NOTICE 'admin-only read applied to % tables', coalesce(array_length(tbls,1),0);
END $mig$;
DROP POLICY IF EXISTS "Allow read for all users on sequences" ON public.filter_sequences;
DROP POLICY IF EXISTS "filter_sequences_read_scoped" ON public.filter_sequences;
CREATE POLICY "filter_sequences_read_scoped" ON public.filter_sequences FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR public.is_admin_user());
DROP POLICY IF EXISTS "Allow read for all users" ON public.filter_usage;
DROP POLICY IF EXISTS "filter_usage_read_scoped" ON public.filter_usage;
CREATE POLICY "filter_usage_read_scoped" ON public.filter_usage FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR public.is_admin_user());
DROP POLICY IF EXISTS "Anyone can view public verification badges" ON public.user_verifications;
DROP POLICY IF EXISTS "user_verifications_read_scoped" ON public.user_verifications;
CREATE POLICY "user_verifications_read_scoped" ON public.user_verifications FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR public.is_admin_user());
DROP POLICY IF EXISTS "Service role manages alerts_read" ON public.security_alerts;
DROP POLICY IF EXISTS "security_alerts_read_scoped" ON public.security_alerts;
CREATE POLICY "security_alerts_read_scoped" ON public.security_alerts FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR public.is_admin_user());
DROP POLICY IF EXISTS "Admin read all behavior events" ON public.investor_behavior_events;
DROP POLICY IF EXISTS "investor_behavior_events_read_scoped" ON public.investor_behavior_events;
CREATE POLICY "investor_behavior_events_read_scoped" ON public.investor_behavior_events FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR public.is_admin_user());
DROP POLICY IF EXISTS "Admin read signup events" ON public.signup_conversion_events;
DROP POLICY IF EXISTS "signup_conversion_events_read_scoped" ON public.signup_conversion_events;
CREATE POLICY "signup_conversion_events_read_scoped" ON public.signup_conversion_events FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR public.is_admin_user());
DROP POLICY IF EXISTS "Authenticated users can read vendor metrics" ON public.vendor_metrics;
DROP POLICY IF EXISTS "Service role full access vendor_metrics_read" ON public.vendor_metrics;
DROP POLICY IF EXISTS "vendor_metrics_read_scoped" ON public.vendor_metrics;
CREATE POLICY "vendor_metrics_read_scoped" ON public.vendor_metrics FOR SELECT TO authenticated USING ((vendor_id = auth.uid()) OR public.is_admin_user());
DROP POLICY IF EXISTS "Authenticated users can read job assignments" ON public.vendor_job_assignments;
DROP POLICY IF EXISTS "Service role full access job_assignments_read" ON public.vendor_job_assignments;
DROP POLICY IF EXISTS "vendor_job_assignments_read_scoped" ON public.vendor_job_assignments;
CREATE POLICY "vendor_job_assignments_read_scoped" ON public.vendor_job_assignments FOR SELECT TO authenticated USING ((vendor_id = auth.uid()) OR public.is_admin_user() OR public.is_service_request_owner(request_id));
DROP POLICY IF EXISTS "Authenticated users can read service requests" ON public.vendor_service_requests;
DROP POLICY IF EXISTS "Service role full access service_requests_read" ON public.vendor_service_requests;
DROP POLICY IF EXISTS "vendor_service_requests_read_scoped" ON public.vendor_service_requests;
CREATE POLICY "vendor_service_requests_read_scoped" ON public.vendor_service_requests FOR SELECT TO authenticated USING ((requested_by = auth.uid()) OR (assigned_vendor_id = auth.uid()) OR public.is_admin_user() OR public.is_vendor_on_request(id));
DROP POLICY IF EXISTS "Public can view property valuations" ON public.property_valuations;
DROP POLICY IF EXISTS "property_valuations_read_scoped" ON public.property_valuations;
CREATE POLICY "property_valuations_read_scoped" ON public.property_valuations FOR SELECT TO authenticated USING ((requested_by = auth.uid()) OR public.is_admin_user() OR EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_valuations.property_id AND p.owner_id = auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view vendor main categories" ON public.vendor_main_categories;
DROP POLICY IF EXISTS "vendor_main_categories_read_scoped" ON public.vendor_main_categories;
CREATE POLICY "vendor_main_categories_read_scoped" ON public.vendor_main_categories FOR SELECT TO anon, authenticated USING ((is_active = true) OR public.is_admin_user());
DROP POLICY IF EXISTS "Authenticated users can view vendor subcategories" ON public.vendor_subcategories;
DROP POLICY IF EXISTS "vendor_subcategories_read_scoped" ON public.vendor_subcategories;
CREATE POLICY "vendor_subcategories_read_scoped" ON public.vendor_subcategories FOR SELECT TO anon, authenticated USING ((is_active = true) OR public.is_admin_user());
DROP POLICY IF EXISTS "Anyone can view service categories" ON public.vendor_service_categories;
DROP POLICY IF EXISTS "Authenticated users can view vendor categories" ON public.vendor_service_categories;
DROP POLICY IF EXISTS "vendor_service_categories_read_scoped" ON public.vendor_service_categories;
CREATE POLICY "vendor_service_categories_read_scoped" ON public.vendor_service_categories FOR SELECT TO anon, authenticated USING ((is_active = true) OR public.is_admin_user());
DROP POLICY IF EXISTS "Users can view rejection codes in context" ON public.indonesian_rejection_codes;
DROP POLICY IF EXISTS "indonesian_rejection_codes_read_scoped" ON public.indonesian_rejection_codes;
CREATE POLICY "indonesian_rejection_codes_read_scoped" ON public.indonesian_rejection_codes FOR SELECT TO authenticated USING (public.is_admin_user() OR public.has_role(auth.uid(), 'vendor'::public.user_role));
DROP POLICY IF EXISTS "authenticated_vendors_view_document_requirements" ON public.document_requirements;
DROP POLICY IF EXISTS "document_requirements_read_scoped" ON public.document_requirements;
CREATE POLICY "document_requirements_read_scoped" ON public.document_requirements FOR SELECT TO authenticated USING (public.is_admin_user() OR public.has_role(auth.uid(), 'vendor'::public.user_role));
DROP POLICY IF EXISTS "Allow secure ticket creation" ON public.customer_support_tickets;
CREATE POLICY "customer_support_tickets_insert_scoped" ON public.customer_support_tickets FOR INSERT TO authenticated WITH CHECK ((customer_id = auth.uid()));
DROP POLICY IF EXISTS "Allow public feedback submissions" ON public.feedback_monitoring;
CREATE POLICY "feedback_monitoring_insert_scoped" ON public.feedback_monitoring FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
DROP POLICY IF EXISTS "Authenticated can insert rank history" ON public.keyword_rank_history;
CREATE POLICY "keyword_rank_history_insert_scoped" ON public.keyword_rank_history FOR INSERT TO authenticated WITH CHECK (public.is_admin_user());
DROP POLICY IF EXISTS "Authenticated users can create chat sessions" ON public.live_chat_sessions;
CREATE POLICY "live_chat_sessions_insert_scoped" ON public.live_chat_sessions FOR INSERT TO authenticated WITH CHECK ((customer_user_id = auth.uid()) OR (agent_user_id = auth.uid()) OR public.is_admin_user());
DROP POLICY IF EXISTS "Anyone can register for events" ON public.media_event_registrations;
CREATE POLICY "media_event_registrations_insert_scoped" ON public.media_event_registrations FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can subscribe to newsletter" ON public.media_newsletter_subscribers;
CREATE POLICY "media_newsletter_subscribers_insert_scoped" ON public.media_newsletter_subscribers FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can create inquiries" ON public.mortgage_inquiries;
CREATE POLICY "mortgage_inquiries_insert_scoped" ON public.mortgage_inquiries FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can create preapproval requests" ON public.mortgage_preapproval_requests;
CREATE POLICY "mortgage_preapproval_requests_insert_scoped" ON public.mortgage_preapproval_requests FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
DROP POLICY IF EXISTS "Anyone can create simulations" ON public.mortgage_simulations;
CREATE POLICY "mortgage_simulations_insert_scoped" ON public.mortgage_simulations FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can insert SEO analysis" ON public.property_seo_analysis;
CREATE POLICY "property_seo_analysis_insert_scoped" ON public.property_seo_analysis FOR INSERT TO authenticated WITH CHECK (public.is_admin_user());
DROP POLICY IF EXISTS "Authenticated users can update SEO analysis" ON public.property_seo_analysis;
CREATE POLICY "property_seo_analysis_update_scoped" ON public.property_seo_analysis FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
DROP POLICY IF EXISTS "authenticated_users_can_create_survey_bookings" ON public.property_survey_bookings;
CREATE POLICY "property_survey_bookings_insert_scoped" ON public.property_survey_bookings FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can create valuations" ON public.property_valuations;
CREATE POLICY "property_valuations_insert_scoped" ON public.property_valuations FOR INSERT TO authenticated WITH CHECK (public.is_admin_user() OR EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_valuations.property_id AND p.owner_id = auth.uid()));
DROP POLICY IF EXISTS "Anyone can log searches" ON public.seo_internal_searches;
CREATE POLICY "seo_internal_searches_insert_scoped" ON public.seo_internal_searches FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can manage SEO trends" ON public.seo_trend_data;
CREATE POLICY "seo_trend_data_insert_scoped" ON public.seo_trend_data FOR INSERT TO authenticated WITH CHECK (public.is_admin_user());
DROP POLICY IF EXISTS "Authenticated users can update SEO trends" ON public.seo_trend_data;
CREATE POLICY "seo_trend_data_update_scoped" ON public.seo_trend_data FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
DROP POLICY IF EXISTS "Anyone can record share events" ON public.social_share_events;
CREATE POLICY "social_share_events_insert_scoped" ON public.social_share_events FOR INSERT TO anon, authenticated WITH CHECK (((user_id IS NULL) OR (user_id = auth.uid())));
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.tour_analytics;
CREATE POLICY "tour_analytics_insert_scoped" ON public.tour_analytics FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can create tour bookings" ON public.virtual_tour_bookings;
CREATE POLICY "virtual_tour_bookings_insert_scoped" ON public.virtual_tour_bookings FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
-- Storage: bind uploads/changes to the uploader's own folder
DROP POLICY IF EXISTS "Authenticated users can upload review photos to storage" ON storage.objects;
CREATE POLICY "Users upload own review photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-photos' AND (storage.foldername(name))[1] = (auth.uid())::text);
DROP POLICY IF EXISTS "Users can update their property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Platform admins manage property images insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images' AND public.is_admin_user());
CREATE POLICY "Platform admins manage property images update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-images' AND public.is_admin_user()) WITH CHECK (bucket_id = 'property-images' AND public.is_admin_user());
CREATE POLICY "Platform admins manage property images delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-images' AND public.is_admin_user());
DROP POLICY IF EXISTS "Authenticated users can upload checkin photos" ON storage.objects;
CREATE POLICY "Users upload own checkin photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'checkin-photos' AND (storage.foldername(name))[1] = (auth.uid())::text);
DROP POLICY IF EXISTS "Users can delete their own vendor assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own vendor assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vendor assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload inspection photos" ON storage.objects;
CREATE POLICY "Users upload own inspection photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inspection-photos' AND (storage.foldername(name))[1] = (auth.uid())::text);
CREATE POLICY "Users delete own inspection photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'inspection-photos' AND ((storage.foldername(name))[1] = (auth.uid())::text OR public.is_admin_user()));
DROP POLICY IF EXISTS "Owners can view tenant files" ON storage.objects;
CREATE POLICY "Property owners and admins view tenant files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'tenant-documents' AND (public.is_admin_user() OR public.can_owner_view_tenant_file(name)));
DROP POLICY IF EXISTS "Authenticated users can upload rental docs" ON storage.objects;
CREATE POLICY "Users upload own rental docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rental-documents' AND (storage.foldername(name))[1] = (auth.uid())::text);