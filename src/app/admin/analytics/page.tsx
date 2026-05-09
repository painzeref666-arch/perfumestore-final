'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
  const [msg, setMsg] = useState('Loading analytics...');
  const [range, setRange] = useState(30);

  async function loadAnalytics() {
    setMsg('Loading analytics...');
    try {
      if (!isSupabaseConfigured || !supabase) {
        setMsg(supabaseConfigError || 'Supabase is not connected.');
        return;
      }

      const since = new Date();
      since.setDate(since.getDate() - Math.max(range, 1));

      const [ordersResult, productsResult] = await Promise.all([
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
      ]);

      const orderResponse = ordersResult as { data?: unknown; error?: { message?: string } | null };
      const productResponse = productsResult as { data?: unknown; error?: { message?: string } | null };

      if (orderResponse.error || productResponse.error) {
        setMsg(orderResponse.error?.message || productResponse.error?.message || 'Analytics load failed.');
        return;
      }

      setOrders((orderResponse.data || []) as OrderRow[]);
      setProducts((productResponse.data || []) as ProductRow[]);
      setMsg('');
    } catch (err: any) {
      setMsg(err?.message || 'Analytics load failed.');
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
    const days = Array.from({ length: Math.min(range, 31) }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (Math.min(range, 31) - index - 1));
      const key = date.toISOString().slice(0, 10);
      return { key, label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), revenue: 0, orders: 0 };
    });
    const map = new Map(days.map((day) => [day.key, day]));
    orders.forEach((order) => {
      const key = orderDate(order).toISOString().slice(0, 10);
      const day = map.get(key);
      if (!day) return;
      day.revenue += moneyValue(order);
      day.orders += 1;
    });
    return days;
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
    <main className="min-h-screen bg-[#fbf7ef] px-6 py-12 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link href="/admin" className="font-bold text-amber-800">← Back to admin</Link>
            <h1 className="mt-4 text-5xl font-black">Analytics & Sales Dashboard</h1>
            <p className="mt-2 text-stone-600 dark:text-white/60">Track sales, orders, pending payments, inventory, and best-selling perfumes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CurrencySelector />
            {[7, 30, 90].map((days) => (
              <button key={days} onClick={() => setRange(days)} className={`rounded-full px-5 py-3 font-black ${range === days ? 'bg-amber-700 text-white' : 'border border-stone-300 dark:border-white/10'}`}>Last {days}d</button>
            ))}
            <button onClick={loadAnalytics} className="rounded-full bg-stone-950 px-5 py-3 font-black text-white dark:bg-white dark:text-stone-950">Refresh</button>
          </div>
        </div>

        {msg && <p className="mt-6 rounded-2xl bg-amber-100 p-4 font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">{msg}</p>}

        <section className="mt-8 grid gap-5 md:grid-cols-4 xl:grid-cols-8">
          <Stat label="Gross Sales" value={<Price amount={analytics.revenue} />} />
          <Stat label="Paid Sales" value={<Price amount={analytics.paidRevenue} />} />
          <Stat label="Orders" value={orders.length} />
          <Stat label="Average Order" value={<Price amount={analytics.averageOrder} />} />
          <Stat label="Units Sold" value={analytics.units} />
          <Stat label="Customers" value={analytics.customers} />
          <Stat label="Pending Pay" value={analytics.pendingPayments} />
          <Stat label="Low Stock" value={analytics.lowStock.length} />
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_.8fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Daily sales</h2>
                <p className="text-sm text-stone-500 dark:text-white/50">Bar height is based on daily gross sales.</p>
              </div>
              <p className="rounded-full bg-stone-100 px-4 py-2 text-sm font-black dark:bg-white/10">{dailySales.length} days</p>
            </div>
            <div className="mt-8 flex h-72 items-end gap-2 overflow-x-auto border-b border-stone-200 pb-4 dark:border-white/10">
              {dailySales.map((day) => (
                <div key={day.key} className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2">
                  <div className="text-xs font-bold text-stone-400">{day.orders}</div>
                  <div title={`${day.label}: ₱${day.revenue.toLocaleString()} / ${day.orders} orders`} className="w-full rounded-t-2xl bg-amber-700" style={{ height: `${Math.max(8, (day.revenue / maxDailyRevenue) * 220)}px` }} />
                  <div className="text-[10px] font-bold text-stone-400">{day.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-stone-950 p-6 text-white">
            <h2 className="text-2xl font-black">Action list</h2>
            <div className="mt-5 space-y-3">
              <Action label="Verify payments" value={analytics.pendingPayments} />
              <Action label="Restock low-stock perfumes" value={analytics.lowStock.length} />
              <Action label="Completed orders" value={analytics.completed} />
            </div>
            <Link href="/admin" className="mt-6 inline-block rounded-full bg-amber-700 px-5 py-3 font-black text-white">Open admin tools</Link>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <h2 className="text-2xl font-black">Best sellers</h2>
            <div className="mt-5 space-y-3">
              {bestSellers.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-4 rounded-2xl bg-stone-100 p-4 dark:bg-white/10">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-700 text-sm font-black text-white">{index + 1}</span>
                    <div><p className="font-black">{item.name}</p><p className="text-sm text-stone-500 dark:text-white/50">{item.qty} sold</p></div>
                  </div>
                  <Price amount={item.total} className="font-black" />
                </div>
              ))}
              {bestSellers.length === 0 && <p className="text-stone-500 dark:text-white/50">No sales item data yet. New orders with saved items will appear here.</p>}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <h2 className="text-2xl font-black">Low stock products</h2>
            <div className="mt-5 space-y-3">
              {analytics.lowStock.slice(0, 8).map((product) => (
                <div key={product.id} className="flex justify-between rounded-2xl bg-red-50 p-4 dark:bg-red-500/10">
                  <div><p className="font-black">{product.name || product.id}</p><p className="text-sm text-red-700 dark:text-red-200">Only {Number(product.stock || 0)} left</p></div>
                  <Link href="/admin" className="font-black text-amber-800 dark:text-amber-200">Edit</Link>
                </div>
              ))}
              {analytics.lowStock.length === 0 && <p className="text-stone-500 dark:text-white/50">No low stock products right now.</p>}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
          <h2 className="text-2xl font-black">Recent orders</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs uppercase tracking-widest text-stone-500 dark:border-white/10 dark:text-white/40">
                <tr><th className="py-3">Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b border-stone-100 dark:border-white/5">
                    <td className="py-4 font-black">#{order.id.slice(0, 8)}</td>
                    <td>{order.customer_name || order.customer?.name || order.customer_email || order.customer?.email || 'Customer'}</td>
                    <td><Badge>{statusText(order)}</Badge></td>
                    <td><Badge>{paymentText(order)}</Badge></td>
                    <td><Price amount={moneyValue(order)} className="font-black" /></td>
                    <td>{orderDate(order).toLocaleDateString()}</td>
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

function Stat({ label, value }: { label: string; value: any }) {
  return <div className="rounded-[2rem] bg-white p-5 shadow-sm dark:bg-white/5"><p className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-white/50">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>;
}

function Action({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4"><span className="font-bold text-white/70">{label}</span><span className="text-2xl font-black">{value}</span></div>;
}

function Badge({ children }: { children: any }) {
  return <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black capitalize text-stone-700 dark:bg-white/10 dark:text-white/70">{children}</span>;
}
