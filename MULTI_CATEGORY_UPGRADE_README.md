# Exousia Multi-Category Homepage Upgrade

Included:
- Homepage category buttons
- Perfumes page
- Cosmetics page
- Wellness page
- Category-based product filtering
- Admin category-ready structure

Run this SQL in Supabase:

alter table products
add column if not exists category text default 'perfumes';

Example category values:
- perfumes
- cosmetics
- wellness

Then redeploy on Vercel.
