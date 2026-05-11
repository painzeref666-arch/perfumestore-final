# Image Upload Stability Fix

Fixes:
- No more infinite "Preparing image preview..."
- 6-second preview timeout
- rejects non-image files
- rejects images over 6MB
- Supabase upload timeout protection
- product can still save if upload fails and Image URL is pasted

If upload still fails:
1. Run Supabase Storage SQL setup.
2. Use a smaller image under 6MB.
3. Paste a public Image URL as fallback.
