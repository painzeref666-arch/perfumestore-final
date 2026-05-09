# Orders API Bridge Fix

This patch moves admin/order reads through a Next.js server route:
- `/api/admin/orders`
- prevents client-side Supabase orders queries from hanging
- fixes Admin Dashboard order loading
- fixes Notification / Marketing / Reports order loading
- keeps existing checkout, products, auth, and tracking features
