import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getEnvError() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return 'Missing Supabase environment variables.';
  return '';
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function supabaseRest(path: string, init?: RequestInit) {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

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
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }

    if (!res.ok) {
      return {
        data: null,
        error: json?.message || json?.error || text || `Supabase REST error ${res.status}`,
      };
    }

    return { data: json, error: '' };
  } catch (err: any) {
    return {
      data: null,
      error: err?.name === 'AbortError'
        ? 'Supabase request timed out.'
        : (err?.message || 'Supabase request failed.'),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const envError = getEnvError();
  if (envError) return NextResponse.json({ data: [], error: envError }, { status: 200 });

  const url = new URL(req.url);
  const rawId = (url.searchParams.get('id') || '').trim();
  const rawTracking = (url.searchParams.get('tracking_code') || url.searchParams.get('tracking') || '').trim();
  const email = (url.searchParams.get('email') || '').trim();
  const phone = (url.searchParams.get('phone') || '').trim();
  const limit = Math.min(Number(url.searchParams.get('limit') || 100), 500);

  let path = `orders?select=*&order=created_at.desc&limit=${limit}`;

  if (rawTracking) {
    path = `orders?select=*&tracking_code=eq.${encodeURIComponent(rawTracking)}&limit=1`;
  } else if (rawId) {
    if (isUuid(rawId)) {
      path = `orders?select=*&id=eq.${encodeURIComponent(rawId)}&limit=1`;
    } else {
      // IMPORTANT: EXO-xxxx codes are NOT UUIDs. Treat non-UUID id values as tracking codes.
      path = `orders?select=*&tracking_code=eq.${encodeURIComponent(rawId)}&limit=1`;
    }
  } else if (email) {
    path = `orders?select=*&customer_email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=${limit}`;
  } else if (phone) {
    path = `orders?select=*&customer_phone=eq.${encodeURIComponent(phone)}&order=created_at.desc&limit=${limit}`;
  }

  const result = await supabaseRest(path);
  return NextResponse.json(result, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const envError = getEnvError();
  if (envError) return NextResponse.json({ data: null, error: envError }, { status: 200 });

  const body = await req.json().catch(() => ({}));
  const id = body?.id;
  const changes = body?.changes || {};

  if (!id || !isUuid(String(id))) {
    return NextResponse.json({ data: null, error: 'Valid UUID order id is required for updates.' }, { status: 200 });
  }

  const result = await supabaseRest(`orders?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });

  return NextResponse.json(result, { status: 200 });
}
