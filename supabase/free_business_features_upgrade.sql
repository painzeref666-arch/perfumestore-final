-- Exousia & Co. free business feature tables/columns
-- Run in Supabase SQL Editor if reviews/wishlist/rewards features need database support.

create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  product_id text not null,
  customer_name text not null,
  rating integer default 5 check (rating >= 1 and rating <= 5),
  title text,
  body text,
  photo_url text,
  approved boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists loyalty_points (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  customer_email text,
  order_id text,
  points integer default 0,
  reason text,
  created_at timestamp with time zone default now()
);

alter table reviews disable row level security;
alter table loyalty_points disable row level security;
