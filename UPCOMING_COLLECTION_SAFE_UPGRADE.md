# Upcoming Collection — Safe Upgrade

This upgrade is additive only.

## What changed
- Added optional `upcoming_*` product fields.
- Added an Admin Dashboard section to mark products as Coming Soon.
- Added a homepage Coming Soon section that only appears when at least one product is enabled.
- Existing hero carousel, checkout, product pricing, inventory, orders, and normal shop visibility are unchanged.

## Supabase
Run `supabase/upcoming_collection_upgrade.sql` in the Supabase SQL Editor before saving an Upcoming product through the Admin Dashboard.

## Admin
Edit a product and enable **Show** under **Upcoming collection card**.
- Upcoming order controls the display order.
- Upcoming badge defaults to `Coming Soon`.
- Upcoming description is shown on the homepage card.

If no product is marked Upcoming, the new homepage section remains completely hidden.
