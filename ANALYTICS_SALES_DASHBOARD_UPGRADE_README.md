# Exousia & Co. Analytics + Sales Dashboard Upgrade

## What was added

- Real analytics page at `/admin/analytics`
- Date range buttons: last 7 days, 30 days, and 90 days
- Gross sales, paid sales, orders, average order, units sold, customers, pending payments, and low stock cards
- Daily sales bar chart
- Best-selling perfumes list
- Low-stock product list
- Recent orders table
- Refresh button

## Safe deployment steps

1. Upload/push this project to GitHub.
2. Wait for Vercel to redeploy.
3. Visit `/admin/analytics` after logging into admin.

## Optional Supabase SQL

If analytics shows a missing column error, run:

`supabase/analytics_sales_dashboard_upgrade.sql`

This script is safe. It only uses `add column if not exists` and indexes.
