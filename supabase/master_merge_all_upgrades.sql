-- Exousia PerfumeStore master merge migration
-- Safe to run more than once.

-- Batch 2: customer features
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  product_id uuid,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.wishlists enable row level security;

drop policy if exists "Allow wishlist read" on public.wishlists;
drop policy if exists "Allow wishlist insert" on public.wishlists;
drop policy if exists "Allow wishlist delete" on public.wishlists;

create policy "Allow wishlist read"
on public.wishlists
for select
to public
using (true);

create policy "Allow wishlist insert"
on public.wishlists
for insert
to public
with check (true);

create policy "Allow wishlist delete"
on public.wishlists
for delete
to public
using (true);

grant select, insert, delete on public.wishlists to anon;
grant select, insert, delete on public.wishlists to authenticated;

-- Batch 3: business system
alter table public.orders
add column if not exists shipping_method text default 'Standard',
add column if not exists shipping_fee numeric default 0,
add column if not exists payment_status text default 'Pending',
add column if not exists tracking_number text default '',
add column if not exists shipped_at timestamptz,
add column if not exists delivered_at timestamptz;

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  customer_email text,
  subject text,
  message text,
  created_at timestamptz default now()
);

create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid,
  product_name text,
  quantity_before int,
  quantity_after int,
  change_type text,
  created_at timestamptz default now()
);

alter table public.email_logs enable row level security;
alter table public.inventory_logs enable row level security;

drop policy if exists "Allow public inventory read" on public.inventory_logs;
drop policy if exists "Allow public email logs read" on public.email_logs;

create policy "Allow public inventory read"
on public.inventory_logs
for select
to public
using (true);

create policy "Allow public email logs read"
on public.email_logs
for select
to public
using (true);

grant select, insert on public.email_logs to anon;
grant select, insert on public.email_logs to authenticated;
grant select, insert on public.inventory_logs to anon;
grant select, insert on public.inventory_logs to authenticated;
