-- Analytics + Sales Dashboard safe database check
-- Run this in Supabase SQL Editor if the analytics page shows missing column errors.
-- This script only adds missing columns; it will not delete existing data.

alter table orders add column if not exists total numeric default 0;
alter table orders add column if not exists subtotal numeric default 0;
alter table orders add column if not exists shipping_fee numeric default 0;
alter table orders add column if not exists items jsonb default '[]'::jsonb;
alter table orders add column if not exists customer jsonb default '{}'::jsonb;
alter table orders add column if not exists customer_name text;
alter table orders add column if not exists customer_email text;
alter table orders add column if not exists payment_status text default 'Pending';
alter table orders add column if not exists order_status text default 'new';
alter table orders add column if not exists status text default 'new';

alter table products add column if not exists stock integer default 0;
alter table products add column if not exists active boolean default true;
alter table products add column if not exists variants jsonb default '[]'::jsonb;
alter table products add column if not exists family text;

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_payment_status_idx on orders (payment_status);
create index if not exists orders_order_status_idx on orders (order_status);
create index if not exists products_stock_idx on products (stock);
