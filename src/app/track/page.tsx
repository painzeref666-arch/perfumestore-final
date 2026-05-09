'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const TIMELINE_STEPS = [
  { key: 'placed', label: 'Order placed', help: 'We received your order.' },
  { key: 'payment', label: 'Payment approved', help: 'Payment has been verified.' },
  { key: 'processing', label: 'Preparing order', help: 'Your perfume is being prepared.' },
  { key: 'shipped', label: 'Shipped', help: 'Your order is on the way.' },
  { key: 'delivered', label: 'Delivered', help: 'Order completed.' },
];

function statusLevel(order: any) {
  const status = String(order?.order_status || order?.status || '').toLowerCase();
  const payment = String(order?.payment_status || '').toLowerCase();
  if (status.includes('cancel') || status.includes('reject') || payment.includes('reject') || payment.includes('fail')) return -1;
  if (status.includes('deliver')) return 4;
  if (status.includes('ship')) return 3;
  if (status.includes('process') || status.includes('pack') || status.includes('prepar')) return 2;
  if (status.includes('paid') || status.includes('approve') || payment.includes('paid')) return 1;
  return 0;
}

function formatMoney(value: any) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

function formatDate(value?: string) {
  if (!value) return '';
  try { return new Date(value).toLocaleString(); } catch { return ''; }
}

export default function TrackPage() {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('code') || '';
    if (q) {
      setCode(q);
      search(q);
    }
  }, []);

  async function search(input = code) {
    const safe = input.trim();
    if (!safe) {
      setMessage('Enter your order ID or tracking number.');
      return;
    }
    if (!supabase) {
      setMessage('Supabase is not connected.');
      return;
    }

    setLoading(true);
    setMessage('Searching order...');
    setOrder(null);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`tracking_code.eq.${safe},tracking_number.eq.${safe},id.eq.${safe}`)
      .maybeSingle();

    setLoading(false);
    if (error) setMessage(error.message);
    else if (!data) setMessage('Order not found. Please check your tracking code or order ID.');
    else {
      setOrder(data);
      setMessage('');
    }
  }

  const current = useMemo(() => statusLevel(order), [order]);
  const isProblem = current < 0;
  const total = Number(order?.total || order?.grand_total || Number(order?.subtotal || 0) + Number(order?.shipping_fee || 0));

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-4 py-10 text-stone-950 dark:bg-[#0f0d0a] dark:text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-bold text-amber-800 dark:text-amber-300">← Back home</Link>
        <div className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.3em] text-amber-700 dark:text-amber-300">Exousia & Co.</p>
          <h1 className="mt-3 text-4xl font-black sm:text-6xl">Track your order</h1>
          <p className="mt-3 max-w-2xl text-stone-600 dark:text-white/60">Enter your order ID, tracking code, or courier tracking number to see the latest shipping timeline.</p>

          <div className="mt-8 flex flex-col gap-3 rounded-[1.5rem] bg-stone-50 p-3 dark:bg-black/30 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') search(); }}
              placeholder="Order ID or tracking number"
              className="min-w-0 flex-1 rounded-full border border-stone-200 bg-white px-5 py-3 font-bold outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/30"
            />
            <button onClick={() => search()} disabled={loading} className="rounded-full bg-amber-700 px-7 py-3 font-black text-white disabled:opacity-60">
              {loading ? 'Searching...' : 'Track order'}
            </button>
          </div>

          {message && <p className="mt-5 rounded-2xl bg-amber-100 p-4 font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">{message}</p>}
        </div>

        {order && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-stone-400">Order #{String(order.id || '').slice(0, 8)}</p>
                  <h2 className="mt-2 text-3xl font-black">{isProblem ? 'Order needs attention' : `Status: ${order.order_status || order.status || 'new'}`}</h2>
                </div>
                <span className={`rounded-full px-4 py-2 text-xs font-black uppercase ${isProblem ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>{order.payment_status || 'Pending payment'}</span>
              </div>

              {isProblem ? (
                <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
                  <p className="font-black">This order is cancelled/rejected or payment needs review.</p>
                  <p className="mt-1 text-sm opacity-80">Please contact Exousia & Co. support for assistance.</p>
                </div>
              ) : (
                <div className="mt-10 space-y-4">
                  {TIMELINE_STEPS.map((step, index) => {
                    const done = index <= current;
                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${done ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400 dark:bg-white/10'}`}>{done ? '✓' : index + 1}</div>
                          {index < TIMELINE_STEPS.length - 1 && <div className={`h-12 w-1 ${index < current ? 'bg-emerald-600' : 'bg-stone-200 dark:bg-white/10'}`} />}
                        </div>
                        <div className="pb-5">
                          <p className="font-black">{step.label}</p>
                          <p className="text-sm text-stone-500 dark:text-white/50">{step.help}</p>
                          {index === 0 && <p className="mt-1 text-xs text-stone-400">{formatDate(order.created_at)}</p>}
                          {index === 1 && (order.approved_at || order.paid_at) && <p className="mt-1 text-xs text-stone-400">{formatDate(order.approved_at || order.paid_at)}</p>}
                          {index === 3 && order.shipped_at && <p className="mt-1 text-xs text-stone-400">{formatDate(order.shipped_at)}</p>}
                          {index === 4 && order.delivered_at && <p className="mt-1 text-xs text-stone-400">{formatDate(order.delivered_at)}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">Shipping details</p>
                <div className="mt-4 space-y-3 text-sm">
                  <Info label="Courier" value={order.courier_name || order.shipping_method || 'To be updated'} />
                  <Info label="Tracking number" value={order.tracking_number || order.tracking_code || 'Pending'} />
                  <Info label="Estimated delivery" value={order.estimated_delivery || 'To be updated'} />
                  <Info label="Delivery notes" value={order.delivery_notes || order.admin_notes || 'No notes yet.'} />
                </div>
              </div>

              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">Order summary</p>
                <div className="mt-4 space-y-3 text-sm">
                  <Info label="Customer" value={order.customer_name || order.customer?.name || order.customer?.first_name || 'Customer'} />
                  <Info label="Email" value={order.customer_email || order.customer?.email || 'Not saved'} />
                  <Info label="Phone" value={order.customer_phone || order.customer?.phone || 'Not saved'} />
                  <Info label="Payment" value={order.payment_status || 'Pending'} />
                  <div className="rounded-2xl bg-stone-50 p-4 dark:bg-black/20"><p className="text-stone-500 dark:text-white/50">Total</p><p className="text-2xl font-black">{formatMoney(total)}</p></div>
                </div>
                <Link href={`/invoice/${order.id}`} className="mt-5 inline-flex w-full justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-black dark:border-white/10">View invoice</Link>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return <div className="rounded-2xl bg-stone-50 p-4 dark:bg-black/20"><p className="text-stone-500 dark:text-white/50">{label}</p><p className="mt-1 break-words font-black">{value}</p></div>;
}
