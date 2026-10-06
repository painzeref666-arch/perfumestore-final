-- Exousia & Co. upcoming collection upgrade
-- Safe additive migration: does not remove or modify existing product data.

alter table public.products add column if not exists upcoming_enabled boolean not null default false;
alter table public.products add column if not exists upcoming_badge text not null default 'Coming Soon';
alter table public.products add column if not exists upcoming_description text not null default '';
alter table public.products add column if not exists upcoming_order integer not null default 0;

grant select, insert, update, delete on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
