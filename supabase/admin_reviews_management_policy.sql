-- Admin review management policies. Run once in Supabase SQL Editor.
-- Admins can view all reviews and take them down (approved=false) or delete them.

create policy "Admins can view all reviews"
on public.reviews for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'));

create policy "Admins can update reviews"
on public.reviews for update to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'))
with check (lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'));

create policy "Admins can delete reviews"
on public.reviews for delete to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'));

notify pgrst, 'reload schema';
