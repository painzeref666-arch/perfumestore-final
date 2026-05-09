'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const steps = ['new','paid','processing','packed','shipped','delivered'];

export default function TrackPage() {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(()=>{ const q = new URLSearchParams(location.search).get('code') || ''; if(q){ setCode(q); search(q); } },[]);
  async function search(input = code) {
    setMessage('Searching...'); setOrder(null);
    if (!supabase) return setMessage('Supabase is not connected.');
    const { data, error } = await supabase.from('orders').select('*').or(`tracking_code.eq.${input},id.eq.${input}`).maybeSingle();
    if (error) setMessage(error.message); else if (!data) setMessage('Order not found.'); else { setOrder(data); setMessage(''); }
  }
  const currentStatus = order?.order_status || order?.status || 'new';
  const current = Math.max(0, steps.indexOf(currentStatus));
  return <main className="min-h-screen bg-[#fbf7ef] px-6 py-16 text-stone-950 dark:bg-[#0f0d0a] dark:text-white"><div className="mx-auto max-w-4xl"><Link href="/" className="font-bold text-amber-800">← Back home</Link><h1 className="mt-8 text-5xl font-black">Track your order</h1><div className="mt-8 flex gap-3 rounded-[2rem] bg-white p-4 shadow-sm dark:bg-white/5"><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter tracking code" className="min-w-0 flex-1 rounded-full border border-stone-200 px-5 py-3 dark:border-white/10 dark:bg-black/20"/><button onClick={()=>search()} className="rounded-full bg-amber-800 px-6 py-3 font-black text-white">Track</button></div>{message&&<p className="mt-5 rounded-2xl bg-amber-100 p-4 font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">{message}</p>}{order&&<section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5"><p className="text-sm font-bold uppercase tracking-widest text-amber-800">{order.tracking_code || order.id}</p><h2 className="mt-2 text-3xl font-black">Status: {currentStatus}</h2><div className="mt-8 grid gap-3 sm:grid-cols-6">{steps.map((s,i)=><div key={s} className={`rounded-2xl p-4 text-center font-black ${i<=current?'bg-emerald-600 text-white':'bg-stone-100 text-stone-400 dark:bg-white/10'}`}>{s}</div>)}</div><div className="mt-8 grid gap-4 md:grid-cols-2"><div><p className="font-black">Customer</p><p className="text-stone-600 dark:text-white/60">{order.customer?.first_name} {order.customer?.last_name}<br/>{order.customer?.email}<br/>{order.customer?.phone}</p></div><div><p className="font-black">Total</p><p className="text-2xl font-black">₱{Number(order.total || order.subtotal || 0).toLocaleString()}</p><p className="text-stone-600 dark:text-white/60">Payment: {order.payment_status || 'pending'}</p></div></div></section>}</div></main>;
}
