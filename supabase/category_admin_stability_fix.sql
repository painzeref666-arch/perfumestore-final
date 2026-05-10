alter table products add column if not exists category text default 'perfumes';
alter table products add column if not exists variants jsonb;
alter table products add column if not exists active boolean default true;
alter table products add column if not exists notes jsonb;
alter table products add column if not exists promo text;
alter table products add column if not exists event text;

alter table products disable row level security;

-- Optional: set existing products to perfumes if empty
update products set category = 'perfumes' where category is null or category = '';
