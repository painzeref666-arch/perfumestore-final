EVENT SCENTS HERO MEDIA ADMIN

Files changed:
- src/app/page.tsx: Event Scents hero now loads the published image/video from the new table; falls back to the existing ballroom image if none is published.
- src/app/admin/event-scents-media/page.tsx: dedicated media upload, preview, publish, delete interface.
- src/app/admin/components/AdminDashboard.tsx: new navigation link.

SUPABASE SETUP REQUIRED:
1. Open Supabase SQL Editor.
2. Run EVENT_SCENTS_HERO_MEDIA_SETUP.sql.
3. Ensure the existing public Storage bucket named homepage-media allows uploads/deletes for the admin workflow and public reads of uploaded media. The admin media manager uses a folder prefix event-scents/ within this bucket.
4. Deploy the project.

Image limit: 10 MB. Video limit: 100 MB. Supported: JPG/PNG/WebP/GIF, MP4/WebM/MOV.

Note: The SQL policies shown are permissive to match the current anon-client admin pattern in this project. For production security, database write policies and storage upload/delete policies should ideally be restricted to authenticated admin users via server-side authorization, not only client-side admin checks.
Build not verified.
