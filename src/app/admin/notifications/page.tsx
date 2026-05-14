'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';

type OrderRow = {
  id: string;
  created_at?: string;
  tracking_code?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  order_status?: string;
  status?: string;
  payment_status?: string;
};

export default function NotificationsPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setMessage('');

      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 15000);

      try {
        const response = await adminFetch('/api/admin/orders?limit=20', {
          cache: 'no-store',
          signal: controller.signal,
        });

        const json = await response.json();

        if (!active) return;

        if (json.error) {
          setMessage('Recent orders are temporarily unavailable. You can still manage orders in Admin Dashboard.');
          setOrders([]);
        } else {
          setOrders(json.data || []);
        }
      } catch {
        if (active) {
          setMessage('Recent orders are temporarily unavailable. You can still manage orders in Admin Dashboard.');
          setOrders([]);
        }
      } finally {
        window.clearTimeout(timer);
        if (active) setLoading(false);
      }
    }

    loadOrders();
    return () => { active = false; };
  }, []);

  function mailto(order: OrderRow) {
    const email = order.customer_email || '';
    const subject = encodeURIComponent(`Exousia & Co. order update ${order.tracking_code || order.id}`);
    const body = encodeURIComponent(`Hi ${order.customer_name || 'there'},\n\nHere is an update about your Exousia & Co. order ${order.tracking_code || order.id}.\n\nPayment status: ${order.payment_status || 'Pending'}\nOrder status: ${order.order_status || order.status || 'Pending'}\n\nThank you,\nExousia & Co.`);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  function whatsapp(order: OrderRow) {
    const phone = String(order.customer_phone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hi ${order.customer_name || ''}, update for your Exousia & Co. order ${order.tracking_code || order.id}: ${order.order_status || order.status || 'Pending'}.`);
    return `https://wa.me/${phone}?text=${text}`;
  }

  return (
    <main className="min-h-screen bg-[#0b0907] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm font-black text-amber-500">← Back to Admin</Link>

        <p className="mt-10 text-xs font-black uppercase tracking-[0.4em] text-amber-400">Customer notifications</p>
        <h1 className="mt-4 text-5xl font-black md:text-6xl">Quick follow-up center</h1>
        <p className="mt-4 max-w-3xl text-white/70">
          Manual email, SMS, and WhatsApp message helpers for order updates.
        </p>

        {message && (
          <p className="mt-6 rounded-2xl bg-amber-950/40 p-4 text-sm font-bold text-amber-100">{message}</p>
        )}

        {loading ? (
          <p className="mt-8 rounded-2xl bg-white/[0.06] p-5 font-bold">Loading recent orders...</p>
        ) : orders.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-white/[0.06] p-5 font-bold text-white/70">No recent orders found.</p>
        ) : (
          <div className="mt-8 grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-white/40">Order</p>
                    <h2 className="mt-1 text-2xl font-black">{order.tracking_code || order.id}</h2>
                    <p className="mt-1 text-sm text-white/60">{order.customer_name || 'Customer'} • {order.customer_email || 'No email'} • {order.customer_phone || 'No phone'}</p>
                    <p className="mt-1 text-sm text-white/60">Payment: {order.payment_status || 'Pending'} • Status: {order.order_status || order.status || 'Pending'}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a href={mailto(order)} className="rounded-full bg-amber-700 px-5 py-3 text-sm font-black text-white">Email</a>
                    <a href={whatsapp(order)} target="_blank" className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-white">WhatsApp</a>
                    <Link href={`/invoice/${order.id}`} className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-white">Invoice</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
