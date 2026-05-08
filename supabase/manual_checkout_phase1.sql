-- Phase 1 checkout upgrade: COD + manual GCash/Maya payment verification

alter table public.orders
add column if not exists total numeric default 0,
add column if not exists discount numeric default 0,
add column if not exists coupon_code text,
add column if not exists payment_method text default 'Cash on Delivery',
add column if not exists payment_reference text default '',
add column if not exists payment_proof_url text default '',
add column if not exists payment_note text default '',
add column if not exists payment_status text default 'Pending',
add column if not exists shipping_method text default 'Standard',
add column if not exists shipping_fee numeric default 0,
add column if not exists tracking_code text default '',
add column if not exists tracking_number text default '',
add column if not exists paid_at timestamptz,
add column if not exists shipped_at timestamptz,
add column if not exists delivered_at timestamptz;

-- Keep orders accessible for the current frontend/admin workflow.
drop policy if exists "Allow anyone to read orders" on public.orders;
drop policy if exists "Allow anyone to insert orders" on public.orders;
drop policy if exists "Allow anyone to update orders" on public.orders;

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

-- Public storage bucket for customer payment screenshots.
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do update set public = true;

drop policy if exists "Allow public payment proof uploads" on storage.objects;
drop policy if exists "Allow public payment proof reads" on storage.objects;

drop policy if exists "Allow public payment proof updates" on storage.objects;

create policy "Allow public payment proof uploads"
on storage.objects
for insert
to public
with check (bucket_id = 'payment-proofs');

create policy "Allow public payment proof reads"
on storage.objects
for select
to public
using (bucket_id = 'payment-proofs');

create policy "Allow public payment proof updates"
on storage.objects
for update
to public
using (bucket_id = 'payment-proofs')
with check (bucket_id = 'payment-proofs');
