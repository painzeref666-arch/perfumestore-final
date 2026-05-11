insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Public upload product images" on storage.objects;
create policy "Public upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images');

drop policy if exists "Public update product images" on storage.objects;
create policy "Public update product images"
on storage.objects for update
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');
