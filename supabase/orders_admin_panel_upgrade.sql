-- Exousia admin orders panel upgrade
-- Safe to run more than once.

alter table public.orders
add column if not exists shipping_method text default 'Standard',
add column if not exists shipping_fee numeric default 0,
add column if not exists payment_status text default 'Pending',
add column if not exists tracking_number text default '',
add column if not exists shipped_at timestamptz,
add column if not exists delivered_at timestamptz;

-- Allow admin dashboard to read and update order status/tracking from the browser demo admin.
drop policy if exists "Allow anyone to read orders" on public.orders;
drop policy if exists "Allow anyone to update orders" on public.orders;
drop policy if exists "Allow anyone to insert orders" on public.orders;

create policy "Allow anyone to read orders"
on public.orders
for select
to public
using (true);

create policy "Allow anyone to insert orders"
on public.orders
for insert
to public
with check (true);

create policy "Allow anyone to update orders"
on public.orders
for update
to public
using (true)
with check (true);

grant select, insert, update on public.orders to anon;
grant select, insert, update on public.orders to authenticated;
