-- Exousia & Co. Reviews: review-first page + photo/video attachments
-- Run this in Supabase SQL Editor before deploying the updated reviews page.

alter table public.reviews add column if not exists media_urls jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-media',
  'review-media',
  true,
  31457280,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update set public = true, file_size_limit = 31457280,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'];

-- Public can view uploaded review media.
drop policy if exists "Public read review media" on storage.objects;
create policy "Public read review media" on storage.objects for select to public
using (bucket_id = 'review-media');

-- Guests can upload review media without requiring customer accounts.
drop policy if exists "Guest upload review media" on storage.objects;
create policy "Guest upload review media" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'review-media');
