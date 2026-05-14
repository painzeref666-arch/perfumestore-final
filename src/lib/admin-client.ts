'use client';

import { supabase } from '@/lib/supabase';

function timeout<T>(promise: PromiseLike<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([Promise.resolve(promise), guard]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});

  if (supabase) {
    const { data } = await timeout(
      supabase.auth.getSession(),
      5000,
      'Admin session check timed out. Please login again.'
    );
    const token = data.session?.access_token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  return timeout(
    fetch(input, { ...init, headers }),
    15000,
    'Admin request timed out. Please refresh and try again.'
  );
}
