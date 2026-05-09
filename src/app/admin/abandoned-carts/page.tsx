'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Snapshot = { date: string; itemCount: number; subtotal: number; items: any[] };

export default function AbandonedCartsPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  useEffect(() => {
    try { setSnapshots(JSON.parse(localStorage.getItem('exousia-abandoned-cart-log') || '[]')); } catch { setSnapshots([]); }
  }, []);
  const clear = () => { localStorage.removeItem('exousia-abandoned-cart-log'); setSnapshots([]); };
  return (
    <main className="min-h-screen bg-[#0f0d0a] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm font-bold text-amber-400">← Back to admin</Link>
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-black uppercase tracking-[.3em] text-amber-400">Free dashboard tool</p><h1 className="mt-3 text-5xl font-black">Abandoned cart reminders</h1><p className="mt-3 max-w-2xl text-white/60">This free version stores cart snapshots in the browser only. Use it as a manual reminder dashboard; no paid third-party app required.</p></div>
          <button onClick={clear} className="rounded-full border border-white/15 px-5 py-3 font-black">Clear local log</button>
        </div>
        <div className="mt-8 grid gap-4">
          {snapshots.length ? snapshots.map((s, i) => <article key={`${s.date}-${i}`} className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="font-black">{s.itemCount} item(s) in cart</p><p className="text-sm text-white/50">{new Date(s.date).toLocaleString()}</p></div><p className="text-2xl font-black text-amber-400">₱{Number(s.subtotal || 0).toLocaleString()}</p></div><div className="mt-4 flex flex-wrap gap-2">{(s.items || []).map((it: any) => <span key={it.key || it.productId} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{it.product?.name || it.productId} × {it.quantity}</span>)}</div></article>) : <p className="rounded-[2rem] bg-white/5 p-8 font-bold text-white/60">No abandoned cart snapshots yet. This will start collecting when a visitor leaves items in cart and comes back later in the same browser.</p>}
        </div>
      </div>
    </main>
  );
}
