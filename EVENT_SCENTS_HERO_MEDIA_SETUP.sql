-- Exousia & Co. Event Scents hero media manager
-- Run in Supabase SQL Editor once.
create table if not exists public.event_scents_hero_media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_type text not null check (media_type in ('image','video')),
  file_url text not null,
  storage_path text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.event_scents_hero_media enable row level security;

-- Public read for homepage media. Admin upload/publish/delete is gated in the app
-- by its existing admin session check; these policies allow anon client access.
-- If you use stronger custom Supabase auth policies, adapt these accordingly.
create policy "Public can read active Event Scents hero media"
  on public.event_scents_hero_media for select
  using (is_active = true);

create policy "Admin client can read all Event Scents hero media"
  on public.event_scents_hero_media for select
  using (true);

create policy "Admin client can insert Event Scents hero media"
  on public.event_scents_hero_media for insert
  with check (true);

create policy "Admin client can update Event Scents hero media"
  on public.event_scents_hero_media for update
  using (true) with check (true);

create policy "Admin client can delete Event Scents hero media"
  on public.event_scents_hero_media for delete
  using (true);
