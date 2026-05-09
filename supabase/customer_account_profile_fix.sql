-- Customer account profile table and policies
create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text default '',
  phone text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.customer_profiles enable row level security;

drop policy if exists "Customers can read own profile" on public.customer_profiles;
drop policy if exists "Customers can insert own profile" on public.customer_profiles;
drop policy if exists "Customers can update own profile" on public.customer_profiles;

create policy "Customers can read own profile"
on public.customer_profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Customers can insert own profile"
on public.customer_profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Customers can update own profile"
on public.customer_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
