'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Price from '@/components/Price';
import CurrencySelector from '@/components/CurrencySelector';
import { isSupabaseConfigured, supabase, supabaseConfigError, withTimeout } from '@/lib/supabase';

type OrderRow = {
  id: string;
  created_at?: string;
  customer_name?: string;
  customer_email?: string;
  customer?: any;
  items?: any[];
  total?: number;
  subtotal?: number;
  shipping_fee?: number;
  status?: string;
  order_status?: string;
  payment_status?: string;
};

type ProductRow = {
  id: string;
  name?: string;
  stock?: number;
  active?: boolean;
  price?: number;
  variants?: any[];
  family?: string;
};

function moneyValue(order: OrderRow) {
  return Number(order.total || Number(order.subtotal || 0) + Number(order.shipping_fee || 0) || 0);
}

function orderDate(order: OrderRow) {
  const d = new Date(order.created_at || Date.now());
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function orderItems(order: OrderRow) {
  return Array.isArray(order.items) ? order.items : [];
}

function statusText(order: OrderRow) {
  return String(order.order_status || order.status || 'new').toLowerCase();
}

function paymentText(order: OrderRow) {
  return String(order.payment_status || 'Pending').toLowerCase();
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [eventInquiryCount, setEventInquiryCount] = useState<number | null>(null);
  const [msg, setMsg] = useState('Loading analytics...');
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  async function loadAnalytics() {
    setMsg('Loading analytics...');
    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        setMsg(supabaseConfigError || 'Supabase is not connected.');
        return;
      }

      const since = new Date();
      since.setHours(0, 0, 0, 0);
      since.setDate(since.getDate() - Math.max(range - 1, 0));

      const [ordersResult, productsResult, eventResult] = await Promise.all([
        withTimeout(
          supabase
            .from('orders')
            .select('id, created_at, customer_name, customer_email, customer, items, total, subtotal, shipping_fee, status, order_status, payment_status')
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: false })
            .limit(500),
          30000,
          'Analytics orders load'
        ),
        withTimeout(
          supabase
            .from('products')
            .select('id, name, stock, active, price, variants, family')
            .limit(500),
          30000,
          'Analytics products load'
        ),
        withTimeout(
          supabase
            .from('event_scents_bookings')
            .select('id', { count: 'exact', head: true })
            .in('status', ['Pending Inquiry', 'pending', 'new']),
          30000,
          'Analytics event inquiries load'
        ),
      ]);

      const orderResponse = ordersResult as { data?: unknown; error?: { message?: string } | null };
      const productResponse = productsResult as { data?: unknown; error?: { message?: string } | null };

      if (orderResponse.error || productResponse.error) {
        setMsg(orderResponse.error?.message || productResponse.error?.message || 'Analytics load failed.');
        return;
      }

      setOrders((orderResponse.data || []) as OrderRow[]);
      setProducts((productResponse.data || []) as ProductRow[]);
      setEventInquiryCount(eventResult.error ? null : Number(eventResult.count || 0));
      setMsg('');
    } catch (err: any) {
      setMsg(err?.message || 'Analytics load failed.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const analytics = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + moneyValue(order), 0);
    const paidRevenue = orders.filter((o) => paymentText(o) === 'paid').reduce((sum, order) => sum + moneyValue(order), 0);
    const units = orders.reduce((sum, order) => sum + orderItems(order).reduce((itemSum, item) => itemSum + Number(item.quantity || item.qty || 1), 0), 0);
    const pendingPayments = orders.filter((order) => ['pending', 'for verification', 'cod pending'].includes(paymentText(order))).length;
    const completed = orders.filter((order) => ['delivered', 'completed'].includes(statusText(order))).length;
    const lowStock = products.filter((product) => Number(product.stock || 0) <= 10 && product.active !== false);
    const averageOrder = orders.length ? Math.round(revenue / orders.length) : 0;
    const customers = new Set(orders.map((order) => order.customer_email || order.customer?.email || order.customer_name || order.id).filter(Boolean)).size;

    return { revenue, paidRevenue, units, pendingPayments, completed, lowStock, averageOrder, customers };
  }, [orders, products]);

  const dailySales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - range + 1);
    const bucketSize = range === 90 ? 7 : 1;
    const bucketCount = Math.ceil(range / bucketSize);
    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      const start = new Date(firstDay);
      start.setDate(firstDay.getDate() + index * bucketSize);
      const end = new Date(start);
      end.setDate(start.getDate() + bucketSize - 1);
      if (end > today) end.setTime(today.getTime());
      return {
        key: `${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`,
        label: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0,
      };
    });
    orders.forEach((order) => {
      const date = orderDate(order);
      date.setHours(0, 0, 0, 0);
      const daysFromStart = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);
      const bucketIndex = Math.floor(daysFromStart / bucketSize);
      if (bucketIndex < 0 || bucketIndex >= buckets.length) return;
      buckets[bucketIndex].revenue += moneyValue(order);
      buckets[bucketIndex].orders += 1;
    });
    return buckets;
  }, [orders, range]);

  const bestSellers = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; total: number }>();
    orders.forEach((order) => {
      orderItems(order).forEach((item) => {
        const name = item.name || item.product_name || item.title || item.product_id || 'Perfume';
        const qty = Number(item.quantity || item.qty || 1);
        const total = Number(item.line_total || item.total || item.price || 0) * (Number(item.line_total || item.total) ? 1 : qty);
        const current = map.get(name) || { name, qty: 0, total: 0 };
        current.qty += qty;
        current.total += total;
        map.set(name, current);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [orders]);

  const maxDailyRevenue = Math.max(...dailySales.map((day) => day.revenue), 1);

  return (
    <main className="admin-analytics min-h-screen overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-b border-stone-200 pb-7 dark:border-white/10 md:flex-row md:items-end">
          <div>
            <Link href="/admin" className="admin-back-link text-sm font-semibold">← Back to admin</Link>
            <p className="mt-7 text-[11px] font-bold uppercase tracking-[.28em] text-amber-800 dark:text-amber-200">Exousia &amp; Co. · Store overview</p>
            <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Analytics &amp; sales</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-white/65">A clear view of revenue, orders, customer activity, and inventory that needs attention.</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
            <CurrencySelector />
            {[7, 30, 90].map((days) => (
              <button key={days} aria-pressed={range === days} onClick={() => setRange(days)} className={`analytics-range rounded-full px-4 py-2.5 text-sm font-semibold transition sm:px-5 ${range === days ? 'analytics-range-active' : ''}`}>Last {days} days</button>
            ))}
            <button onClick={loadAnalytics} disabled={loading} className="analytics-refresh rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60">{loading ? 'Loading…' : 'Refresh data'}</button>
          </div>
        </div>

        {msg && <p role={msg.includes('Loading') ? 'status' : 'alert'} className={`mt-6 rounded-2xl border p-4 text-sm font-semibold ${msg.includes('Loading') ? 'analytics-message-loading' : 'analytics-message-error'}`}>{msg}</p>}

        <section className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Key sales metrics">
          <Stat label="Gross sales" value={<Price amount={analytics.revenue} />} detail={`${orders.length} orders in this period`} />
          <Stat label="Paid sales" value={<Price amount={analytics.paidRevenue} />} detail="Payments marked as paid" />
          <Stat label="Average order" value={<Price amount={analytics.averageOrder} />} detail="Average gross order value" />
          <Stat label="Units sold" value={analytics.units} detail={`${analytics.customers} customers`} />
          <Stat label="Orders to review" value={analytics.pendingPayments} detail="Pending payment checks" />
          <Stat label="Completed orders" value={analytics.completed} detail="Delivered or completed" />
          <Stat label="Low stock" value={analytics.lowStock.length} detail="10 or fewer units" />
          <Stat label="Active products" value={products.filter((product) => product.active !== false).length} detail={`${products.length} catalog items total`} />
        </section>

        <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(290px,.7fr)]">
          <div className="analytics-panel min-w-0 rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold">Sales over time</h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-white/55">Gross order value for the selected period.</p>
              </div>
              <p className="analytics-period rounded-full px-3 py-2 text-xs font-semibold">{range === 90 ? '13 weekly totals' : `${dailySales.length} daily totals`}</p>
            </div>
            <div className="analytics-chart relative mt-6 rounded-2xl border px-3 pb-3 pt-4 sm:px-4">
              <div className="pointer-events-none absolute inset-x-4 top-1/4 border-t border-dashed border-stone-200 dark:border-white/10" />
              <div className="pointer-events-none absolute inset-x-4 top-2/4 border-t border-dashed border-stone-200 dark:border-white/10" />
              <div className="pointer-events-none absolute inset-x-4 top-3/4 border-t border-dashed border-stone-200 dark:border-white/10" />
              <div className="relative grid h-56 items-end gap-1 sm:h-64 sm:gap-1.5" style={{ gridTemplateColumns: `repeat(${dailySales.length}, minmax(0, 1fr))` }}>
                {dailySales.map((day, index) => (
                  <div key={day.key} className="relative flex h-full min-w-0 items-end justify-center" title={`${day.label}: ₱${day.revenue.toLocaleString()} · ${day.orders} orders`}>
                    <div className={`analytics-bar w-full rounded-t-md transition-all ${day.revenue > 0 ? 'analytics-bar-active' : 'analytics-bar-empty'}`} style={{ height: `${day.revenue > 0 ? Math.max(10, (day.revenue / maxDailyRevenue) * 192) : 4}px` }} />
                    {dailySales.length <= 13 || index === 0 || index === dailySales.length - 1 || index % 5 === 0 ? <span className="absolute -bottom-7 max-w-full truncate text-[9px] font-medium text-stone-500 dark:text-white/50">{day.label}</span> : null}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-between text-xs font-medium text-stone-500 dark:text-white/45"><span>Orders in period: {orders.length}</span><span>Peak: <Price amount={maxDailyRevenue} className="font-semibold" /></span></div>
              {!loading && orders.length === 0 && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="rounded-full border border-stone-200 bg-white/90 px-4 py-2 text-sm font-medium text-stone-600 shadow-sm dark:border-white/10 dark:bg-[#171315]/90 dark:text-white/65">No orders in this date range</span></div>}
            </div>
          </div>

          <div className="analytics-action-panel min-w-0 rounded-3xl p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-amber-800 dark:text-amber-200">Needs attention</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold">Action list</h2>
            <div className="mt-5 space-y-3">
              <Action label="Verify payments" value={analytics.pendingPayments} href="/admin" />
              <Action label="Restock low-stock products" value={analytics.lowStock.length} href="/admin/inventory-logs" />
              <Action label="Review Event Scents inquiries" value={eventInquiryCount} href="/admin/event-scents" />
            </div>
            <p className="mt-5 text-xs leading-5 text-white/55">Counts are based on the current order and product data.</p>
            <Link href="/admin" className="analytics-admin-link mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">Open admin tools <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-2">
          <div className="analytics-panel min-w-0 rounded-3xl p-4 sm:p-6">
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-800 dark:text-amber-200">Product performance</p><h2 className="mt-2 font-serif text-2xl font-semibold">Best sellers</h2></div></div>
            <div className="mt-5 space-y-3">
              {bestSellers.map((item, index) => (
                <div key={item.name} className="analytics-row flex items-center justify-between gap-4 rounded-2xl p-3 sm:p-4">
                  <div className="flex min-w-0 items-center gap-3"><span className="analytics-rank grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold">{index + 1}</span><div className="min-w-0"><p className="truncate font-semibold">{item.name}</p><p className="mt-0.5 text-sm text-stone-500 dark:text-white/50">{item.qty} sold</p></div></div>
                  <Price amount={item.total} className="shrink-0 font-semibold" />
                </div>
              ))}
              {bestSellers.length === 0 && <p className="analytics-empty-state rounded-2xl p-5 text-sm leading-6">No sales item data yet. Items from new orders will appear here.</p>}
            </div>
          </div>

          <div className="analytics-panel min-w-0 rounded-3xl p-4 sm:p-6">
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-800 dark:text-amber-200">Inventory</p><h2 className="mt-2 font-serif text-2xl font-semibold">Low stock products</h2></div><Link href="/admin" className="admin-back-link text-sm font-semibold">Manage stock →</Link></div>
            <div className="mt-5 space-y-3">
              {analytics.lowStock.slice(0, 8).map((product) => (
                <div key={product.id} className="analytics-row flex items-center justify-between gap-4 rounded-2xl p-3 sm:p-4">
                  <div className="min-w-0"><p className="truncate font-semibold">{product.name || product.id}</p><p className="mt-0.5 text-sm text-stone-500 dark:text-white/55">{Number(product.stock || 0)} in stock</p></div>
                  <Link href="/admin" className="analytics-edit-link shrink-0 rounded-full px-4 py-2 text-xs font-semibold">Edit</Link>
                </div>
              ))}
              {analytics.lowStock.length === 0 && <p className="analytics-empty-state rounded-2xl p-5 text-sm leading-6">Your active catalog has no low-stock products.</p>}
            </div>
          </div>
        </section>

        <section className="analytics-panel mt-7 rounded-3xl p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-800 dark:text-amber-200">Latest activity</p><h2 className="mt-2 font-serif text-2xl font-semibold">Recent orders</h2></div><span className="text-xs text-stone-500 dark:text-white/45">Showing up to 10 orders</span></div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200 dark:border-white/10">
            <table className="analytics-table w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs uppercase tracking-widest text-stone-500 dark:border-white/10 dark:text-white/45">
                <tr><th className="py-3 pl-4">Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b border-stone-100 last:border-0 dark:border-white/5">
                    <td className="py-4 pl-4 font-semibold">#{order.id.slice(0, 8)}</td>
                    <td>{order.customer_name || order.customer?.name || order.customer_email || order.customer?.email || 'Customer'}</td>
                    <td><Badge>{statusText(order)}</Badge></td>
                    <td><Badge>{paymentText(order)}</Badge></td>
                    <td><Price amount={moneyValue(order)} className="font-semibold" /></td>
                    <td className="pr-4">{orderDate(order).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-stone-500 dark:text-white/50">No orders found in this date range.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, detail }: { label: string; value: ReactNode; detail: string }) {
  return <article className="analytics-stat min-w-0 rounded-2xl p-4 sm:rounded-3xl sm:p-5"><p className="text-xs font-semibold uppercase tracking-[.12em] text-stone-500 dark:text-white/50">{label}</p><p className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p><p className="mt-2 text-xs leading-5 text-stone-500 dark:text-white/45">{detail}</p></article>;
}

function Action({ label, value, href }: { label: string; value: number | null; href: string }) {
  return <Link href={href} className="analytics-action-row flex items-center justify-between gap-3 rounded-2xl px-4 py-4 transition"><span className="text-sm font-medium">{label}</span><span className="grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm font-bold">{value ?? '—'}</span></Link>;
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="analytics-badge rounded-full px-3 py-1 text-xs font-semibold capitalize">{children}</span>;
}
