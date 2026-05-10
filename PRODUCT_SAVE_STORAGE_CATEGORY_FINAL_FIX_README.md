# Product Save + Storage + Category Final Fix

Fixes:
- Product save now uses a Next.js server API bridge instead of direct browser Supabase upsert.
- Cosmetics/Wellness category product save support.
- Product save has timeout recovery and clearer errors.
- Image upload failure will not save huge base64 data into the products table.
- Product image preview still works while upload is being fixed.
- Adds Supabase SQL for required product columns and product-images storage bucket.

IMPORTANT:
Run this SQL in Supabase:
`supabase/product_save_storage_category_final_fix.sql`

Then redeploy.
