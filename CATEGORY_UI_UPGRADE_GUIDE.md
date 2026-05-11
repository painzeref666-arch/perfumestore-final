# Exousia Category UI Upgrade

## Goal
Separate UI for:
- Perfumes
- Cosmetics
- Wellness

## Cosmetics should NOT show:
- EDP
- Extrait
- Perfume Type
- Bottle Size
- Fragrance wording

## Wellness should NOT show:
- EDP
- Extrait
- Perfume wording

---

# FILES TO UPDATE

## 1. src/components/shop/ProductBrowser.tsx

Add:

```ts
const isPerfume = p.category === 'perfumes';
const isCosmetics = p.category === 'cosmetics';
const isWellness = p.category === 'wellness';
```

Then:

```tsx
{isPerfume && (
  <>
    PERFUME SIZE OPTIONS
    EDP / EXTRAIT
  </>
)}
```

Cosmetics:

```tsx
{isCosmetics && (
  <>
    <div>Glossy</div>
    <div>Matte</div>
    <div>Lip Tint</div>
  </>
)}
```

Wellness:

```tsx
{isWellness && (
  <>
    <div>Body Care</div>
    <div>Wellness Blend</div>
    <div>Self Care</div>
  </>
)}
```

---

## 2. src/app/products/[id]/page.tsx

Add:

```ts
const isPerfume = product?.category === 'perfumes';
const isCosmetics = product?.category === 'cosmetics';
const isWellness = product?.category === 'wellness';
```

Hide:
- Choose Perfume Type
- EDP
- Extrait
- Bottle Size

for cosmetics and wellness.

---

# Cosmetics UI

Show:
- Product Type
- Finish
- Shade
- Flavor
- Glow / Matte / Tint

---

# Wellness UI

Show:
- Wellness Type
- Benefits
- Dosage
- Volume
- Capsule count

---

# 3 IMAGE GALLERY

## DATABASE SQL

```sql
alter table products
add column if not exists gallery_images jsonb default '[]'::jsonb;
```

---

# ADMIN PANEL

Add:
- Main Image
- Gallery Image 1
- Gallery Image 2
- Gallery Image 3

Store into:

```json
[
  "image1.jpg",
  "image2.jpg",
  "image3.jpg"
]
```

---

# PRODUCT PAGE

Use thumbnails below main image.
Click thumbnail => switch main image.

