# Exousia & Co. Professional Ecommerce Batch

Safe upgrade added without replacing the core checkout/admin logic.

## Added

1. Printable invoice / PDF page
   - URL: `/invoice/[order_id]`
   - Admin orders now have `Invoice / PDF` button
   - Customer order success page now has `View invoice`
   - Use browser Print then Save as PDF

2. Customer notification center
   - URL: `/admin/notifications`
   - Quick copy, email, SMS, and WhatsApp follow-up messages
   - Manual-send first for safety; no paid email provider required yet

3. Wishlist upgrade
   - Product page now has a wishlist heart button
   - Existing wishlist storage still works with Supabase or local fallback

4. Recently viewed products
   - Product detail page remembers viewed perfumes
   - Shows recently viewed section under the product details

5. Luxury product page enhancements
   - Keeps existing fragrance story, reviews, related products
   - Adds wishlist and continue-exploring section

## Deployment

1. Upload/replace files in GitHub
2. Wait for Vercel redeploy
3. Test:
   - `/admin`
   - `/admin/notifications`
   - `/invoice/YOUR_ORDER_ID`
   - product detail pages

## SQL

No required SQL for this batch if you already ran the previous marketing growth SQL.
Wishlist/reviews/coupons tables are still covered by:

`supabase/marketing_growth_upgrade.sql`

## Notes

The notification center does not send automatic emails yet. It creates ready-to-send messages using mailto/SMS/WhatsApp links. Fully automatic email needs a provider like Resend, Brevo, or SendGrid.
