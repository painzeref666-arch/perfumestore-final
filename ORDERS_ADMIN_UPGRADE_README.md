# Orders Admin Panel Upgrade

This build keeps the previous master features and adds a full admin order management panel.

## Added
- Orders management section in Admin Dashboard
- Total Orders, Pending Orders, Paid Orders, Order Revenue cards
- Order filters: All, new, paid, processing, shipped, delivered, cancelled
- Customer info and shipping address display
- Ordered items display
- Payment status selector
- Order status selector
- Tracking number input
- Quick buttons: Mark Processing, Mark Shipped, Mark Delivered, Cancel Order

## Supabase SQL
Run this file in Supabase SQL Editor:

```text
supabase/orders_admin_panel_upgrade.sql
```

## Run locally
1. Copy your `.env.local` into this folder.
2. Run:

```powershell
npm install
npm run dev
```

3. Open:

```text
http://localhost:4028/admin
```
