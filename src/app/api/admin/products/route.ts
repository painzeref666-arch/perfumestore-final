import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getEnvError() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.';
  return '';
}

async function supabaseRest(path: string, init?: RequestInit) {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${base}/rest/v1/${path}`, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation,resolution=merge-duplicates',
        ...(init?.headers || {}),
      },
    });
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = text; }
    if (!res.ok) return { data: null, error: json?.message || json?.error || text || `Supabase REST error ${res.status}` };
    return { data: json, error: '' };
  } catch (err: any) {
    return { data: null, error: err?.name === 'AbortError' ? 'Product request timed out on server.' : (err?.message || 'Product request failed.') };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const missing = getEnvError();
  if (missing) return NextResponse.json({ data: [], error: missing }, { status: 200 });
  return NextResponse.json(await supabaseRest('products?select=*&order=created_at.desc&limit=500'), { status: 200 });
}

export async function POST(req: NextRequest) {
  const missing = getEnvError();
  if (missing) return NextResponse.json({ data: null, error: missing }, { status: 200 });
  const admin = await verifyAdminRequest(req);
  if (!admin.ok) return NextResponse.json({ data: null, error: admin.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const row = body?.row || body;
  if (!row?.id || !row?.name) return NextResponse.json({ data: null, error: 'Product id and name are required.' }, { status: 200 });
  const cleanRow = { ...row, category: row.category || 'perfumes', active: row.active !== false };
  return NextResponse.json(await supabaseRest('products?on_conflict=id', { method: 'POST', body: JSON.stringify(cleanRow) }), { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const missing = getEnvError();
  if (missing) return NextResponse.json({ data: null, error: missing }, { status: 200 });
  const admin = await verifyAdminRequest(req);
  if (!admin.ok) return NextResponse.json({ data: null, error: admin.error }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ data: null, error: 'Product id is required.' }, { status: 200 });
  return NextResponse.json(await supabaseRest(`products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }), { status: 200 });
}
