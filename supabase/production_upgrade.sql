-- Exousia & Co. production ecommerce upgrade
-- Run this in Supabase SQL Editor after the original schema.

alter table public.orders add column if not exists shipping_fee numeric not null default 0;
alter table public.orders add column if not exists discount numeric not null default 0;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists total numeric;
alter table public.orders add column if not exists payment_status text not null default 'payment_pending';
alter table public.orders add column if not exists tracking_code text unique;
alter table public.orders add column if not exists updated_at timestamptz not null default now();

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null default 'percent',
  value numeric not null default 0,
  min_subtotal numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.coupons (code, type, value, min_subtotal, active)
values ('WELCOME10','percent',10,0,true), ('FREESHIP','fixed',0,0,true)
on conflict (code) do update set active = true;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text references public.products(id) on delete cascade,
  customer_name text not null,
  rating numeric not null default 5,
  title text not null default '',
  body text not null default '',
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Public can read coupons" on public.coupons;
create policy "Public can read coupons" on public.coupons for select to public using (active = true);

drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews" on public.reviews for select to public using (approved = true);

drop policy if exists "Public can insert reviews" on public.reviews;
create policy "Public can insert reviews" on public.reviews for insert to public with check (true);

drop policy if exists "Public can manage reviews" on public.reviews;
create policy "Public can manage reviews" on public.reviews for all to public using (true) with check (true);

grant select on public.coupons to anon, authenticated;
grant select, insert, update, delete on public.reviews to anon, authenticated;
grant select, insert, update, delete on public.orders to anon, authenticated;
grant select, insert, update, delete on public.products to anon, authenticated;
