'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Price from '@/components/Price';
import { concentrations, sizes, type ConcentrationOption, type SizeOption } from '@/data/products';
import { getVariantPrice, useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import WishlistButton from '@/components/shop/WishlistButton';
import RecentlyViewed, { rememberViewedProduct } from '@/components/shop/RecentlyViewed';
import ProductGallery from '@/components/shop/ProductGallery';
import StickyMobileAddToCart from '@/components/shop/StickyMobileAddToCart';
import FrequentlyBoughtTogether from '@/components/shop/FrequentlyBoughtTogether';
import SmartRelatedPerfumes from '@/components/shop/SmartRelatedPerfumes';
import { logActivity } from '@/lib/customer-ui-utils';

function StarRating({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 5));
  return (
    <div className="flex items-center gap-1 text-amber-400" aria-label={`Rating ${safeRating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= Math.round(safeRating) ? '★' : '☆'}</span>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = String(params?.id || '');
  const { activeProducts, loading } = useProducts();
  const { addToCart } = useCart();
  const product = useMemo(() => activeProducts.find((p) => p.id === productId), [activeProducts, productId]);
  const [selectedSize, setSelectedSize] = useState<SizeOption>('10ml');
  const [selectedConcentration, setSelectedConcentration] = useState<ConcentrationOption>('EDP');
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    let active = true;
    async function loadReviews() {
      if (!supabase || !productId) return;
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (active) setReviews(data || []);
    }
    loadReviews();
    return () => { active = false; };
  }, [productId]);

  async function submitReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) { setReviewMsg('Reviews need Supabase connection.'); return; }
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      customer_name: String(f.get('customer_name') || 'Customer'),
      customer_email: String(f.get('customer_email') || ''),
      rating: Number(f.get('rating') || 5),
      title: String(f.get('title') || 'Review'),
      body: String(f.get('body') || ''),
      approved: true,
    });
    if (error) { setReviewMsg(error.message); return; }
    setReviewMsg('Thank you! Your review was submitted.');
    (e.currentTarget as HTMLFormElement).reset();
    const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).eq('approved', true).order('created_at', { ascending: false }).limit(8);
    setReviews(data || []);
  }

  useEffect(() => {
    if (productId) rememberViewedProduct(productId);
  }, [productId]);

  const related = useMemo(() => {
    if (!product) return activeProducts.slice(0, 4);
    return activeProducts.filter((p) => p.id !== product.id && p.family === product.family).slice(0, 4);
  }, [activeProducts, product]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#0f0d0a] px-6 py-36 text-white">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/5 p-10 font-black">Loading perfume...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#0f0d0a] px-6 py-36 text-center text-white">
          <h1 className="text-5xl font-black">Perfume not found</h1>
          <p className="mt-4 text-white/60">This product may be hidden or deleted in admin.</p>
          <Link href="/products" className="mt-8 inline-flex rounded-full bg-amber-700 px-7 py-4 font-black text-white">Back to Products</Link>
        </main>
        <Footer />
      </>
    );
  }

  const price = getVariantPrice(product, selectedSize, selectedConcentration);
  const notes = product.notes?.length ? product.notes : product.family ? [product.family] : ['Signature scent'];

  async function handleAdd() {
    const currentProduct = product!;
    const ok = await addToCart(currentProduct.id, selectedSize, selectedConcentration, 1);
    if (!ok) return;
    setAdded(true);
    logActivity({ type: 'cart', title: 'Added to cart', detail: `${currentProduct.name} • ${selectedSize} • ${selectedConcentration}`, amount: price });
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0f0d0a] px-6 py-32 text-white">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-10 flex items-center gap-2 text-xs font-bold text-white/40">
            <Link href="/products" className="hover:text-amber-300">Collections</Link>
            <span>›</span>
            <span className="text-white">{product.name}</span>
          </nav>

          <section className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div className="animate-[fadeIn_.7s_ease-out_both]">
              <ProductGallery product={product as any} />
            </div>

            <div className="animate-[slideUp_.7s_ease-out_.08s_both] lg:pt-5">
              <p className="text-xs font-black uppercase tracking-[.28em] text-amber-400">{product.family}</p>
              <h1 className="mt-3 text-5xl font-black leading-none tracking-tight md:text-7xl">{product.name}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">{product.description || 'A premium fragrance selected for everyday confidence and special moments.'}</p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <StarRating rating={product.rating} />
                <span className="font-black">{Number(product.rating || 5).toFixed(1)}</span>
                <span className="text-white/40">({product.reviews || 0} reviews)</span>
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-200">Stock: {product.stock}</span>
              </div>

              {product.event && <div className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-4 font-bold text-amber-100">{product.event}</div>}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <InfoCard label="Variation" value={selectedConcentration === 'EDP' ? 'Eau de Parfum' : 'Extrait de Parfum'} />
                <InfoCard label="Size" value={selectedSize} />
                <InfoCard label="Scent Family" value={product.family} />
                <InfoCard label="Notes" value={notes.slice(0, 3).join(' · ')} />
              </div>

              <section className="mt-8">
                <p className="mb-3 text-xs font-black uppercase tracking-[.2em] text-white/45">Choose perfume type</p>
                <div className="flex flex-wrap gap-3">
                  {concentrations.map((c) => (
                    <button key={c} type="button" onClick={() => setSelectedConcentration(c)} className={`rounded-full border px-5 py-3 text-sm font-black transition ${selectedConcentration === c ? 'border-amber-400 bg-amber-600 text-white' : 'border-white/15 bg-white/5 text-white hover:border-amber-400/60'}`}>{c}</button>
                  ))}
                </div>
              </section>

              <section className="mt-7">
                <p className="mb-3 text-xs font-black uppercase tracking-[.2em] text-white/45">Choose bottle size</p>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((s) => (
                    <button key={s} type="button" onClick={() => setSelectedSize(s)} className={`rounded-full border px-5 py-3 text-sm font-black transition ${selectedSize === s ? 'border-amber-400 bg-amber-600 text-white' : 'border-white/15 bg-white/5 text-white hover:border-amber-400/60'}`}>{s}</button>
                  ))}
                </div>
              </section>

              <div className="mt-8 flex items-end gap-4">
                <Price amount={price} className="text-5xl font-black" />
                <span className="pb-2 text-sm font-bold text-white/45">{selectedSize} · {selectedConcentration}</span>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <WishlistButton productId={product.id} className="h-14 w-full text-2xl sm:w-16" />
                <button onClick={handleAdd} disabled={product.stock <= 0} className="flex-1 rounded-2xl bg-amber-600 px-7 py-4 font-black text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {added ? 'Added to Cart ✓' : <>Add to Cart — <Price amount={price} /></>}
                </button>
                <Link href="/checkout" className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-center font-black transition hover:bg-white/10">Checkout</Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-white/45">
                <span>🚚 Free shipping on premium orders</span>
                <span>↩️ 30-day returns</span>
                <span>🔒 Secure checkout</span>
              </div>
            </div>
          </section>

          <section className="mt-20 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-10">
            <p className="text-xs font-black uppercase tracking-[.25em] text-amber-400">Fragrance Story</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">{product.hero_title || product.name}</h2>
            <p className="mt-5 max-w-4xl text-lg leading-8 text-white/60">{product.hero_description || product.description || `${product.name} belongs to the ${product.family} family and is crafted for a lasting premium impression.`}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {notes.map((note) => <div key={note} className="rounded-3xl border border-white/10 bg-black/20 p-5"><p className="font-black">{note}</p><p className="mt-1 text-sm text-white/45">Signature note</p></div>)}
            </div>
          </section>


          <section className="mt-20 grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-10">
              <p className="text-xs font-black uppercase tracking-[.25em] text-amber-400">Customer Reviews</p>
              <h2 className="mt-3 text-3xl font-black">What customers say</h2>
              <div className="mt-6 grid gap-4">
                {reviews.length === 0 ? <p className="rounded-3xl bg-black/20 p-5 text-white/60">No customer reviews yet. Be the first to review this perfume.</p> : reviews.map((r) => (
                  <article key={r.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-black">{r.title || 'Customer review'}</p>
                      <StarRating rating={Number(r.rating || 5)} />
                    </div>
                    <p className="mt-1 text-sm text-white/45">{r.customer_name || 'Customer'}</p>
                    <p className="mt-3 leading-7 text-white/65">{r.body}</p>
                  </article>
                ))}
              </div>
            </div>
            <form onSubmit={submitReview} className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8">
              <p className="text-xs font-black uppercase tracking-[.25em] text-amber-400">Leave a review</p>
              <h3 className="mt-3 text-2xl font-black">Rate this perfume</h3>
              <div className="mt-5 grid gap-3">
                <input name="customer_name" required placeholder="Your name" className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4" />
                <input name="customer_email" type="email" placeholder="Email optional" className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4" />
                <select name="rating" className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                  <option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option>
                </select>
                <input name="title" required placeholder="Review title" className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4" />
                <textarea name="body" required placeholder="Your review" className="h-28 rounded-2xl border border-white/10 bg-black/20 px-5 py-4" />
                <button className="rounded-full bg-amber-700 px-6 py-4 font-black text-white">Submit review</button>
                {reviewMsg && <p className="rounded-2xl bg-amber-500/10 p-3 text-sm font-bold text-amber-100">{reviewMsg}</p>}
              </div>
            </form>
          </section>

          <FrequentlyBoughtTogether current={product as any} products={activeProducts as any} />

          <SmartRelatedPerfumes current={product as any} products={activeProducts as any} />

          <RecentlyViewed currentProductId={product.id} />

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="text-3xl font-black">More from {product.family}</h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((p) => <Link key={p.id} href={`/products/${p.id}`} className="group rounded-[2rem] border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:bg-white/10"><div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]"><AppImage src={p.image} alt={p.name} fill sizes="25vw" className="object-cover transition group-hover:scale-105" /></div><p className="mt-4 font-black">{p.name}</p><p className="text-sm text-white/45">{p.family}</p></Link>)}
              </div>
            </section>
          )}
        </div>
      </main>
      <StickyMobileAddToCart price={price} disabled={product.stock <= 0} added={added} onAdd={handleAdd} />
      <Footer />
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">{label}</p><p className="mt-1 text-sm font-black text-white">{value}</p></div>;
}
