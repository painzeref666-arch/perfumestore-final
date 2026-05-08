'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminLogoutPage() {
  useEffect(() => {
    async function doLogout() {
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('exousia-admin-session');
          window.localStorage.removeItem('exousia-admin-session');

          // Clear any older saved keys used by previous builds.
          Object.keys(window.localStorage).forEach((key) => {
            if (key.toLowerCase().includes('admin') || key.toLowerCase().includes('supabase')) {
              window.localStorage.removeItem(key);
            }
          });
          Object.keys(window.sessionStorage).forEach((key) => {
            if (key.toLowerCase().includes('admin') || key.toLowerCase().includes('supabase')) {
              window.sessionStorage.removeItem(key);
            }
          });
        }

        if (supabase) {
          await supabase.auth.signOut();
        }
      } finally {
        window.location.replace('/admin?logout=1');
      }
    }

    doLogout();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080604] px-6 text-white">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">Signing out</p>
        <h1 className="mt-3 text-3xl font-black">Logging out of admin...</h1>
        <p className="mt-3 text-white/60">Please wait while your admin session is cleared.</p>
        <Link href="/admin" className="mt-6 inline-flex rounded-full bg-amber-700 px-6 py-3 font-bold text-white">
          Back to login
        </Link>
      </div>
    </main>
  );
}
