# Exousia & Co. Perfume Store

A Next.js 15 perfume ecommerce website with product variations, cart, checkout, admin dashboard, currency selector, and optional Supabase database.

## Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:4028
```

## Admin login

Open:

```text
http://localhost:4028/admin
```

Demo fallback account:

```text
Email: admin@exousia.com
Password: exousia2026
```

## Supabase database setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run the SQL file:

```text
supabase/schema.sql
```

4. Create a public Storage bucket named:

```text
product-images
```

5. Copy `.env.example` to `.env.local`.
6. Add your Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

7. Restart the dev server:

```bash
npm run dev
```

8. In Supabase Auth, create an admin user with your preferred email/password.
9. Login at `/admin` using that Supabase Auth account.
10. Click **Seed Demo Data** in the admin dashboard to push demo products into Supabase.

## What is included

- Product catalog with search, filter, and sort
- Size options: 10ml, 15ml, 50ml, 85ml
- Variation options: EDP and Extrait
- Price per size and variation
- Working cart
- Checkout with order saving to Supabase
- Admin product manager
- Admin image upload via Supabase Storage
- Promo/event fields
- Inventory and low-stock alerts
- Order viewer in admin dashboard
- Currency selector with PHP default

## Notes

Without Supabase keys, the website still runs in demo mode using browser local storage. For real business use, connect Supabase so product edits, image uploads, and orders save permanently.

## Product image upload fix

If the admin image selector previews the right photo but the shop still shows an old/placeholder image, run this file in Supabase SQL Editor:

```text
supabase/storage_product_images.sql
```

Then refresh the admin page, select the product image again, wait for the “Image uploaded successfully” message, and click **Save**.

## Production ecommerce upgrade

This ZIP adds:
- Customer account page: `/account`
- Order tracking page: `/track`
- Coupon support: `WELCOME10`, `FREESHIP`
- Shipping fee calculator by Philippine region
- Inventory deduction after checkout
- Payment status fields for GCash/Maya/PayMongo/PayPal/Stripe preparation
- Email receipt link after checkout
- Customer reviews page: `/reviews`
- Admin sales analytics: `/admin/analytics`

### Required Supabase SQL
Run these files in Supabase SQL Editor:
1. `supabase/schema.sql` if you have not run it yet
2. `supabase/storage_product_images.sql` for image uploads
3. `supabase/production_upgrade.sql` for coupons, reviews, tracking, shipping, and analytics fields

After running SQL, restart the website:

```bash
npm run dev
```
