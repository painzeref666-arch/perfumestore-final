-- Exousia & Co. Order Timeline + Shipping Tracking Upgrade
-- Run this in Supabase SQL Editor if the admin dashboard shows missing-column errors.

alter table orders
  add column if not exists courier_name text,
  add column if not exists delivery_notes text,
  add column if not exists estimated_delivery text,
  add column if not exists shipped_at timestamp,
  add column if not exists delivered_at timestamp,
  add column if not exists paid_at timestamp,
  add column if not exists approved_at timestamp,
  add column if not exists tracking_number text,
  add column if not exists tracking_code text,
  add column if not exists order_status text default 'new';

update orders
set tracking_code = coalesce(tracking_code, id::text)
where tracking_code is null;
