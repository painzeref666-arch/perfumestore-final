# Admin edit line 678 final fix

Fixes the remaining runtime crash:
ReferenceError: edit is not defined
at AdminDashboard.tsx line 678.

This patch aggressively replaces leftover standalone `edit` references with `editing`.
