EXOUSIA & CO. CUSTOMER REVIEWS FIX

This patch:
- Restricts the review form to signed-in users (the UI checks the session and re-checks the session at submit time).
- Requires authenticated user_id for review insertion through the included Supabase RLS policy.
- Keeps image/video uploads optional. A review can be submitted with no attachments; media_urls is sent as an empty array.
- Adds media_urls and user_id columns if missing and refreshes the Supabase schema cache.

IMPORTANT: Before deploying the updated website, run:
supabase/reviews_auth_optional_media_fix.sql
in Supabase SQL Editor. Review submission will otherwise fail if the table lacks media_urls/user_id or RLS is not configured.

Then deploy the updated project ZIP. Test in Incognito: logged-out users should see a sign-in link rather than the form. Signed-in users should be able to submit a review with no photo/video.
