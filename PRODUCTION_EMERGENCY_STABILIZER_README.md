# Production Emergency Stabilizer

Use this patch for the live site.

Fixes:
- Admin login now has Supabase login + fallback access.
- Default fallback password: exousia2026
- Product save uses server API bridge.
- Includes required SQL for product columns and image storage bucket.

After pushing:
1. Run `supabase/production_stabilizer_required.sql` in Supabase.
2. Redeploy on Vercel.
3. Login at /admin with admin email + Supabase password OR fallback password.
