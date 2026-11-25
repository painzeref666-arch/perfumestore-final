-- Apply after creating public.event_scents_bookings.
-- Public visitors can submit booking inquiries, but cannot read them.
-- Admin users with these email addresses can read/update inquiry statuses.
CREATE POLICY "Admin can read Event Scents inquiries"
ON public.event_scents_bookings
FOR SELECT
TO authenticated
USING (lower(auth.jwt() ->> 'email') IN ('admin@exousiaandco.com','exousiaandco@gmail.com','admin@exousia.com'));

CREATE POLICY "Admin can update Event Scents inquiry status"
ON public.event_scents_bookings
FOR UPDATE
TO authenticated
USING (lower(auth.jwt() ->> 'email') IN ('admin@exousiaandco.com','exousiaandco@gmail.com','admin@exousia.com'))
WITH CHECK (lower(auth.jwt() ->> 'email') IN ('admin@exousiaandco.com','exousiaandco@gmail.com','admin@exousia.com'));
