'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [orders, setOrders] = useState<any[]>([]);

  async function loadSession() {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    setUserEmail(data.user?.email || '');
    if (data.user?.email) {
      const { data: orderRows } = await supabase
        .from('orders')
        .select('*')
        .contains('customer', { email: data.user.email })
        .order('created_at', { ascending: false });
      setOrders(orderRows || []);
    }
  }

  useEffect(() => { loadSession(); }, []);

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    if (!supabase) return setMessage('Connect Supabase first.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else { setMessage('Logged in successfully.'); await loadSession(); }
  }

  async function signUp() {
    setMessage('');
    if (!supabase) return setMessage('Connect Supabase first.');
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : 'Account created. Check your email if confirmation is enabled.');
    await loadSession();
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setUserEmail('');
    setOrders([]);
  }

  return <main className="min-h-screen bg-[#fbf7ef] px-6 py-16 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
    <div className="mx-auto max-w-5xl">
      <Link href="/" className="font-bold text-amber-800">← Back home</Link>
      <h1 className="mt-8 text-5xl font-black">Customer account</h1>
      <p className="mt-3 text-stone-600 dark:text-white/60">Create an account, login, and view order history.</p>
      <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold dark:bg-white/5">Status: {isSupabaseConfigured ? 'Supabase ready ✅' : 'Supabase not connected ❌'}</p>

      {userEmail ? <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm text-stone-500 dark:text-white/50">Logged in as</p><h2 className="text-2xl font-black">{userEmail}</h2></div>
          <button onClick={logout} className="rounded-full border border-stone-300 px-6 py-3 font-black dark:border-white/10">Logout</button>
        </div>
        <h3 className="mt-8 text-2xl font-black">Order history</h3>
        <div className="mt-4 space-y-3">
          {orders.map(o=><Link key={o.id} href={`/track?code=${o.tracking_code || o.id}`} className="block rounded-2xl border border-stone-200 p-4 hover:border-amber-700 dark:border-white/10">
            <p className="font-black">{o.tracking_code || o.id}</p><p className="text-sm text-stone-500 dark:text-white/50">Status: {o.status} • Total: ₱{Number(o.total || o.subtotal || 0).toLocaleString()}</p>
          </Link>)}
          {orders.length===0 && <p className="text-stone-500 dark:text-white/50">No orders yet.</p>}
        </div>
      </section> : <form onSubmit={signIn} className="mt-8 max-w-xl rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
        <label className="text-sm font-bold text-stone-500 dark:text-white/50">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
        <label className="mt-5 block text-sm font-bold text-stone-500 dark:text-white/50">Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="mt-2 w-full rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
        {message && <p className="mt-4 rounded-2xl bg-amber-100 p-4 font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">{message}</p>}
        <div className="mt-6 flex gap-3"><button className="rounded-full bg-stone-950 px-6 py-3 font-black text-white dark:bg-amber-700">Login</button><button type="button" onClick={signUp} className="rounded-full border border-stone-300 px-6 py-3 font-black dark:border-white/10">Create account</button></div>
      </form>}
    </div>
  </main>;
}
