# Category-aware Admin Stability Fix

Fixes:
- Perfumes keep EDP/Extrait and ML prices.
- Cosmetics no longer show EDP/Extrait; uses shade/flavor/variant + price.
- Wellness no longer show EDP/Extrait; uses scent/benefit/variant + price.
- Product image upload now has a timeout and will not stay stuck forever.
- Product save/upsert now has a timeout and clearer error handling.
- Includes Supabase SQL: `supabase/category_admin_stability_fix.sql`.

After deploy, run the SQL file in Supabase if saving product category/variants fails.
