'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCustomerAddress, getCustomerEmail, getCustomerName, getCustomerPhone, invoiceNumber, money, orderDiscount, orderShipping, orderSubtotal, orderTotal, type InvoiceOrder } from '@/lib/order-utils';

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<InvoiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const id = decodeURIComponent(String(params?.id || ''));

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (active) {
        setError('Invoice request timed out. Please go back to Admin and open the invoice again.');
        setLoading(false);
      }
    }, 8000);

    async function load() {
      setLoading(true);
      setError('');
      try {
        let response = await fetch(`/api/admin/orders?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
        let json = await response.json();
        let foundOrder = Array.isArray(json.data) ? json.data[0] : null;

        if (!foundOrder) {
          response = await fetch(`/api/admin/orders?tracking_code=${encodeURIComponent(id)}`, { cache: 'no-store' });
          json = await response.json();
          foundOrder = Array.isArray(json.data) ? json.data[0] : null;
        }

        if (json.error) throw new Error(json.error);
        if (active) setOrder(foundOrder as InvoiceOrder);
      } catch (err: any) {
        if (active) setError(err?.message || 'Invoice not found.');
      } finally {
        window.clearTimeout(timer);
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [id]);

  const items = Array.isArray(order?.items) ? order!.items : [];

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-950 print:bg-white print:p-0">
      <style>{`@media print {.no-print{display:none!important}.invoice-card{box-shadow:none!important;border:0!important;border-radius:0!important}.print-break{break-inside:avoid}}`}</style>
      <div className="no-print mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-black">← Back to Admin</Link>
        <button onClick={() => window.print()} className="rounded-full bg-stone-950 px-6 py-3 text-sm font-black text-white">Print / Save as PDF</button>
      </div>

      <section className="invoice-card mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-xl print:max-w-none print:p-10">
        {loading ? (
          <p className="font-black">Loading invoice...</p>
        ) : error || !order ? (
          <div className="rounded-2xl bg-red-50 p-6 text-red-800"><h1 className="text-2xl font-black">Invoice unavailable</h1><p className="mt-2 font-bold">{error || 'Order not found.'}</p></div>
        ) : (
          <>
            <header className="flex flex-col justify-between gap-6 border-b border-stone-200 pb-8 md:flex-row">
              <div>
                <p className="text-xs font-black uppercase tracking-[.35em] text-amber-700">Exousia & Co.</p>
                <h1 className="mt-3 text-5xl font-black tracking-tight">Invoice</h1>
                <p className="mt-2 text-stone-500">Luxury inspired perfumes</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-stone-500">Invoice No.</p>
                <p className="text-xl font-black">{invoiceNumber(order)}</p>
                <p className="mt-3 text-sm text-stone-500">Date</p>
                <p className="font-bold">{order.created_at ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </div>
            </header>

            <section className="print-break mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-stone-50 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-stone-400">Bill to</p>
                <h2 className="mt-2 text-xl font-black">{getCustomerName(order)}</h2>
                <p className="mt-2 text-sm text-stone-600">{getCustomerEmail(order)}</p>
                <p className="text-sm text-stone-600">{getCustomerPhone(order)}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{getCustomerAddress(order)}</p>
              </div>
              <div className="rounded-2xl bg-stone-950 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-widest text-white/40">Order details</p>
                <p className="mt-2">Order ID: <span className="font-black">{order.id}</span></p>
                <p>Tracking code: <span className="font-black">{order.tracking_code || 'N/A'}</span></p>
                <p>Courier tracking: <span className="font-black">{order.tracking_number || 'Pending'}</span></p>
                <p>Payment: <span className="font-black">{order.payment_status || 'Pending'}</span></p>
                <p>Status: <span className="font-black">{order.order_status || order.status || 'New'}</span></p>
              </div>
            </section>

            <section className="print-break mt-8 overflow-hidden rounded-2xl border border-stone-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-950 text-white">
                  <tr><th className="p-4">Item</th><th className="p-4">Variant</th><th className="p-4 text-right">Qty</th><th className="p-4 text-right">Amount</th></tr>
                </thead>
                <tbody>
                  {items.map((item: any, index: number) => {
                    const qty = Number(item.quantity || item.qty || 1);
                    const amount = Number(item.line_total || item.total || item.price || item.unit_price || 0) * (item.line_total || item.total ? 1 : qty);
                    return <tr key={index} className="border-b border-stone-100 last:border-0"><td className="p-4 font-black">{item.product_name || item.name || 'Perfume'}</td><td className="p-4 text-stone-500">{[item.size, item.concentration || item.variation].filter(Boolean).join(' · ')}</td><td className="p-4 text-right font-bold">{qty}</td><td className="p-4 text-right font-black">{money(amount)}</td></tr>;
                  })}
                  {!items.length && <tr><td className="p-4 text-stone-500" colSpan={4}>No item details saved.</td></tr>}
                </tbody>
              </table>
            </section>

            <section className="ml-auto mt-8 max-w-sm space-y-3 rounded-2xl bg-stone-50 p-5">
              <div className="flex justify-between"><span>Subtotal</span><strong>{money(orderSubtotal(order))}</strong></div>
              <div className="flex justify-between"><span>Shipping</span><strong>{money(orderShipping(order))}</strong></div>
              <div className="flex justify-between"><span>Discount</span><strong>{money(-orderDiscount(order))}</strong></div>
              <div className="flex justify-between border-t border-stone-200 pt-4 text-2xl font-black"><span>Total</span><span>{money(orderTotal(order))}</span></div>
            </section>

            <footer className="mt-10 border-t border-stone-200 pt-6 text-sm text-stone-500">
              <p className="font-bold text-stone-800">Thank you for shopping with Exousia & Co.</p>
              <p className="mt-1">This invoice is system-generated. Use your browser print dialog and choose “Save as PDF” to download a PDF copy.</p>
            </footer>
          </>
        )}
      </section>
    </main>
  );
}
