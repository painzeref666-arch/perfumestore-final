'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup';

type OrderRow = {
  id: string;
  created_at?: string;
  customer?: any;
  customer_email?: string;
  customer_name?: string;
  total?: number;
  subtotal?: number;
  payment_status?: string;
  order_status?: string;
  status?: string;
  tracking_code?: string;
};

function getOrderEmail(order: OrderRow) {
  return String(order.customer_email || order.customer?.email || '').toLowerCase();
}

function getOrderStatus(order: OrderRow) {
  return order.order_status || order.status || 'pending';
}

function getOrderTotal(order: OrderRow) {
  return Number(order.total || order.subtotal || 0);
}

export default function AccountPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [checkingSession, setCheckingSession] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function ensureCustomerProfile(user: any) {
    if (!supabase || !user?.id) return;
    try {
      await supabase.from('customer_profiles').upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || fullName || '',
          phone: user.user_metadata?.phone || phone || '',
        },
        { onConflict: 'id' }
      );
    } catch {
      // Do not block login/signup if profile sync fails.
    }
  }

  async function loadOrdersForEmail(activeEmail: string) {
    if (!supabase || !activeEmail) {
      setOrders([]);
      return;
    }

    setOrdersLoading(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const filtered = (data || []).filter((order: OrderRow) => getOrderEmail(order) === activeEmail.toLowerCase());
      setOrders(filtered);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadSessionFast() {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    // getSession is faster than getUser because it reads the cached browser session first.
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    const activeEmail = user?.email || '';

    setUserEmail(activeEmail);
    setCheckingSession(false);

    if (user) {
      setEmail(activeEmail);
      ensureCustomerProfile(user);
      loadOrdersForEmail(activeEmail);
    } else {
      setOrders([]);
    }
  }

  useEffect(() => {
    loadSessionFast();

    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      const activeEmail = user?.email || '';

      setUserEmail(activeEmail);
      setCheckingSession(false);

      if (user) {
        setEmail(activeEmail);
        ensureCustomerProfile(user);
        loadOrdersForEmail(activeEmail);
      } else {
        setOrders([]);
      }
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setMessage('');

    if (!supabase) {
      setMessage('Supabase is not connected yet.');
      return;
    }

    setSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

    if (error) {
      setSubmitting(false);
      if (error.message.toLowerCase().includes('rate limit')) {
        setMessage('Too many attempts. Please wait 5–10 minutes before trying again.');
      } else {
        setMessage(error.message);
      }
      return;
    }

    if (data.user) {
      // Instant UI update. Orders/profile load separately in the background.
      const activeEmail = data.user.email || cleanEmail;
      setUserEmail(activeEmail);
      setMessage('Logged in successfully.');
      setSubmitting(false);
      ensureCustomerProfile(data.user);
      loadOrdersForEmail(activeEmail);
      return;
    }

    setSubmitting(false);
  }

  async function signUp() {
    if (submitting) return;
    setMessage('');

    if (!supabase) {
      setMessage('Supabase is not connected yet.');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined,
      },
    });

    if (error) {
      setSubmitting(false);
      if (error.message.toLowerCase().includes('rate limit')) {
        setMessage('Too many signup attempts. Please wait 5–10 minutes before trying again.');
      } else {
        setMessage(error.message);
      }
      return;
    }

    if (data.user) {
      ensureCustomerProfile(data.user);
    }

    if (data.session?.user?.email) {
      setUserEmail(data.session.user.email);
      setMessage('Account created and logged in successfully.');
      loadOrdersForEmail(data.session.user.email);
    } else {
      setMessage('Account created. Please check your email to confirm your account, then login.');
      setMode('login');
    }

    setSubmitting(false);
  }

  async function logout() {
    setSubmitting(true);
    if (supabase) await supabase.auth.signOut();
    setUserEmail('');
    setOrders([]);
    setPassword('');
    setMessage('Logged out successfully.');
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-6 py-16 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="font-bold text-amber-800">← Back home</Link>
        <h1 className="mt-8 text-5xl font-black">Customer account</h1>
        <p className="mt-3 text-stone-600 dark:text-white/60">Create an account, login, and view order history.</p>
        <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold dark:bg-white/5">
          Status: {isSupabaseConfigured ? 'Supabase ready ✅' : 'Supabase not connected ❌'}
        </p>

        {checkingSession ? (
          <section className="mt-8 max-w-xl rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <p className="font-bold text-stone-500 dark:text-white/60">Checking login...</p>
          </section>
        ) : userEmail ? (
          <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500 dark:text-white/50">Logged in as</p>
                <h2 className="text-2xl font-black">{userEmail}</h2>
              </div>
              <button
                onClick={logout}
                disabled={submitting}
                className="rounded-full border border-stone-300 px-6 py-3 font-black transition hover:bg-stone-100 disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/10"
              >
                {submitting ? 'Logging out...' : 'Logout'}
              </button>
            </div>

            <h3 className="mt-8 text-2xl font-black">Order history</h3>
            <div className="mt-4 space-y-3">
              {ordersLoading && <p className="text-stone-500 dark:text-white/50">Loading order history...</p>}
              {!ordersLoading && orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/track?code=${order.tracking_code || order.id}`}
                  className="block rounded-2xl border border-stone-200 p-4 transition hover:border-amber-700 dark:border-white/10"
                >
                  <p className="font-black">{order.tracking_code || order.id}</p>
                  <p className="text-sm text-stone-500 dark:text-white/50">
                    Status: {getOrderStatus(order)} • Payment: {order.payment_status || 'pending'} • Total: ₱{getOrderTotal(order).toLocaleString()}
                  </p>
                </Link>
              ))}
              {!ordersLoading && orders.length === 0 && <p className="text-stone-500 dark:text-white/50">No orders yet.</p>}
            </div>
          </section>
        ) : (
          <form onSubmit={signIn} className="mt-8 max-w-xl rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-full bg-stone-100 p-1 dark:bg-black/30">
              <button
                type="button"
                onClick={() => { setMode('login'); setMessage(''); }}
                className={`rounded-full px-4 py-3 font-black transition ${mode === 'login' ? 'bg-stone-950 text-white dark:bg-amber-700' : 'text-stone-500 dark:text-white/60'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setMessage(''); }}
                className={`rounded-full px-4 py-3 font-black transition ${mode === 'signup' ? 'bg-stone-950 text-white dark:bg-amber-700' : 'text-stone-500 dark:text-white/60'}`}
              >
                Create account
              </button>
            </div>

            {mode === 'signup' && (
              <>
                <label className="text-sm font-bold text-stone-500 dark:text-white/50">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20"
                  placeholder="Juan Dela Cruz"
                />
                <label className="mt-5 block text-sm font-bold text-stone-500 dark:text-white/50">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20"
                  placeholder="09XXXXXXXXX"
                />
              </>
            )}

            <label className="mt-5 block text-sm font-bold text-stone-500 dark:text-white/50">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20"
            />
            <label className="mt-5 block text-sm font-bold text-stone-500 dark:text-white/50">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20"
            />
            {message && (
              <p className="mt-4 rounded-2xl bg-amber-100 p-4 font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
                {message}
              </p>
            )}
            <button
              type={mode === 'login' ? 'submit' : 'button'}
              onClick={mode === 'signup' ? signUp : undefined}
              disabled={submitting}
              className="mt-6 rounded-full bg-stone-950 px-6 py-3 font-black text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-700"
            >
              {submitting ? (mode === 'login' ? 'Logging in...' : 'Creating account...') : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
