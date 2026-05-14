alter table products add column if not exists gallery_images jsonb default '[]'::jsonb;
