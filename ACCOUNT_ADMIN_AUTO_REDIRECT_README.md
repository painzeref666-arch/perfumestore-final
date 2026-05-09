# Account Admin Auto Redirect

Admin login is now handled through the normal Account page.

Flow:
1. Click Account.
2. Login using admin email.
3. If the email matches the allowed admin list, it redirects to `/admin`.
4. Normal customers remain on `/account`.

Current admin emails included in code:
- admin@exousiaandco.com
- exousiaandco@gmail.com

To change this, edit:
`src/app/account/page.tsx`

Search for:
`ADMIN_EMAILS`
