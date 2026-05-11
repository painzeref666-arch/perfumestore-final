'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import AdminDashboard from './components/AdminDashboard';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const ADMIN_EMAILS = ['admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'];
const FALLBACK_PASSWORD = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || 'exousia2026';

function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);
  const [email, setEmail] = useState('admin@exousiaandco.com');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        if (typeof window !== 'undefined' && localStorage.getItem('exousia_admin_logged') === '1') {
          if (active) setLogged(true);
          return;
        }
        if (supabase) {
          const result: any = await Promise.race([
            supabase.auth.getUser(),
            new Promise((resolve) => window.setTimeout(() => resolve({ data: { user: null } }), 3500)),
          ]);
          const sessionEmail = result?.data?.user?.email || '';
          if (sessionEmail && isAdminEmail(sessionEmail)) {
            localStorage.setItem('exousia_admin_logged', '1');
            if (active) setLogged(true);
          }
        }
      } catch {
      } finally {
        if (active) setReady(true);
      }
    }
    checkSession();
    return () => { active = false; };
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (!isAdminEmail(cleanEmail)) {
        setMessage('This email is not registered as an admin.');
        return;
      }

      if (password === FALLBACK_PASSWORD) {
        localStorage.setItem('exousia_admin_logged', '1');
        setLogged(true);
        return;
      }

      if (!supabase) {
        setMessage('Supabase is not connected. Use fallback password or check Vercel environment variables.');
        return;
      }

      const result: any = await Promise.race([
        supabase.auth.signInWithPassword({ email: cleanEmail, password }),
        new Promise((resolve) =>
          window.setTimeout(() => resolve({ data: null, error: { message: 'Login timed out. Use fallback password or try again.' } }), 8000)
        ),
      ]);

      if (result?.error) {
        setMessage(`${result.error.message}. You may use fallback admin password if configured.`);
        return;
      }

      const userEmail = result?.data?.user?.email || cleanEmail;
      if (!isAdminEmail(userEmail)) {
        setMessage('This account is not allowed to access admin.');
        return;
      }

      localStorage.setItem('exousia_admin_logged', '1');
      setLogged(true);
    } catch (err: any) {
      setMessage(err?.message || 'Admin login failed.');
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    if (typeof window !== 'undefined') localStorage.removeItem('exousia_admin_logged');
    if (supabase) supabase.auth.signOut();
    setLogged(false);
    setPassword('');
  }

  if (!ready) {
    return <main className="min-h-screen bg-[#0b0907] p-8 text-white"><p className="font-bold">Checking admin access...</p></main>;
  }

  if (logged) return <AdminDashboard onLogout={logout} />;

  return (
    <main className="min-h-screen bg-[#0b0907] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <section>
          <Link href="/" className="text-sm font-black text-amber-500">← Back to store</Link>
          <p className="mt-10 text-xs font-black uppercase tracking-[0.4em] text-amber-400">Admin login</p>
          <h1 className="mt-4 text-6xl font-black leading-none">Secure admin dashboard with database support.</h1>
          <p className="mt-6 text-white/60">Manage products, orders, inventory, promos, and store content securely.</p>
        </section>
        <form onSubmit={login} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8">
          <h2 className="text-3xl font-black">Admin access</h2>
          <p className="mt-2 inline-flex rounded-full bg-emerald-700 px-3 py-1 text-xs font-black">{isSupabaseConfigured ? 'Supabase connected' : 'Supabase not connected'}</p>
          <label className="mt-6 block text-xs font-bold text-white/60">Email</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white px-4 py-4 font-bold text-stone-950 outline-none" />
          <label className="mt-5 block text-xs font-bold text-white/60">Password</label>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-4 font-bold text-white outline-none" />
          {message && <p className="mt-4 rounded-xl bg-red-950/40 p-3 text-sm font-bold text-red-100">{message}</p>}
          <button type="submit" disabled={busy} className="mt-6 w-full rounded-full bg-amber-700 px-6 py-4 font-black hover:bg-amber-600 disabled:cursor-wait disabled:opacity-60">{busy ? 'Checking...' : 'Login as Admin'}</button>
          <p className="mt-4 text-xs font-bold text-white/40">Emergency fallback: admin email + fallback password. Default fallback password is exousia2026 unless changed in Vercel.</p>
        </form>
      </div>
    </main>
  );
}
