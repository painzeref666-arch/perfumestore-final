# Exousia & Co. — Perfume Variant Pricing Upgrade

The storefront now supports these perfume price combinations:

- EDP — 10ml
- EDP — 85ml
- Extrait — 50ml
- EDT — 50ml

Admin behavior:
- Enter a price to make that option available.
- Leave the price blank (or set it to 0) to hide that option from customers.
- The customer defaults to the lowest-priced available option.
- If only one option is available, the storefront shows it directly instead of an unnecessary selector.
- Cosmetics and Wellness keep their category-specific pricing UI and do not inherit perfume options.

Cart behavior:
- Cart pricing uses the selected available variant.
- Older/invalid perfume cart variants are resolved to a current available option so hidden legacy sizes cannot be charged as active variants.

Database:
- No new Supabase column is required. Existing `products.variants` JSONB is reused.
- Existing product/order/accounting flows were left intact.
