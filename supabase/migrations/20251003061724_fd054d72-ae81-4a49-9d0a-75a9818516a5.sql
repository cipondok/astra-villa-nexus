-- Admin-only aggregated profile statistics to avoid RLS/HEAD issues
create or replace function public.get_admin_profile_stats()
returns table(
  total bigint,
  general_users bigint,
  vendors bigint,
  agents bigint,
  property_owners bigint,
  customer_service bigint,
  admins bigint,
  suspended bigint,
  pending bigint,
  active_today bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not is_admin_user() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select 
    count(*)::bigint as total,
    count(*) filter (where role = 'general_user')::bigint as general_users,
    count(*) filter (where role = 'vendor')::bigint as vendors,
    count(*) filter (where role = 'agent')::bigint as agents,
    count(*) filter (where role = 'property_owner')::bigint as property_owners,
    count(*) filter (where role = 'customer_service')::bigint as customer_service,
    count(*) filter (where role = 'admin')::bigint as admins,
    count(*) filter (where is_suspended = true)::bigint as suspended,
    count(*) filter (where verification_status = 'pending')::bigint as pending,
    count(*) filter (where last_seen_at >= now() - interval '24 hours')::bigint as active_today
  from public.profiles;
end;
$$;

comment on function public.get_admin_profile_stats is 'Admin-only aggregated user counts for Users Hub analytics.';