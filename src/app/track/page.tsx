'use client';

import Link from 'next/link';
import { useState } from 'react';

type OrderRow = {
  id: string;
  created_at?: string;
  tracking_code?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer?: any;
  payment_status?: string;
  order_status?: string;
  status?: string;
  courier_name?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  delivery_notes?: string;
  total?: number;
  subtotal?: number;
  shipping_fee?: number;
};

function formatMoney(value: any) {
  return `₱${Number(value || 0).toLocaleString('en-PH')}`;
}

function getStatus(order: OrderRow) {
  return String(order.order_status || order.status || 'pending').toLowerCase();
}

const steps = [
  { key: 'pending', label: 'Order placed' },
  { key: 'paid', label: 'Payment approved' },
  { key: 'processing', label: 'Preparing order' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function TrackPage() {
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSearch() {
    const value = search.trim();

    if (!value) {
      setMessage('Please enter your tracking code.');
      return;
    }

    setLoading(true);
    setMessage('');
    setOrders([]);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(`/api/admin/orders?id=${encodeURIComponent(value)}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      const json = await response.json();

      if (json.error) {
        setMessage(json.error);
        return;
      }

      const rows = Array.isArray(json.data) ? json.data : [];

      if (!rows.length) {
        setMessage('No order found for that tracking code.');
        return;
      }

      setOrders(rows);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        setMessage('Tracking request timed out. Please try again.');
      } else {
        setMessage(error?.message || 'Unable to track order right now.');
      }
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0907] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-black text-amber-500">← Back home</Link>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-amber-400">Exousia & Co.</p>
          <h1 className="mt-4 text-5xl font-black">Track your order</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            Enter your tracking code, order ID, email, or phone number to see your order timeline.
          </p>

          <div className="mt-7 flex flex-col gap-3 rounded-3xl bg-black/30 p-3 md:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch();
              }}
              placeholder="Example: EXO-21879318"
              className="min-h-12 flex-1 rounded-full border border-white/10 bg-black px-5 text-sm font-bold text-white outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="rounded-full bg-amber-700 px-8 py-3 text-sm font-black text-white hover:bg-amber-600 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? 'Searching...' : 'Track order'}
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-2xl bg-amber-950/40 p-4 text-sm font-bold text-amber-100">{message}</p>
          )}
        </section>

        <div className="mt-8 space-y-6">
          {orders.map((order) => {
            const current = getStatus(order);
            const total = Number(order.total || order.subtotal || 0) + Number(order.shipping_fee || 0);
            const activeIndex = current === 'delivered'
              ? 4
              : current === 'shipped'
                ? 3
                : current === 'processing'
                  ? 2
                  : current === 'paid' || order.payment_status === 'paid'
                    ? 1
                    : 0;

            return (
              <section key={order.id} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7">
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">Tracking code</p>
                    <h2 className="mt-2 text-3xl font-black">{order.tracking_code || order.id}</h2>
                    <p className="mt-1 text-sm text-white/60">
                      Ordered: {order.created_at ? new Date(order.created_at).toLocaleString() : 'Not saved'}
                    </p>
                  </div>
                  <Link
                    href={`/invoice/${order.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-black"
                  >
                    View invoice
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-5">
                  {steps.map((step, index) => (
                    <div
                      key={step.key}
                      className={`rounded-2xl border p-4 ${
                        index <= activeIndex
                          ? 'border-amber-500/50 bg-amber-950/30 text-amber-100'
                          : 'border-white/10 bg-black/20 text-white/40'
                      }`}
                    >
                      <p className="text-xs font-black uppercase tracking-[0.2em]">Step {index + 1}</p>
                      <p className="mt-2 font-black">{step.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <Info label="Order status" value={order.order_status || order.status || 'Pending'} />
                  <Info label="Payment" value={order.payment_status || 'Pending'} />
                  <Info label="Courier" value={order.courier_name || 'Not assigned yet'} />
                  <Info label="Courier tracking no." value={order.tracking_number || 'Not assigned yet'} />
                  <Info label="Estimated delivery" value={order.estimated_delivery || 'Not set'} />
                  <Info label="Total" value={formatMoney(total)} />
                </div>

                {order.delivery_notes && (
                  <div className="mt-5 rounded-2xl bg-black/30 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Delivery notes</p>
                    <p className="mt-2 font-bold">{order.delivery_notes}</p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl bg-black/25 p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="mt-2 break-words text-lg font-black">{value}</p>
    </div>
  );
}
