import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function envError() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.';
  return '';
}

async function supabaseRest(path: string, init?: RequestInit) {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6500);

  try {
    const res = await fetch(`${base}/rest/v1/${path}`, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(init?.headers || {}),
      },
    });

    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = text; }

    if (!res.ok) {
      return { data: null, error: json?.message || json?.error || text || `Supabase REST error ${res.status}` };
    }

    return { data: json, error: '' };
  } catch (err: any) {
    return { data: null, error: err?.name === 'AbortError' ? 'Orders request timed out on server.' : (err?.message || 'Orders request failed.') };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const missing = envError();
  if (missing) return NextResponse.json({ data: [], error: missing }, { status: 200 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const tracking = url.searchParams.get('tracking_code') || url.searchParams.get('tracking');
  const limit = Math.min(Number(url.searchParams.get('limit') || 100), 500);

  let path = `orders?select=*&order=created_at.desc&limit=${limit}`;

  if (id) path = `orders?select=*&id=eq.${encodeURIComponent(id)}&limit=1`;
  if (tracking) path = `orders?select=*&tracking_code=eq.${encodeURIComponent(tracking)}&limit=1`;

  const result = await supabaseRest(path);
  return NextResponse.json(result, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const missing = envError();
  if (missing) return NextResponse.json({ data: null, error: missing }, { status: 200 });

  const body = await req.json().catch(() => ({}));
  const id = body?.id;
  const changes = body?.changes || {};
  if (!id) return NextResponse.json({ data: null, error: 'Missing order id.' }, { status: 200 });

  const result = await supabaseRest(`orders?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });

  return NextResponse.json(result, { status: 200 });
}
