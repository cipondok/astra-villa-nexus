
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT ALL ON public.newsletter_subscribers TO service_role;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users view own subscription" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users update own subscription" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users delete own subscription" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admins manage newsletter subscribers" ON public.newsletter_subscribers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Customers create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Customers update own orders" ON public.orders FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkin_checkout_records TO authenticated;
GRANT ALL ON public.checkin_checkout_records TO service_role;
CREATE POLICY "Performer manages own records" ON public.checkin_checkout_records FOR ALL TO authenticated USING (performed_by = auth.uid()) WITH CHECK (performed_by = auth.uid());
CREATE POLICY "Tenant views own records" ON public.checkin_checkout_records FOR SELECT TO authenticated USING (tenant_id = auth.uid());
CREATE POLICY "Property owner views records" ON public.checkin_checkout_records FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = checkin_checkout_records.property_id AND p.owner_id = auth.uid()));
CREATE POLICY "Admins manage checkin records" ON public.checkin_checkout_records FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspection_items TO authenticated;
GRANT ALL ON public.inspection_items TO service_role;
CREATE POLICY "Property owner views inspection items" ON public.inspection_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.property_inspections pi JOIN public.properties p ON p.id = pi.property_id WHERE pi.id = inspection_items.inspection_id AND p.owner_id = auth.uid()));
CREATE POLICY "Admins manage inspection items" ON public.inspection_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

GRANT SELECT ON public.ai_image_jobs TO authenticated;
GRANT ALL ON public.ai_image_jobs TO service_role;
CREATE POLICY "Property owner views own image jobs" ON public.ai_image_jobs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = ai_image_jobs.property_id AND p.owner_id = auth.uid()));
CREATE POLICY "Admins manage ai image jobs" ON public.ai_image_jobs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

GRANT SELECT ON public.user_activity_logs TO authenticated;
GRANT ALL ON public.user_activity_logs TO service_role;
CREATE POLICY "Users read own activity" ON public.user_activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins read all activity" ON public.user_activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::user_role));

GRANT SELECT ON public.billing_plans TO anon, authenticated;
GRANT ALL ON public.billing_plans TO service_role;
CREATE POLICY "Anyone reads active billing plans" ON public.billing_plans FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins manage billing plans" ON public.billing_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

GRANT SELECT ON public.agent_acquisition_pipeline TO authenticated;
GRANT ALL ON public.agent_acquisition_pipeline TO service_role;
CREATE POLICY "Admins manage agent acquisition pipeline" ON public.agent_acquisition_pipeline FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

GRANT SELECT ON public.podcast_appearances TO anon, authenticated;
GRANT ALL ON public.podcast_appearances TO service_role;
CREATE POLICY "Public reads published podcast appearances" ON public.podcast_appearances FOR SELECT TO anon, authenticated USING (status IN ('published','aired','live'));
CREATE POLICY "Admins manage podcast appearances" ON public.podcast_appearances FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

ALTER PUBLICATION supabase_realtime DROP TABLE public.cs_user_settings;
ALTER PUBLICATION supabase_realtime DROP TABLE public.shared_searches;
ALTER PUBLICATION supabase_realtime DROP TABLE public.ai_investment_recommendations;
ALTER PUBLICATION supabase_realtime DROP TABLE public.vendor_astra_balances;
