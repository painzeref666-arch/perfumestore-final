-- Exousia & Co. Perfume Store Supabase schema
-- Run this in Supabase SQL Editor.

create table if not exists public.products (
  id text primary key,
  name text not null,
  family text not null default 'Floral',
  notes jsonb not null default '[]'::jsonb,
  price numeric not null default 0,
  size text not null default '10ml',
  image text not null default '',
  rating numeric not null default 5,
  reviews integer not null default 0,
  stock integer not null default 0,
  tag text not null default 'New',
  description text not null default '',
  variants jsonb not null default '[]'::jsonb,
  promo text default '',
  event text default '',
  sale_price numeric,
  active boolean not null default true,
  hero_enabled boolean not null default false,
  hero_badge text not null default 'Featured',
  hero_title text not null default '',
  hero_description text not null default '',
  hero_button_text text not null default 'View Perfume',
  hero_button_link text not null default '',
  hero_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer jsonb not null,
  items jsonb not null,
  subtotal numeric not null default 0,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Customers can read active products.
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products
for select using (active = true);

-- Demo admin can manage products from the website admin page.
-- For a real production site, replace this with authenticated admin-only policies.
drop policy if exists "Authenticated users can manage products" on public.products;
drop policy if exists "Public demo can manage products" on public.products;
create policy "Public demo can manage products" on public.products
for all using (true) with check (true);

-- Customers can create orders.
drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders" on public.orders
for insert with check (true);

-- Demo admin can read/update orders from the website admin page.
-- For a real production site, replace this with authenticated admin-only policies.
drop policy if exists "Authenticated users can manage orders" on public.orders;
drop policy if exists "Public demo can manage orders" on public.orders;
create policy "Public demo can manage orders" on public.orders
for all using (true) with check (true);

-- Optional: Supabase Storage bucket named product-images.
-- Create bucket in Storage UI. Set it public. Then use this policy if needed:
-- create policy "Authenticated can upload product images" on storage.objects
-- for all to authenticated using (bucket_id = 'product-images') with check (bucket_id = 'product-images');
