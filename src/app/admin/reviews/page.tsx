'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAILS = ['admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [authorized, setAuthorized] = useState(false);

  async function loadReviews() {
    if (!supabase) { setMessage('Supabase is not connected.'); setLoading(false); return; }
    const { data: auth } = await supabase.auth.getUser();
    const email = (auth.user?.email || '').trim().toLowerCase();
    if (!auth.user || !ADMIN_EMAILS.includes(email)) { setMessage('Admin login required. Please sign in through the admin dashboard.'); setLoading(false); return; }
    setAuthorized(true);
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) setMessage(error.message); else setReviews(data || []);
    setLoading(false);
  }

  useEffect(() => { loadReviews(); }, []);

  async function removeReview(review: any) {
    if (!supabase || !authorized) return;
    const confirmed = window.confirm(`Permanently delete this review by ${review.customer_name || 'customer'}?`);
    if (!confirmed) return;
    setMessage('');
    const { error } = await supabase.from('reviews').delete().eq('id', review.id);
    if (error) setMessage(error.message);
    else { setReviews((items) => items.filter((item) => item.id !== review.id)); setMessage('Review deleted.'); }
  }

  async function takeDown(review: any) {
    if (!supabase || !authorized) return;
    const confirmed = window.confirm(`Take down this review by ${review.customer_name || 'customer'}? It will no longer appear publicly.`);
    if (!confirmed) return;
    const { error } = await supabase.from('reviews').update({ approved: false }).eq('id', review.id);
    if (error) setMessage(error.message); else { setReviews((items) => items.map((item) => item.id === review.id ? { ...item, approved: false } : item)); setMessage('Review taken down.'); }
  }

  return <main className="min-h-screen bg-[#F5F0E8] px-4 py-10 text-[#201B16] dark:bg-[#11110F] dark:text-[#F5F0E8] sm:px-6">
    <div className="mx-auto max-w-6xl"><Link href="/admin" className="font-bold text-amber-800 dark:text-[#8A0303]">← Admin dashboard</Link>
      <h1 className="mt-5 text-4xl font-black">Review Management</h1><p className="mt-2 text-stone-600 dark:text-white/60">Published reviews appear immediately. Admins can take down or permanently delete reviews.</p>
      {message && <p role="status" className="mt-4 rounded-xl border border-[#8A0303]/40 bg-[#8A0303]/10 p-3 font-semibold">{message}</p>}
      {loading ? <p className="mt-8">Loading reviews…</p> : reviews.length === 0 ? <p className="mt-8 rounded-2xl border border-[#8A0303]/30 p-6">No reviews found.</p> : <div className="mt-8 grid gap-4">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-[#8A0303]/30 bg-white p-5 shadow-sm dark:bg-white/5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-[#8A0303]">{review.approved ? 'Published' : 'Taken down'} · {review.rating || 5} ★</p><h2 className="mt-2 text-xl font-black">{review.title || 'Untitled review'}</h2><p className="mt-1 font-semibold">{review.customer_name || 'Customer'} · {review.product_id}</p></div><p className="text-sm text-stone-500">{review.created_at ? new Date(review.created_at).toLocaleString() : ''}</p></div>
        <p className="mt-4 whitespace-pre-wrap">{review.body}</p>
        {Array.isArray(review.media_urls) && review.media_urls.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{review.media_urls.map((m: any, i: number) => <a key={i} href={m.url} target="_blank" rel="noreferrer" className="rounded-lg border border-[#8A0303]/40 px-3 py-2 text-sm font-semibold">Open {m.type || 'media'} {i + 1}</a>)}</div>}
        <div className="mt-5 flex flex-wrap gap-2">{review.approved && <button onClick={() => takeDown(review)} className="rounded-full bg-[#8A0303] px-4 py-2 font-bold text-[#201B16]">Take down</button>}<button onClick={() => removeReview(review)} className="rounded-full border border-red-500/50 px-4 py-2 font-bold text-red-700 dark:text-red-300">Delete permanently</button></div>
      </article>)}</div>}
    </div>
  </main>;
}
