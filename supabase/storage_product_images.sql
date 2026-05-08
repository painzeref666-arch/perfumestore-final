-- Exousia & Co. product image upload setup
-- Run this in Supabase SQL Editor if image uploads do not save as public URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png','image/jpeg','image/jpg','image/webp','image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/png','image/jpeg','image/jpg','image/webp','image/gif'];

drop policy if exists "Public can view product images" on storage.objects;
drop policy if exists "Public can upload product images" on storage.objects;
drop policy if exists "Public can update product images" on storage.objects;
drop policy if exists "Public can delete product images" on storage.objects;

create policy "Public can view product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

create policy "Public can upload product images"
on storage.objects
for insert
to public
with check (bucket_id = 'product-images');

create policy "Public can update product images"
on storage.objects
for update
to public
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

create policy "Public can delete product images"
on storage.objects
for delete
to public
using (bucket_id = 'product-images');
