-- Ensure system-assets bucket exists and is public
insert into storage.buckets (id, name, public)
values ('system-assets', 'system-assets', true)
on conflict (id) do update set public = excluded.public;

-- Public read access for system branding assets
create policy "Public can read system assets"
on storage.objects
for select
using (bucket_id = 'system-assets');

-- Authenticated users can manage uploads in system-assets
create policy "Authenticated can upload system assets"
on storage.objects
for insert
with check (bucket_id = 'system-assets' and auth.role() = 'authenticated');

create policy "Authenticated can update system assets"
on storage.objects
for update
using (bucket_id = 'system-assets' and auth.role() = 'authenticated');

create policy "Authenticated can delete system assets"
on storage.objects
for delete
using (bucket_id = 'system-assets' and auth.role() = 'authenticated');
