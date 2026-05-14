'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { useProducts } from '@/context/ProductContext';
import { supabase } from '@/lib/supabase';

export default function ReviewsPage() {
  const { activeProducts } = useProducts();
  const [reviews, setReviews] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    if (!supabase) {
      try {
        setReviews(JSON.parse(localStorage.getItem('exousia-local-reviews') || '[]'));
      } catch {
        setReviews([]);
      }
      return;
    }

    const { data, error } = await supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(50);
    if (error) {
      try {
        setReviews(JSON.parse(localStorage.getItem('exousia-local-reviews') || '[]'));
      } catch {
        setReviews([]);
      }
    } else {
      setReviews(data || []);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('');

    const form = new FormData(e.currentTarget);
    const payload = {
      product_id: String(form.get('product_id') || ''),
      customer_name: String(form.get('customer_name') || ''),
      rating: Number(form.get('rating') || 5),
      title: String(form.get('title') || ''),
      body: String(form.get('body') || ''),
      photo_url: String(form.get('photo_url') || ''),
      approved: true,
      created_at: new Date().toISOString(),
    };

    if (!payload.product_id || !payload.customer_name.trim() || !payload.title.trim() || !payload.body.trim()) {
      setMsg('Please complete your name, review title, and review message before submitting.');
      return;
    }

    if (!supabase) {
      const local = [{ id: crypto.randomUUID(), ...payload }, ...reviews];
      localStorage.setItem('exousia-local-reviews', JSON.stringify(local));
      setReviews(local);
      setMsg('Review saved locally. Connect Supabase reviews table for live storage.');
      e.currentTarget.reset();
      return;
    }

    const { error } = await supabase.from('reviews').insert(payload);
    setMsg(error ? error.message : 'Review submitted.');
    if (!error) {
      e.currentTarget.reset();
      load();
    }
  }

  const productName = (id: string) => activeProducts.find((product) => product.id === id)?.name || 'Exousia product';

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-6 py-16 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/products" className="font-bold text-amber-800">Back to products</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <section>
            <p className="text-xs font-black uppercase tracking-[.3em] text-amber-700">Photo reviews</p>
            <h1 className="mt-3 text-5xl font-black">Customer reviews</h1>
            <p className="mt-4 text-stone-600 dark:text-white/60">Customers can add a photo URL, star rating, and review. This uses Supabase if connected, with a free local fallback.</p>

            <form onSubmit={submit} noValidate className="mt-8 grid gap-4 rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
              <select name="product_id" className="rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20">
                {activeProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
              <input name="customer_name" placeholder="Your name" className="rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
              <select name="rating" className="rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20">
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
              </select>
              <input name="title" placeholder="Review title" className="rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
              <input name="photo_url" placeholder="Optional photo URL" className="rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
              <textarea name="body" placeholder="Your review" className="h-28 rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
              <button type="submit" className="rounded-full bg-amber-800 px-6 py-3 font-black text-white">Submit review</button>
              {msg && <p className="font-bold text-amber-800">{msg}</p>}
            </form>
          </section>

          <section className="grid content-start gap-4">
            {reviews.map((review) => (
              <article key={review.id} className="overflow-hidden rounded-[2rem] bg-white shadow-sm dark:bg-white/5">
                {review.photo_url && (
                  <div className="relative aspect-[16/9] bg-stone-100">
                    <AppImage src={review.photo_url} alt={review.title || 'Customer review photo'} fill sizes="(max-width:768px) 100vw,50vw" className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-700">{productName(review.product_id)}</p>
                  <p className="mt-2 font-black">{review.title} <span className="text-amber-700">Rating {review.rating}</span></p>
                  <p className="mt-1 text-sm text-stone-500 dark:text-white/50">{review.customer_name}</p>
                  <p className="mt-3 text-stone-700 dark:text-white/70">{review.body}</p>
                </div>
              </article>
            ))}
            {!reviews.length && <p className="rounded-[2rem] bg-white p-8 font-bold text-stone-500 dark:bg-white/5 dark:text-white/50">No reviews yet.</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
