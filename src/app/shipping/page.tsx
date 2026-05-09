'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Price from '@/components/Price';
import { computeShipping } from '@/lib/store-utils';

const regions = ['NCR', 'Luzon', 'Visayas', 'Mindanao'];

export default function ShippingCalculatorPage() {
  const [subtotal, setSubtotal] = useState(999);
  const [region, setRegion] = useState('Luzon');
  const shipping = useMemo(() => computeShipping(Number(subtotal || 0), region), [subtotal, region]);
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0f0d0a] px-6 py-32 text-white">
        <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-10">
          <Link href="/products" className="font-bold text-amber-300">← Back to shop</Link>
          <p className="mt-8 text-xs font-black uppercase tracking-[.25em] text-amber-400">Shipping Fee Calculator</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Estimate delivery cost</h1>
          <p className="mt-4 text-white/60">Free shipping automatically applies on orders ₱3,000 and above.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="font-black">Order subtotal
              <input type="number" min="0" value={subtotal} onChange={(e)=>setSubtotal(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4" />
            </label>
            <label className="font-black">Delivery region
              <select value={region} onChange={(e)=>setRegion(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                {regions.map((r)=><option key={r}>{r}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-8 rounded-[2rem] bg-black/30 p-6">
            <div className="flex items-center justify-between text-lg font-black"><span>Estimated shipping</span><Price amount={shipping} /></div>
            <div className="mt-3 flex items-center justify-between text-white/60"><span>Estimated total</span><Price amount={Number(subtotal || 0) + shipping} /></div>
          </div>
          <Link href="/checkout" className="mt-8 inline-flex rounded-full bg-amber-700 px-7 py-4 font-black text-white">Go to checkout</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
