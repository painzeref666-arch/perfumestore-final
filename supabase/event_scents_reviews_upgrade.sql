-- Enable reviews for Event Scents, which is a service and not a catalog product.
-- Run once in the Supabase SQL Editor before customers submit Event Scents reviews.
alter table public.reviews alter column product_id drop not null;
alter table public.reviews add column if not exists review_subject text;

-- Refresh the PostgREST schema cache so the app can use review_subject immediately.
notify pgrst, 'reload schema';
