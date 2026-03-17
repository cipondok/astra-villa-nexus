
-- Role Permissions table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read role_permissions"
  ON public.role_permissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert role_permissions"
  ON public.role_permissions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update role_permissions"
  ON public.role_permissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete role_permissions"
  ON public.role_permissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Security definer function to check permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = _user_id
      AND ur.is_active = true
      AND rp.permission = _permission
  )
$$;

-- Seed default permissions
INSERT INTO public.role_permissions (role, permission, description) VALUES
  ('super_admin', 'full_dashboard_access', 'Access all admin dashboard sections'),
  ('super_admin', 'revenue_analytics', 'View revenue and financial analytics'),
  ('super_admin', 'user_management', 'Manage users, assign roles'),
  ('super_admin', 'listing_approval', 'Approve or reject property listings'),
  ('super_admin', 'manage_roles', 'Manage role permission mappings'),
  ('super_admin', 'manage_listings', 'Create, edit, delete listings'),
  ('super_admin', 'manage_leads', 'View and manage CRM leads'),
  ('super_admin', 'manage_services', 'Manage vendor services'),
  ('super_admin', 'manage_projects', 'Manage developer projects'),
  ('super_admin', 'system_settings', 'Modify system configuration'),
  ('admin', 'full_dashboard_access', 'Access all admin dashboard sections'),
  ('admin', 'revenue_analytics', 'View revenue and financial analytics'),
  ('admin', 'user_management', 'Manage users, assign roles'),
  ('admin', 'listing_approval', 'Approve or reject property listings'),
  ('admin', 'manage_roles', 'Manage role permission mappings'),
  ('admin', 'manage_listings', 'Create, edit, delete listings'),
  ('admin', 'manage_leads', 'View and manage CRM leads'),
  ('agent', 'manage_listings', 'Create, edit, delete own listings'),
  ('agent', 'manage_leads', 'View and manage own CRM leads'),
  ('agent', 'track_negotiations', 'Track negotiation activity'),
  ('agent', 'view_commission_stats', 'View own commission statistics'),
  ('agent', 'schedule_viewings', 'Schedule property viewings'),
  ('property_owner', 'manage_own_listings', 'Manage own property listings'),
  ('property_owner', 'view_seller_tools', 'Access seller intelligence tools'),
  ('property_owner', 'view_offers', 'View offers on own properties'),
  ('property_owner', 'manage_rental', 'Manage rental bookings'),
  ('investor', 'browse_listings', 'Browse all property listings'),
  ('investor', 'save_watchlist', 'Save properties to watchlist'),
  ('investor', 'submit_offers', 'Submit offers on properties'),
  ('investor', 'view_portfolio_analytics', 'View portfolio analytics'),
  ('investor', 'view_market_trends', 'Access market trend tools'),
  ('investor', 'view_deal_finder', 'Access deal finder'),
  ('vendor', 'manage_services', 'Manage own service listings'),
  ('vendor', 'receive_bookings', 'Receive booking requests'),
  ('vendor', 'update_job_status', 'Update job/booking status'),
  ('developer', 'manage_projects', 'Manage project launch pages'),
  ('developer', 'track_buyer_interest', 'Track buyer interest analytics'),
  ('developer', 'update_unit_inventory', 'Update unit inventory'),
  ('service_provider', 'manage_services', 'Manage own service listings'),
  ('service_provider', 'receive_bookings', 'Receive booking requests'),
  ('service_provider', 'update_job_status', 'Update job/booking status'),
  ('legal_consultant', 'receive_document_requests', 'Receive document service requests'),
  ('legal_consultant', 'update_processing_timeline', 'Update document processing timeline'),
  ('legal_consultant', 'view_legal_cases', 'View assigned legal cases'),
  ('customer_service', 'view_tickets', 'View support tickets'),
  ('customer_service', 'manage_live_chat', 'Manage live chat sessions'),
  ('customer_service', 'view_user_profiles', 'View user profile data'),
  ('editor', 'manage_content', 'Create and edit platform content'),
  ('editor', 'manage_seo', 'Manage SEO content and metadata'),
  ('general_user', 'browse_listings', 'Browse property listings'),
  ('general_user', 'save_watchlist', 'Save properties to favorites'),
  ('general_user', 'submit_inquiries', 'Submit property inquiries')
ON CONFLICT (role, permission) DO NOTHING;
