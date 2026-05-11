# Production Stable Critical Fixes

Priority fixes included:
- Admin login rewritten with Supabase + emergency fallback.
- Product detail page now hides EDP/Extrait and bottle-size controls for Cosmetics and Wellness.
- Cosmetics product page uses cosmetics wording.
- Wellness product page uses wellness wording.
- SQL included for category/gallery/storage basics.

Admin emergency fallback:
- email: admin@exousiaandco.com
- fallback password: exousia2026
- You can change fallback password in Vercel: NEXT_PUBLIC_DEMO_ADMIN_PASSWORD

Run SQL after deploy:
supabase/production_stable_required.sql

Note:
I can only inspect public HTML without your admin password/session. I saw that Homepage, Products, Cosmetics, Wellness, and Track pages load publicly. Checkout/order/admin flows need live manual testing after this patch.
