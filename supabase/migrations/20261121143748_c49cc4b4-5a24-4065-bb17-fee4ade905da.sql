REVOKE EXECUTE ON FUNCTION public.is_service_request_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_vendor_on_request(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_owner_view_tenant_file(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_service_request_owner(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_vendor_on_request(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_owner_view_tenant_file(text) TO authenticated, service_role;