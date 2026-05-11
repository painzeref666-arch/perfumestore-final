# Live Stability No-Storage Upload Fix

Fixes:
- Stops using Supabase Storage for product image upload.
- Compresses selected image into a smaller JPEG data URL.
- Saves that image directly in the product record.
- Removes storage timeout blocker.
- Replaces notification page with stable graceful fallback.

Why:
Supabase Storage upload is timing out on the live site, likely because of bucket policy/network limits.
This patch prioritizes keeping the live business site usable.
