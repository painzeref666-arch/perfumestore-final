# Server Bridge V2 Fix

This patch fixes the remaining browser-side Supabase loading problems:
- Products now load through `/api/admin/products`.
- Orders now load through `/api/admin/orders`.
- Admin Dashboard, Notifications, Marketing, Reports, Invoice, and Track pages use the server bridge.
- Invoice has a hard timeout fallback.
- Existing checkout, QR, tracking, and UI upgrades are preserved.
