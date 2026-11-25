-- Exousia reviews: require an authenticated account; media attachments remain optional.
-- Run in Supabase SQL Editor.

alter table public.reviews add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.reviews add column if not exists media_urls jsonb not null default '[]'::jsonb;

-- Keep the legacy photo_url column optional if it exists; the frontend no longer sends it.

alter table public.reviews enable row level security;

-- Remove legacy permissive policies that allowed anonymous submissions/manage access.
drop policy if exists "Public can insert reviews" on public.reviews;
drop policy if exists "Public can manage reviews" on public.reviews;
drop policy if exists "Public can read approved reviews" on public.reviews;
drop policy if exists "Authenticated users can insert reviews" on public.reviews;
drop policy if exists "Anyone can read approved reviews" on public.reviews;
drop policy if exists "Authenticated read approved reviews" on public.reviews;
drop policy if exists "Users can insert own reviews" on public.reviews;

create policy "Anyone can read approved reviews"
on public.reviews for select to anon, authenticated
using (approved = true);

create policy "Users can insert own reviews"
on public.reviews for insert to authenticated
with check (user_id = auth.uid());

-- Review media bucket: authenticated-only uploads; public reads for media linked to reviews.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-media','review-media',true,31457280,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public=true, file_size_limit=31457280,
  allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'];

drop policy if exists "Public read review media" on storage.objects;
drop policy if exists "Guest upload review media" on storage.objects;
drop policy if exists "Authenticated upload review media" on storage.objects;

create policy "Public read review media"
on storage.objects for select to public
using (bucket_id = 'review-media');

create policy "Authenticated upload review media"
on storage.objects for insert to authenticated
with check (bucket_id = 'review-media');
