# Multi-Category Visual Homepage Upgrade

Included:
- New homepage with 3 big buttons/cards: Perfumes, Cosmetics, Wellness
- New pages: /perfumes, /cosmetics, /wellness
- Each category page uses the same product cards, filters, cart, wishlist, checkout flow
- Products are filtered by product.category
- Admin Add/Edit Product now has a Category dropdown

Run in Supabase SQL Editor:

alter table products add column if not exists category text default 'perfumes';
update products set category = 'perfumes' where category is null or category = '';
