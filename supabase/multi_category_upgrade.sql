alter table products
add column if not exists category text default 'perfumes';

update products
set category = 'perfumes'
where category is null or category = '';
