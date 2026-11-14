-- Exousia & Co. Homepage Media Manager
-- Run this script in Supabase SQL Editor before using the admin uploader.

create table if not exists public.homepage_media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_type text not null check (media_type in ('image', 'video')),
  file_url text not null,
  storage_path text not null unique,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists homepage_media_one_active_idx
  on public.homepage_media (is_active)
  where is_active = true;

alter table public.homepage_media enable row level security;

drop policy if exists "Homepage media is publicly readable" on public.homepage_media;
create policy "Homepage media is publicly readable"
  on public.homepage_media for select
  using (true);

drop policy if exists "Authenticated users manage homepage media" on public.homepage_media;
create policy "Authenticated users manage homepage media"
  on public.homepage_media for all
  to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'))
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'homepage-media',
  'homepage-media',
  true,
  104857600,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Homepage media files are publicly readable" on storage.objects;
create policy "Homepage media files are publicly readable"
  on storage.objects for select
  using (bucket_id = 'homepage-media');

drop policy if exists "Authenticated users upload homepage media" on storage.objects;
create policy "Authenticated users upload homepage media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'homepage-media' and lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'));

drop policy if exists "Authenticated users update homepage media files" on storage.objects;
create policy "Authenticated users update homepage media files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'homepage-media' and lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'))
  with check (bucket_id = 'homepage-media' and lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'));

drop policy if exists "Authenticated users delete homepage media files" on storage.objects;
create policy "Authenticated users delete homepage media files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'homepage-media' and lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'));
