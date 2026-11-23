CREATE POLICY "Only admins may read property views" ON public.property_view_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::user_role) OR public.has_role(auth.uid(), 'super_admin'::user_role));