# Track Order Code UUID Fix

Fixes:
- `EXO-...` tracking codes no longer get searched as UUID ids.
- UUID values still search by `id`.
- EXO tracking codes search by `tracking_code`.
- Email/phone fallback supported.
- Removes invalid UUID error on tracking page.
