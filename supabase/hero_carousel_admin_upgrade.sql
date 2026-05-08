-- Exousia & Co. hero carousel admin upgrade
-- Run this in Supabase SQL Editor.

alter table public.products add column if not exists hero_enabled boolean not null default false;
alter table public.products add column if not exists hero_badge text not null default 'Featured';
alter table public.products add column if not exists hero_title text not null default '';
alter table public.products add column if not exists hero_description text not null default '';
alter table public.products add column if not exists hero_button_text text not null default 'View Perfume';
alter table public.products add column if not exists hero_button_link text not null default '';
alter table public.products add column if not exists hero_order integer not null default 0;

update public.products
set
  hero_enabled = true,
  hero_badge = coalesce(nullif(tag, ''), 'Featured'),
  hero_title = coalesce(nullif(name, ''), 'Featured Perfume'),
  hero_description = coalesce(nullif(description, ''), 'Discover this signature fragrance.'),
  hero_button_text = 'View Perfume',
  hero_button_link = '/products/' || id,
  hero_order = case
    when id = 'velvet-noir' then 1
    when id = 'bloom-eclat' then 2
    when id = 'oud-royale' then 3
    when id = 'citrus-muse' then 4
    else hero_order
  end
where id in ('velvet-noir','bloom-eclat','oud-royale','citrus-muse');

grant select, insert, update, delete on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
