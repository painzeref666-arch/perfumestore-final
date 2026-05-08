# Exousia PerfumeStore — Master Merge Build

This build merges the latest working features into one project:

- luxury homepage + hero carousel
- admin-managed hero content
- dynamic product links
- Supabase database connection
- admin product CRUD
- image upload support
- product variations and prices
- scent quiz
- wishlist
- account/order tracking pages
- perfume note pyramid
- SEO collection pages
- business migration for shipping/order analytics fields

## Setup

1. Copy your working `.env.local` into this folder.
2. Run the SQL file in Supabase:
   `supabase/master_merge_all_upgrades.sql`
3. Run:
   `npm install`
   `npm run dev`
4. Open:
   `http://localhost:4028`
