-- Exousia & Co. Marketing Growth Upgrade
-- Run in Supabase SQL Editor if tables/columns are missing.

create table if not exists coupons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  type text default 'percent' check (type in ('percent','fixed')),
  value numeric default 0,
  min_subtotal numeric default 0,
  active boolean default true,
  starts_at timestamp null,
  ends_at timestamp null,
  usage_limit integer null,
  used_count integer default 0,
  created_at timestamp default now()
);

insert into coupons (code,type,value,min_subtotal,active) values
('WELCOME10','percent',10,0,true),
('FREESHIP','fixed',0,0,true),
('EXOUSIA100','fixed',100,999,true)
on conflict (code) do nothing;

create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  product_id text not null,
  customer_name text,
  customer_email text,
  rating integer default 5 check (rating between 1 and 5),
  title text,
  body text,
  approved boolean default true,
  created_at timestamp default now()
);

create table if not exists notification_logs (
  id uuid default gen_random_uuid() primary key,
  order_id text,
  customer_email text,
  customer_phone text,
  channel text check (channel in ('email','sms','whatsapp','manual')),
  event_type text,
  message text,
  status text default 'queued',
  created_at timestamp default now()
);

alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists discount numeric default 0;
alter table orders add column if not exists shipping_fee numeric default 0;
alter table orders add column if not exists notification_status text default 'not_sent';
alter table products add column if not exists seo_title text;
alter table products add column if not exists seo_description text;
