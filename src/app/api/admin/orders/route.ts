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
  const timer = setTimeout(() => controller.abort(), 6000);

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

    const body = await res.text();
    let json: any = null;
    try { json = body ? JSON.parse(body) : null; } catch { json = body; }

    if (!res.ok) {
      return { data: null, error: json?.message || json?.error || body || `Supabase REST error ${res.status}` };
    }

    return { data: json, error: '' };
  } catch (err: any) {
    return { data: null, error: err?.name === 'AbortError' ? 'Supabase request timed out on server.' : (err?.message || 'Supabase request failed.') };
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
  const email = url.searchParams.get('email');
  const phone = url.searchParams.get('phone');
  const limit = Math.min(Number(url.searchParams.get('limit') || 100), 500);

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  let path = `orders?select=*&order=created_at.desc&limit=${limit}`;
  if (id && isUuid(id)) path = `orders?select=*&id=eq.${encodeURIComponent(id)}&limit=1`;
  else if (id) path = `orders?select=*&tracking_code=eq.${encodeURIComponent(id)}&limit=1`;
  if (tracking) path = `orders?select=*&tracking_code=eq.${encodeURIComponent(tracking)}&limit=1`;
  if (email) path = `orders?select=*&customer_email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=${limit}`;
  if (phone) path = `orders?select=*&customer_phone=eq.${encodeURIComponent(phone)}&order=created_at.desc&limit=${limit}`;

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
