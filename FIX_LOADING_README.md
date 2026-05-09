# Loading Products / Orders Fix

This ZIP includes a safer Supabase connection fix:

- validates `NEXT_PUBLIC_SUPABASE_URL`
- prevents the website from getting stuck on `Loading products...`
- adds a 10-second timeout for products/orders requests
- shows the real error on the page/admin dashboard
- falls back to built-in demo products if Supabase is not reachable

## After uploading to GitHub

1. Push this fixed project to GitHub.
2. Go to Vercel → Deployments → Redeploy.
3. Make sure Environment Variables are exactly:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Do not put quotes. Do not use the service role key.

## If products still don't load

Open the website after redeploy. The page will now show the exact Supabase error instead of loading forever.
