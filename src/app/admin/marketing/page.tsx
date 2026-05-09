'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import CurrencySelector from '@/components/CurrencySelector';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type Coupon = { id:string; code:string; type:string; value:number; min_subtotal:number; active:boolean; used_count?:number };
type Order = { id:string; customer_email?:string; customer_phone?:string; customer_name?:string; tracking_code?:string; order_status?:string; payment_status?:string };

function messageFor(order: Order) {
  return `Hi ${order.customer_name || 'customer'}, your Exousia & Co. order ${order.tracking_code || order.id} is currently ${order.order_status || 'being processed'}. Thank you for shopping with us.`;
}

export default function MarketingAdminPage(){
  const [coupons,setCoupons]=useState<Coupon[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [msg,setMsg]=useState('Loading marketing tools...');

  async function load(){
    if(!isSupabaseConfigured || !supabase){ setMsg('Supabase is not connected.'); return; }
    const [couponRes, orderRes] = await Promise.all([
      supabase.from('coupons').select('*').order('created_at',{ascending:false}).limit(50),
      supabase.from('orders').select('id, customer_email, customer_phone, customer_name, tracking_code, order_status, payment_status').order('created_at',{ascending:false}).limit(8)
    ]);
    if(couponRes.error){ setMsg(`Coupons table missing or blocked: ${couponRes.error.message}. Run supabase/marketing_growth_upgrade.sql`); } else { setCoupons(couponRes.data||[]); setMsg(''); }
    if(!orderRes.error) setOrders(orderRes.data||[]);
  }
  useEffect(()=>{load()},[]);

  async function saveCoupon(e: FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!supabase) return;
    const f = new FormData(e.currentTarget);
    const payload = { code:String(f.get('code')||'').trim().toUpperCase(), type:String(f.get('type')||'percent'), value:Number(f.get('value')||0), min_subtotal:Number(f.get('min_subtotal')||0), active:true };
    const {error}=await supabase.from('coupons').upsert(payload,{onConflict:'code'});
    setMsg(error ? error.message : `${payload.code} saved.`);
    if(!error){ (e.currentTarget as HTMLFormElement).reset(); load(); }
  }

  async function toggle(c:Coupon){
    if(!supabase) return;
    await supabase.from('coupons').update({active:!c.active}).eq('id',c.id);
    load();
  }

  return <main className="min-h-screen bg-[#0f0d0a] px-4 py-8 text-white sm:px-6">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><Link href="/admin" className="font-bold text-amber-300">← Back to admin</Link><h1 className="mt-4 text-4xl font-black md:text-6xl">Marketing tools</h1><p className="mt-2 text-white/60">Coupons, customer notifications, GCash QR reminder, and growth tools.</p></div>
        <div className="flex flex-wrap gap-3"><CurrencySelector/><Link href="/shipping" className="rounded-full bg-white px-6 py-3 font-black text-stone-950">Shipping calculator</Link></div>
      </div>
      {msg && <p className="mt-6 rounded-2xl bg-amber-500/10 p-4 font-bold text-amber-100">{msg}</p>}
      <section className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <form onSubmit={saveCoupon} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-black uppercase tracking-[.25em] text-amber-400">Coupon system</p><h2 className="mt-2 text-2xl font-black">Create discount code</h2>
          <div className="mt-5 grid gap-3">
            <input name="code" required placeholder="EXOUSIA100" className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4" />
            <select name="type" className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4"><option value="percent">Percent discount</option><option value="fixed">Fixed pesos discount</option></select>
            <input name="value" type="number" required placeholder="10" className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4" />
            <input name="min_subtotal" type="number" placeholder="Minimum subtotal" className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4" />
            <button className="rounded-full bg-amber-700 px-6 py-4 font-black text-white">Save coupon</button>
          </div>
        </form>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-black uppercase tracking-[.25em] text-amber-400">Active codes</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {coupons.map(c=><div key={c.id} className="rounded-2xl bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><p className="text-xl font-black">{c.code}</p><button onClick={()=>toggle(c)} className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">{c.active?'Active':'Off'}</button></div><p className="mt-2 text-sm text-white/60">{c.type === 'percent' ? `${c.value}% off` : `₱${c.value} off`} · min ₱{c.min_subtotal || 0}</p></div>)}
            {coupons.length===0 && <p className="text-white/60">No coupons yet.</p>}
          </div>
        </div>
      </section>
      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-xs font-black uppercase tracking-[.25em] text-amber-400">Customer notifications</p><h2 className="mt-2 text-2xl font-black">Quick email / SMS / WhatsApp follow-up</h2>
        <p className="mt-2 text-white/60">These are safe manual links. Later we can connect real Email/SMS API keys for automatic sending.</p>
        <div className="mt-5 grid gap-3">
          {orders.map(o=>{ const text=messageFor(o); return <div key={o.id} className="rounded-2xl bg-black/20 p-4"><p className="font-black">{o.customer_name || o.customer_email || o.id}</p><p className="mt-1 text-sm text-white/50">{text}</p><div className="mt-3 flex flex-wrap gap-2"><a className="rounded-full bg-white px-4 py-2 text-xs font-black text-stone-950" href={`mailto:${o.customer_email||''}?subject=Exousia%20%26%20Co.%20Order%20Update&body=${encodeURIComponent(text)}`}>Email</a><a className="rounded-full bg-white/10 px-4 py-2 text-xs font-black" href={`sms:${o.customer_phone||''}?&body=${encodeURIComponent(text)}`}>SMS</a><a className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-black text-white" href={`https://wa.me/${String(o.customer_phone||'').replace(/[^0-9]/g,'')}?text=${encodeURIComponent(text)}`} target="_blank">WhatsApp</a></div></div>})}
        </div>
      </section>
    </div>
  </main>
}
