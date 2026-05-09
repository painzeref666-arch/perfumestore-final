'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { isSupabaseConfigured, supabase, withTimeout } from '@/lib/supabase';
import { getCustomerEmail, getCustomerName, getCustomerPhone, notificationTemplates, type InvoiceOrder } from '@/lib/order-utils';

export default function AdminNotificationsPage() {
  const [orders, setOrders] = useState<InvoiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not connected.');
        const { data, error } = await withTimeout(supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(15), 10000, 'Notification orders');
        if (error) throw error;
        if (active) setOrders((data || []) as InvoiceOrder[]);
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed to load orders.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('Copy failed. Please select and copy manually.');
    }
  }

  function mailto(order: InvoiceOrder, subject: string, body: string) {
    const email = getCustomerEmail(order);
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function sms(order: InvoiceOrder, body: string) {
    const phone = getCustomerPhone(order).replace(/[^0-9+]/g, '');
    return `sms:${phone}?&body=${encodeURIComponent(body)}`;
  }

  function whatsapp(order: InvoiceOrder, body: string) {
    const phone = getCustomerPhone(order).replace(/[^0-9]/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
  }

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-6 py-10 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="font-black text-amber-700">← Back to Admin</Link>
            <p className="mt-8 text-xs font-black uppercase tracking-[.28em] text-amber-700">Customer notifications</p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">Quick follow-up center</h1>
            <p className="mt-4 max-w-2xl text-stone-600 dark:text-white/60">Manual email, SMS, and WhatsApp message helpers for order updates. This keeps the site safe until you connect a real email provider like Resend or Brevo.</p>
          </div>
          {copied && <span className="rounded-full bg-emerald-100 px-5 py-3 text-sm font-black text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">{copied}</span>}
        </div>

        {error && <p className="mt-6 rounded-2xl bg-red-100 p-4 font-bold text-red-800 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
        {loading ? <p className="mt-8 font-black">Loading recent orders...</p> : <section className="mt-8 grid gap-5">
          {orders.map((order) => <NotificationCard key={order.id || order.tracking_code} order={order} copy={copy} mailto={mailto} sms={sms} whatsapp={whatsapp} />)}
          {!orders.length && <p className="rounded-2xl bg-white p-6 text-stone-500 dark:bg-white/5 dark:text-white/60">No orders found.</p>}
        </section>}
      </div>
    </main>
  );
}

function NotificationCard({ order, copy, mailto, sms, whatsapp }: { order: InvoiceOrder; copy: (text: string, label: string) => void; mailto: (order: InvoiceOrder, subject: string, body: string) => string; sms: (order: InvoiceOrder, body: string) => string; whatsapp: (order: InvoiceOrder, body: string) => string; }) {
  const templates = useMemo(() => notificationTemplates(order), [order]);
  const subject = `Exousia & Co. Order Update ${order.tracking_code || order.id || ''}`;
  const chosen = (order.order_status || order.status || '').toLowerCase() === 'shipped'
    ? templates.shipped
    : (order.order_status || order.status || '').toLowerCase() === 'delivered'
      ? templates.delivered
      : (order.payment_status || '').toLowerCase() === 'paid'
        ? templates.paymentApproved
        : templates.orderPlaced;

  return (
    <article className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-stone-400">Order {order.tracking_code || order.id}</p>
          <h2 className="mt-1 text-2xl font-black">{getCustomerName(order)}</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-white/50">{getCustomerEmail(order) || 'No email'} • {getCustomerPhone(order) || 'No phone'}</p>
        </div>
        <Link href={`/invoice/${order.id || order.tracking_code}`} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-black dark:border-white/10">Open invoice</Link>
      </div>

      <textarea readOnly value={chosen} className="mt-5 h-28 w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm font-bold leading-6 dark:border-white/10 dark:bg-black/20" />

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => copy(chosen, 'Message copied')} className="rounded-full bg-stone-950 px-4 py-2 text-xs font-black text-white dark:bg-amber-700">Copy message</button>
        <a href={mailto(order, subject, chosen)} className="rounded-full bg-blue-700 px-4 py-2 text-xs font-black text-white">Email</a>
        <a href={sms(order, chosen)} className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-black text-white">SMS</a>
        <a href={whatsapp(order, chosen)} target="_blank" className="rounded-full bg-green-700 px-4 py-2 text-xs font-black text-white">WhatsApp</a>
      </div>
    </article>
  );
}
