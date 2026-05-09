'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { isSupabaseConfigured, supabase, withTimeout } from '@/lib/supabase';
import { currency, nextTier, pointsFromSpend, tierForPoints } from '@/lib/free-feature-utils';

type Order = { id: string; total?: number; total_price?: number; grand_total?: number; payment_status?: string; order_status?: string; created_at?: string };

export default function RewardsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setMessage('');
      try {
        if (!isSupabaseConfigured || !supabase) throw new Error('Rewards can still be shown, but Supabase is not connected.');
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData.user?.email || '';
        setEmail(userEmail);
        if (!userEmail) throw new Error('Login to view your personal rewards.');
        const { data, error } = await withTimeout(
          supabase.from('orders').select('*').eq('customer_email', userEmail).order('created_at', { ascending: false }).limit(50),
          10000,
          'Rewards orders lookup'
        );
        if (error) throw error;
        if (active) setOrders((data || []) as Order[]);
      } catch (err: any) {
        if (active) setMessage(err?.message || 'Unable to load rewards yet.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const paidOrders = useMemo(() => orders.filter((o) => String(o.payment_status || '').toLowerCase() === 'paid' || String(o.order_status || '').toLowerCase() === 'delivered'), [orders]);
  const totalSpend = paidOrders.reduce((sum, o) => sum + Number(o.grand_total || o.total_price || o.total || 0), 0);
  const points = pointsFromSpend(totalSpend);
  const tier = tierForPoints(points);
  const next = nextTier(points);
  const progress = next ? Math.min(100, Math.round((points / next.min) * 100)) : 100;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fbf7ef] px-6 py-32 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[.3em] text-amber-700">Free loyalty system</p>
          <h1 className="mt-4 text-5xl font-black md:text-7xl">Exousia Rewards</h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-600 dark:text-white/60">Reward points are estimated from paid orders. No third-party app needed.</p>

          {message && <p className="mt-6 rounded-2xl bg-amber-100 p-4 font-bold text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">{message}</p>}

          <section className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
            <div className="rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-black uppercase tracking-widest text-stone-400">Current tier</p>
              <h2 className="mt-3 text-5xl font-black text-amber-800">{tier.name}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-stone-100 p-5 dark:bg-white/10"><p className="text-xs font-black uppercase text-stone-500">Points</p><p className="mt-2 text-3xl font-black">{points}</p></div>
                <div className="rounded-3xl bg-stone-100 p-5 dark:bg-white/10"><p className="text-xs font-black uppercase text-stone-500">Paid Spend</p><p className="mt-2 text-3xl font-black">{currency(totalSpend)}</p></div>
                <div className="rounded-3xl bg-stone-100 p-5 dark:bg-white/10"><p className="text-xs font-black uppercase text-stone-500">Paid Orders</p><p className="mt-2 text-3xl font-black">{paidOrders.length}</p></div>
              </div>
              <div className="mt-8">
                <div className="flex justify-between text-sm font-bold text-stone-500"><span>{tier.name}</span><span>{next ? `${next.min - points} pts to ${next.name}` : 'Top tier reached'}</span></div>
                <div className="mt-3 h-4 overflow-hidden rounded-full bg-stone-100 dark:bg-white/10"><div className="h-full rounded-full bg-amber-700" style={{ width: `${progress}%` }} /></div>
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-stone-950 p-8 text-white">
              <p className="text-sm font-black uppercase tracking-widest text-white/40">Perks</p>
              <ul className="mt-5 space-y-3">
                {tier.perks.map((perk) => <li key={perk} className="rounded-2xl bg-white/10 p-4 font-bold">✓ {perk}</li>)}
              </ul>
              <Link href="/products" className="mt-6 inline-flex rounded-full bg-amber-700 px-6 py-3 font-black text-white">Shop to earn points</Link>
            </div>
          </section>

          <section className="mt-8 rounded-[2.5rem] border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-black">Recent qualifying orders</h2>
            {loading ? <p className="mt-4 font-bold">Loading rewards...</p> : paidOrders.length ? (
              <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-stone-500"><th className="p-3">Date</th><th className="p-3">Order</th><th className="p-3 text-right">Spend</th><th className="p-3 text-right">Points</th></tr></thead><tbody>{paidOrders.slice(0, 10).map((o) => { const spend = Number(o.grand_total || o.total_price || o.total || 0); return <tr key={o.id} className="border-t border-stone-100 dark:border-white/10"><td className="p-3">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}</td><td className="p-3 font-bold">{o.id}</td><td className="p-3 text-right font-black">{currency(spend)}</td><td className="p-3 text-right font-black">{pointsFromSpend(spend)}</td></tr>; })}</tbody></table></div>
            ) : <p className="mt-4 text-stone-500 dark:text-white/50">No paid orders found yet for {email || 'this account'}.</p>}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
