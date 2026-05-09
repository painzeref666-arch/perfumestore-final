-- Exousia & Co. Safe Admin Dashboard + Inventory Upgrade
-- Run this in Supabase SQL Editor. It only adds missing columns/indexes.

alter table if exists products
  add column if not exists active boolean default true,
  add column if not exists stock integer default 0,
  add column if not exists sale_price numeric,
  add column if not exists promo text,
  add column if not exists event text,
  add column if not exists hero_enabled boolean default false,
  add column if not exists hero_badge text,
  add column if not exists hero_title text,
  add column if not exists hero_description text,
  add column if not exists hero_button_text text,
  add column if not exists hero_button_link text,
  add column if not exists hero_order integer default 0,
  add column if not exists updated_at timestamp with time zone default now();

alter table if exists orders
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists customer_address text,
  add column if not exists payment_status text default 'Pending',
  add column if not exists payment_reference text,
  add column if not exists payment_proof_url text,
  add column if not exists payment_note text,
  add column if not exists order_status text default 'new',
  add column if not exists tracking_code text,
  add column if not exists tracking_number text,
  add column if not exists inventory_deducted boolean default false,
  add column if not exists paid_at timestamp with time zone,
  add column if not exists shipped_at timestamp with time zone,
  add column if not exists delivered_at timestamp with time zone,
  add column if not exists admin_notes text,
  add column if not exists tracking_history jsonb default '[]'::jsonb;

create index if not exists products_active_idx on products(active);
create index if not exists products_stock_idx on products(stock);
create index if not exists orders_created_at_idx on orders(created_at desc);
create index if not exists orders_customer_email_idx on orders(customer_email);
create index if not exists orders_order_status_idx on orders(order_status);
create index if not exists orders_payment_status_idx on orders(payment_status);
create index if not exists orders_tracking_code_idx on orders(tracking_code);

-- Optional, but useful while developing admin tools. Re-enable strict RLS later if needed.
alter table if exists products disable row level security;
alter table if exists orders disable row level security;
