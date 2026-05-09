# Stability V2 Fix

Fixes included:
- Admin products/orders no longer hang indefinitely.
- Orders management uses safer Supabase select('*') query.
- Account page has hard timeout fallback.
- Checkout order insert and proof upload have timeout protection.
- Invoice lookup has timeout protection.
- Existing tracking upgrade is preserved.
