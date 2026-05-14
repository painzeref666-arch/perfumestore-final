import { NextRequest } from 'next/server';

const ADMIN_EMAILS = ['admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'];

export async function verifyAdminRequest(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { ok: false, error: 'Admin login required.' };

  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!base || !key) return { ok: false, error: 'Supabase environment variables are missing.' };

  try {
    const res = await fetch(`${base}/auth/v1/user`, {
      cache: 'no-store',
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return { ok: false, error: 'Admin session is invalid or expired.' };

    const user = await res.json();
    const email = String(user?.email || '').trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) return { ok: false, error: 'This account is not allowed to access admin.' };

    return { ok: true, error: '', email };
  } catch {
    return { ok: false, error: 'Could not verify admin session.' };
  }
}
