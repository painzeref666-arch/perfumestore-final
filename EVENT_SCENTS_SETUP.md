# Event Scents booking feature setup

## Included
- Homepage Book Us Now CTA links to `/event-scents/book`.
- Booking form submission is handled by `/api/event-scents/book` and stored in `event_scents_bookings`.
- Admin inquiry page: `/admin/event-scents` (requires an authenticated admin session).
- Admin dashboard shortcut to the inquiry page.
- Admin status management for inquiries.
- Email notification via Resend when the Resend environment variables are configured.

## Supabase SQL
The public booking table and INSERT policy were created in the previous setup. Run `supabase/event_scents_admin_access.sql` in the Supabase SQL Editor to add the admin-only SELECT and UPDATE policies for the inquiry dashboard. Run once only; if policies already exist, remove or rename duplicates before re-running.

## Email notification configuration
Set these environment variables in Vercel (and locally in `.env.local` if testing locally):
- `RESEND_API_KEY` — your Resend API key (server-side only; do not use NEXT_PUBLIC prefix)
- `EVENT_SCENTS_ADMIN_EMAIL` — email address that should receive booking notifications
- `EVENT_SCENTS_EMAIL_FROM` — optional sender, e.g. `Event Scents <bookings@your-verified-domain.com>`; sender domain must be verified in Resend. If omitted, code uses Resend's onboarding sender, which may be restricted to the account's verified recipient.

The booking is stored first. If email settings are absent, submissions still save, but automatic admin email notifications will not be sent until configured.
