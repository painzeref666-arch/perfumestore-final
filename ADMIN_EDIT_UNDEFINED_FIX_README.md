# Admin edit undefined fix

Fixes:
- Client-side crash on /admin:
  ReferenceError: edit is not defined
- Replaced accidental `edit` references with `editing`.

After push/redeploy:
1. Hard refresh /admin
2. Login again
