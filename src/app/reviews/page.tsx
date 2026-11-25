'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { useProducts } from '@/context/ProductContext';
import { supabase } from '@/lib/supabase';

type ReviewMedia = { url: string; type: 'image' | 'video'; name?: string };

export default function ReviewsPage() {
  const { activeProducts } = useProducts();
  const [reviews, setReviews] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  async function load() {
    if (!supabase) {
      try { setReviews(JSON.parse(localStorage.getItem('exousia-local-reviews') || '[]')); } catch { setReviews([]); }
      return;
    }
    const { data, error } = await supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(50);
    if (error) {
      try { setReviews(JSON.parse(localStorage.getItem('exousia-local-reviews') || '[]')); } catch { setReviews([]); }
    } else setReviews(data || []);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let alive = true;
    async function checkAuth() {
      if (!supabase) { if (alive) setAuthChecked(true); return; }
      const { data } = await supabase.auth.getUser();
      if (alive) { setUser(data.user || null); setAuthChecked(true); }
    }
    checkAuth();
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => { setUser(session?.user || null); setAuthChecked(true); });
    return () => { alive = false; listener?.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (showForm) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [showForm]);

  const productName = (id: string) => activeProducts.find((product) => product.id === id)?.name || 'Exousia product';

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files);
    const combined = [...selectedFiles, ...incoming];
    if (combined.length > 5) { setMsg('You can attach up to 5 photos/videos per review.'); return; }
    for (const file of incoming) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) { setMsg('Please select image or video files only.'); return; }
      if (isImage && file.size > 8 * 1024 * 1024) { setMsg('Each image must be 8 MB or smaller.'); return; }
      if (isVideo && file.size > 30 * 1024 * 1024) { setMsg('Each video must be 30 MB or smaller.'); return; }
    }
    setSelectedFiles(combined);
    setMsg('');
  }

  async function uploadMedia(files: File[]): Promise<ReviewMedia[]> {
    if (!files.length) return [];
    if (!supabase) throw new Error('Photo/video uploads require the connected Supabase project.');
    const uploaded: ReviewMedia[] = [];
    for (const file of files) {
      const path = `reviews/${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage.from('review-media').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('review-media').getPublicUrl(path);
      uploaded.push({ url: data.publicUrl, type: file.type.startsWith('video/') ? 'video' : 'image', name: file.name });
    }
    return uploaded;
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg('');
    if (!supabase || !user) { setMsg('Please sign in to submit a review.'); return; }
    // Re-check the active Supabase session at submission time (not just UI state).
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) { setUser(null); setShowForm(false); setMsg('Your session has expired. Please sign in again to submit a review.'); return; }
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const required = ['product_id', 'customer_name', 'title', 'body'];
    if (required.some((key) => !String(form.get(key) || '').trim())) { setMsg('Please complete your product, name, review title, and review message.'); return; }
    setUploading(true);
    try {
      const media = await uploadMedia(selectedFiles);
      const payload: any = {
        product_id: String(form.get('product_id') || ''),
        customer_name: String(form.get('customer_name') || '').trim(),
        rating: Number(form.get('rating') || 5),
        title: String(form.get('title') || '').trim(),
        body: String(form.get('body') || '').trim(),
        media_urls: media,
        user_id: authData.user.id,
        approved: true,
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('reviews').insert(payload);
      if (error) throw error;
      setMsg('Thank you! Your review has been submitted.'); await load();
      formElement.reset(); setSelectedFiles([]); setShowForm(false);
    } catch (error: any) { setMsg(error?.message || 'Could not submit review. Please try again.'); }
    finally { setUploading(false); }
  }

  function mediaFor(review: any): ReviewMedia[] {
    if (Array.isArray(review.media_urls)) return review.media_urls;
    if (review.photo_url) return [{ url: review.photo_url, type: 'image' }];
    return [];
  }

  return (
    <main className="min-h-screen bg-[#F5F0E8] px-5 py-12 text-stone-950 dark:bg-[#11110F] dark:text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link href="/products" className="font-bold text-amber-800 dark:text-[#C5A46D]">← Back to products</Link>
        <header className="mt-8 rounded-[2rem] border border-[#C5A46D]/30 bg-white p-7 shadow-sm dark:bg-white/5 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[.3em] text-amber-700 dark:text-[#C5A46D]">Customer experiences</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Customer Reviews</h1>
          <p className="mt-4 max-w-2xl text-stone-600 dark:text-white/60">Discover fragrance experiences shared by our customers. Reviews may include photos or videos.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#F5F0E8] px-4 py-2 text-sm font-bold dark:bg-white/10">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
            {authChecked && (user ? <button type="button" onClick={() => { setShowForm((v) => !v); setMsg(''); }} className="rounded-full bg-[#C5A46D] px-6 py-3 font-black text-[#201B16] hover:bg-[#B8955D]">{showForm ? 'Close review form' : 'Write a Review'}</button> : <Link href="/account" className="rounded-full bg-[#C5A46D] px-6 py-3 font-black text-[#201B16]">Sign in to write a review</Link>)}
          </div>
        </header>

        {msg && !showForm && <p role="status" className="mt-4 rounded-2xl bg-white p-4 font-semibold text-stone-800 dark:bg-white/10 dark:text-white">{msg}</p>}

        {showForm && user && (
          <form ref={formRef} onSubmit={submit} noValidate className="mt-6 grid gap-4 rounded-[2rem] border border-[#C5A46D]/30 bg-white p-6 shadow-sm dark:bg-white/5 sm:p-8">
            <h2 className="text-2xl font-black">Share your experience</h2>
            <select name="product_id" required className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-stone-900 dark:border-white/10 dark:bg-[#191816] dark:text-white">
              {activeProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <input name="customer_name" required placeholder="Your name" className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-stone-900 dark:border-white/10 dark:bg-[#191816] dark:text-white" />
            <select name="rating" className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-stone-900 dark:border-white/10 dark:bg-[#191816] dark:text-white"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select>
            <input name="title" required placeholder="Review title" className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-stone-900 dark:border-white/10 dark:bg-[#191816] dark:text-white" />
            <textarea name="body" required placeholder="Your review" className="min-h-32 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-stone-900 dark:border-white/10 dark:bg-[#191816] dark:text-white" />
            <div className="rounded-2xl border border-dashed border-[#C5A46D]/60 p-5">
              <label className="block font-bold">Attach photos or video <span className="text-sm font-normal text-stone-500">(up to 5 files)</span></label>
              <p className="mt-1 text-sm text-stone-500 dark:text-white/50">Images: up to 8 MB each. Videos: up to 30 MB each.</p>
              <input type="file" accept="image/*,video/*" multiple onChange={(e) => handleFiles(e.target.files)} className="mt-3 block w-full text-sm" />
              {selectedFiles.length > 0 && <ul className="mt-3 space-y-2 text-sm">{selectedFiles.map((file, i) => <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-2"><span className="truncate">{file.name}</span><button type="button" onClick={() => setSelectedFiles((files) => files.filter((_, index) => index !== i))} className="font-bold text-amber-800 dark:text-[#C5A46D]">Remove</button></li>)}</ul>}
            </div>
            <button disabled={uploading} type="submit" className="rounded-full bg-[#C5A46D] px-6 py-3 font-black text-[#201B16] disabled:opacity-50">{uploading ? 'Uploading & submitting…' : 'Submit review'}</button>
            {msg && <p role="alert" className="font-bold text-amber-800 dark:text-[#C5A46D]">{msg}</p>}
          </form>
        )}

        <section className="mt-8 grid content-start gap-5 sm:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
              {mediaFor(review).length > 0 && <div className="grid gap-2 p-3 sm:grid-cols-2">{mediaFor(review).map((media, i) => media.type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(media.url) ? <video key={i} controls preload="metadata" className="max-h-96 w-full rounded-2xl bg-black" src={media.url} /> : <div key={i} className="relative aspect-video overflow-hidden rounded-2xl bg-stone-100"><AppImage src={media.url} alt={`${review.title || 'Review'} media`} fill sizes="(max-width:768px) 100vw,50vw" className="object-cover" /></div>)}</div>}
              <div className="p-6">
                <p className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-[#C5A46D]">{productName(review.product_id)}</p>
                <p className="mt-2 text-lg font-black">{review.title} <span className="text-amber-700 dark:text-[#C5A46D]">{'★'.repeat(Math.max(1, Math.min(5, Number(review.rating || 5))) )}</span></p>
                <p className="mt-1 text-sm text-stone-500 dark:text-white/50">{review.customer_name}</p>
                <p className="mt-3 whitespace-pre-wrap text-stone-700 dark:text-white/70">{review.body}</p>
              </div>
            </article>
          ))}
          {!reviews.length && !showForm && <div className="rounded-[2rem] border border-[#C5A46D]/30 bg-white p-8 dark:bg-white/5 sm:col-span-2"><h2 className="text-2xl font-black">Be the first to share your fragrance experience.</h2><p className="mt-2 text-stone-600 dark:text-white/60">Your review helps others find their signature scent.</p>{user ? <button type="button" onClick={() => setShowForm(true)} className="mt-5 rounded-full bg-[#C5A46D] px-6 py-3 font-black text-[#201B16]">Write the first review</button> : <Link href="/account" className="mt-5 inline-block rounded-full bg-[#C5A46D] px-6 py-3 font-black text-[#201B16]">Sign in to review</Link>}</div>}
        </section>
      </div>
    </main>
  );
}
