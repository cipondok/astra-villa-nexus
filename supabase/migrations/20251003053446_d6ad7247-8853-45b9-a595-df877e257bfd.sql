-- Create secure admin-only function to fetch profiles without RLS recursion issues
create or replace function public.get_admin_profiles(
  p_role text default null,
  p_limit integer default 200,
  p_offset integer default 0
)
returns table(
  id uuid,
  email text,
  full_name text,
  role user_role,
  verification_status text,
  created_at timestamptz,
  is_suspended boolean,
  suspension_reason text,
  last_seen_at timestamptz,
  company_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Ensure only admins can use this function
  if not is_admin_user() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.verification_status,
    p.created_at,
    p.is_suspended,
    p.suspension_reason,
    p.last_seen_at,
    p.company_name
  from public.profiles p
  where (p_role is null or p.role::text = p_role)
  order by p.created_at desc
  limit coalesce(p_limit, 200)
  offset coalesce(p_offset, 0);
end;
$$;

-- Optional: comment for docs
comment on function public.get_admin_profiles is 'Admin-only: returns a paginated list of profiles with minimal fields. Bypasses RLS safely via security definer.';