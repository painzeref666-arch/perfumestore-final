EXOUSIA & CO. - ADMIN REVIEW MANAGEMENT

Added a Reviews link to the admin dashboard and a dedicated /admin/reviews page.
Admins can:
- View all reviews, including taken-down reviews
- Take down a review (sets approved=false; it is hidden from the public reviews page)
- Permanently delete a review (confirmation prompt)

IMPORTANT: Run supabase/admin_reviews_management_policy.sql once in Supabase SQL Editor before using this feature.
The SQL policies restrict these management actions to the three admin emails configured in the site.
No review moderation/approval workflow was added. Customer reviews continue to publish immediately (approved=true).
