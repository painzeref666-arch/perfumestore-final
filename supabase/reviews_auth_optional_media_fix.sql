-- Exousia reviews: submissions require an authenticated customer account.
-- Photo/video attachments are OPTIONAL. Run this once in Supabase SQL Editor.

alter table public.reviews add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.reviews add column if not exists media_urls jsonb not null default '[]'::jsonb;

-- Refresh PostgREST's schema cache after adding columns.
notify pgrst, 'reload schema';

alter table public.reviews enable row level security;

-- Remove older policies that allowed public/anonymous submissions.
drop policy if exists "Public can insert reviews" on public.reviews;
drop policy if exists "Public can manage reviews" on public.reviews;
drop policy if exists "Public can read approved reviews" on public.reviews;
drop policy if exists "Authenticated users can insert reviews" on public.reviews;
drop policy if exists "Anyone can read approved reviews" on public.reviews;
drop policy if exists "Authenticated read approved reviews" on public.reviews;
drop policy if exists "Users can insert own reviews" on public.reviews;
drop policy if exists "Guest can insert reviews" on public.reviews;

create policy "Anyone can read approved reviews"
on public.reviews for select to anon, authenticated
using (approved = true);

create policy "Users can insert own reviews"
on public.reviews for insert to authenticated
with check (user_id = auth.uid());

-- Authenticated uploads only; public viewing for media attached to published reviews.
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

notify pgrst, 'reload schema';
