'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { isSupabaseConfigured, supabase, withTimeout } from '@/lib/supabase';

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

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginRequired = searchParams.get('loginRequired') === '1';
  const redirectTo = useMemo(() => {
    const value = searchParams.get('redirect') || '/products';
    return value.startsWith('/') && !value.startsWith('//') ? value : '/products';
  }, [searchParams]);
  const ADMIN_EMAILS = ['admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'];
  const isAdminEmail = (value: string) => ADMIN_EMAILS.includes(value.trim().toLowerCase());
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(loginRequired ? 'Please login or create an account before adding items to your cart.' : '');
  const [userEmail, setUserEmail] = useState('');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function ensureCustomerProfile(user: any) {
    if (!supabase || !user?.id) return;

    // Safe best-effort profile creation. If the table policy/schema is not ready,
    // the account still works because Supabase Auth is the source of truth.
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
      // Ignore profile sync errors so customers can still login/signup smoothly.
    }
  }

  async function loadOrdersForEmail(activeEmail: string) {
    if (!supabase || !activeEmail) return setOrders([]);

    // Pull recent orders and filter client-side to support both old and new schemas:
    // old: customer jsonb.email, new: customer_email text.
    const { data } = await withTimeout(
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      6000,
      'Account orders load'
    ).catch(() => ({ data: [] as any[] }));

    const filtered = (data || []).filter((order: OrderRow) => getOrderEmail(order) === activeEmail.toLowerCase());
    setOrders(filtered);
  }

  async function loadSession() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await withTimeout(
      supabase.auth.getUser(),
      5000,
      'Account session check'
    ).catch(() => ({ data: { user: null } as any }));
    const activeEmail = data.user?.email || '';
    
    if (activeEmail && isAdminEmail(activeEmail)) {
      router.replace('/admin');
      return;
    }
setUserEmail(activeEmail);
    if (activeEmail && isAdminEmail(activeEmail)) {
      router.replace('/admin');
      return;
    }

    if (data.user) {
      await ensureCustomerProfile(data.user);
      await loadOrdersForEmail(activeEmail);
    } else {
      setOrders([]);
    }

    setLoading(false);
  }

  // FORCE_ADMIN_REDIRECT_PATCH
  useEffect(() => {
    if (userEmail && isAdminEmail(userEmail)) {
      router.replace('/admin');
    }
  }, [userEmail, router]);

  useEffect(() => {
    const finalAccountLoadingGuard = window.setTimeout(() => {
      setLoading(false);
      setBusy(false);
      setLoading(false);
    }, 4500);

    const accountFallbackTimer = window.setTimeout(() => setLoading(false), 7000);
    loadSession();

    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeEmail = session?.user?.email || '';
      setUserEmail(activeEmail);
    if (activeEmail && isAdminEmail(activeEmail)) {
      router.replace('/admin');
      return;
    }
      if (session?.user) {
        ensureCustomerProfile(session.user);
        loadOrdersForEmail(activeEmail);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    return () => {
      window.clearTimeout(accountFallbackTimer);
      listener.subscription.unsubscribe();
    };
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
    try {
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({ email: email.trim(), password }),
        new Promise<any>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'Login timed out. Please try again.' } }), 8000)
        ),
      ]);

      if (error) {
        if (error.message?.toLowerCase().includes('rate limit')) {
          setMessage('Too many attempts. Please wait 5–10 minutes before trying again.');
        } else {
          setMessage(error.message);
        }
        return;
      }

      const activeEmail = data?.user?.email || email.trim();
      if (activeEmail && isAdminEmail(activeEmail)) {
        router.replace('/admin');
        return;
      }

      if (data?.user) {
        await ensureCustomerProfile(data.user);
        setMessage('Logged in successfully.');
        await loadSession();
        if (loginRequired && typeof window !== 'undefined') window.location.href = redirectTo;
      }
    } catch (err: any) {
      setMessage(err?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
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
    try {
      const { data, error } = await Promise.race([
        supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
            emailRedirectTo: typeof window !== 'undefined'
              ? `${window.location.origin}/account${loginRequired ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`
              : undefined,
          },
        }),
        new Promise<any>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'Account creation timed out. Please try again.' } }), 8000)
        ),
      ]);

      if (error) {
        if (error.message?.toLowerCase().includes('rate limit')) {
          setMessage('Too many signup attempts. Please wait 5–10 minutes before trying again.');
        } else {
          setMessage(error.message);
        }
        return;
      }

      const activeEmail = data?.user?.email || email.trim();
      if (activeEmail && isAdminEmail(activeEmail)) {
        router.replace('/admin');
        return;
      }

      if (data?.user) await ensureCustomerProfile(data.user);

      setMessage(
        data?.session
          ? 'Account created and logged in successfully.'
          : 'Account created. You can now login.'
      );
      await loadSession();
      if (data?.session && loginRequired && typeof window !== 'undefined') window.location.href = redirectTo;
    } catch (err: any) {
      setMessage(err?.message || 'Account creation failed. Please try again.');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }

  async function logout() {
    setSubmitting(true);
    try {
      if (supabase) {
        await Promise.race([
          supabase.auth.signOut(),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]);
      }
    } finally {
      setUserEmail('');
      setOrders([]);
      setEmail('');
      setPassword('');
      setMessage('Logged out successfully.');
      setSubmitting(false);
      setLoading(false);
      if (typeof window !== 'undefined') window.location.href = '/';
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-6 py-16 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="font-bold text-amber-800">← Back home</Link>
        <h1 className="mt-8 text-5xl font-black">Customer account</h1>
        <p className="mt-3 text-stone-600 dark:text-white/60">Create an account, login, and view order history. Admin accounts redirect automatically.</p>
        <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold dark:bg-white/5">
          Status: {isSupabaseConfigured ? 'Supabase ready ✅' : 'Supabase not connected ❌'}
        </p>

        {loading ? (
          <section className="mt-8 max-w-xl rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <p className="font-bold text-stone-500 dark:text-white/60">Checking your account... If this takes too long, refresh and try again.</p>
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

            <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-400/20 dark:bg-amber-500/10"><p className="font-black">Profile editor</p><p className="mt-1 text-sm text-stone-600 dark:text-white/60">Save your delivery details for faster future orders.</p><Link href="/account/profile" className="mt-4 inline-flex rounded-full bg-amber-800 px-5 py-3 text-sm font-black text-white">Edit customer profile</Link></div>

            <h3 className="mt-8 text-2xl font-black">Order history</h3>
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
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
              {orders.length === 0 && <p className="text-stone-500 dark:text-white/50">No orders yet.</p>}
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
              {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}


export default function AccountPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-stone-50 p-8 text-stone-950 dark:bg-[#070604] dark:text-white"><p className="font-bold">Loading account...</p></main>}>
      <AccountPageContent />
    </Suspense>
  );
}
