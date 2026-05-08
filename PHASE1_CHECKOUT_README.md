# Phase 1 Checkout Upgrade

Adds COD + manual GCash/Maya payment verification.

## What changed

- Checkout supports:
  - Cash on Delivery
  - GCash manual verification
  - Maya manual verification
- Customer can upload payment screenshot/proof.
- Order saves payment method, reference number, proof URL, payment status, shipping fee, total, and tracking code.
- Admin order panel shows payment method, reference number, proof screenshot, and approve/reject payment buttons.

## Supabase SQL required

Run this file in Supabase SQL Editor:

```text
supabase/manual_checkout_phase1.sql
```

## Important

Update the payment instruction values in:

```text
src/app/checkout/page.tsx
```

Change:

```ts
const gcashName = 'Exousia and Co.';
const gcashNumber = '09XX XXX XXXX';
```

to your real GCash/Maya business payment details.

## Deploy

Upload the contents to GitHub, commit changes, then Vercel will auto-deploy.
