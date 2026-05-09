# Exousia Admin Dashboard + Inventory Upgrade

Safe changes added:

- Keeps the previous loading fix / fallback behavior
- Admin dashboard summary cards
- Product search inside Admin
- Adjustable low-stock alert threshold
- Orders search by ID, customer, email, phone, or tracking number
- Export orders to CSV
- SQL upgrade file with `ADD COLUMN IF NOT EXISTS` only

## Deploy

1. Replace the files in your GitHub project with this ZIP content.
2. Commit and push to GitHub.
3. Vercel should redeploy automatically.
4. In Supabase SQL Editor, run the file:

```text
supabase/admin_dashboard_inventory_upgrade.sql
```

## Notes

This upgrade avoids deleting old files and avoids destructive SQL. Existing products/orders should remain safe.
