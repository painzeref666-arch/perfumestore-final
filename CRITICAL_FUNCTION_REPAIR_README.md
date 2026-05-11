# Critical Function Repair

Fixes visible errors:
- `fileToDataUrl is not defined` during product image upload.
- Image upload always clears loading state.
- Notifications page no longer hard-fails on slow order loading.
- Orders API timeout increased.

Also run:
`supabase/fix_product_images_storage.sql`

Then redeploy and hard refresh.
