-- Fix duplicate policies and ensure admin-only write access for system-assets

drop policy if exists "Admins can upload system assets" on storage.objects;
drop policy if exists "Admins can update system assets" on storage.objects;
drop policy if exists "Admins can delete system assets" on storage.objects;

create policy "Admins can upload system assets"
on storage.objects
for insert
with check (
  bucket_id = 'system-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

create policy "Admins can update system assets"
on storage.objects
for update
using (
  bucket_id = 'system-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

create policy "Admins can delete system assets"
on storage.objects
for delete
using (
  bucket_id = 'system-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);
