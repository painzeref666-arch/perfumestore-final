'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import CurrencySelector from '@/components/CurrencySelector';
import Price from '@/components/Price';
import { reviews } from '@/data/products';
import { useProducts } from '@/context/ProductContext';
import HomepageVideoBanner from '@/components/shop/HomepageVideoBanner';

const scents = ['Floral', 'Woody', 'Fresh', 'Amber', 'Oud', 'Citrus'];

export default function HomePage() {
  const { activeProducts, loading, error: productsError } = useProducts();
  const featured = useMemo(() => activeProducts.slice(0, 4), [activeProducts]);
  const heroSlides = useMemo(() => {
    const selected = activeProducts
      .filter((p) => p.hero_enabled)
      .sort((a, b) => (a.hero_order || 999) - (b.hero_order || 999));
    return selected.length ? selected : activeProducts.slice(0, 6);
  }, [activeProducts]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroIndex > Math.max(heroSlides.length - 1, 0)) setHeroIndex(0);
  }, [heroIndex, heroSlides.length]);

  const hero = heroSlides[heroIndex] || featured[0];
  const heroImage = hero?.image || 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=1200&auto=format&fit=crop';
  const heroName = hero?.hero_title || hero?.name || 'Velvet Noir';
  const heroDescription = hero?.hero_description || hero?.description || 'Available in 10ml, 15ml, 50ml, and 85ml.';
  const heroButtonText = hero?.hero_button_text || 'View Perfume';
  const customHeroLink = (hero?.hero_button_link || '').trim();
  const heroButtonLink = customHeroLink && !customHeroLink.startsWith('/products/')
    ? customHeroLink
    : (hero?.id ? `/products/${hero.id}` : '/products');
  const goHero = (direction: 'prev' | 'next') => {
    if (heroSlides.length <= 1) return;
    setHeroIndex((current) =>
      direction === 'next'
        ? (current + 1) % heroSlides.length
        : (current - 1 + heroSlides.length) % heroSlides.length
    );
  };

  return (
    <main className="min-h-screen bg-[#fbf7ef] text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
      <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#fbf7ef]/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f0d0a]/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="text-xl font-black tracking-tight">Exousia & Co.</Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-stone-700 dark:text-white/60 md:flex">
            <Link href="/products" className="hover:text-amber-700">Products</Link>
            <a href="#scents" className="hover:text-amber-700">Scents</a>
            <a href="#reviews" className="hover:text-amber-700">Reviews</a>
            <Link href="/admin" className="hover:text-amber-700">Admin</Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block"><CurrencySelector /></div>
            <Link href="/products" className="rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 dark:bg-amber-700">Shop Now</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="relative z-10">
            <p className="mb-4 inline-flex rounded-full border border-amber-800/20 bg-white/60 px-4 py-2 text-sm font-semibold text-amber-900 dark:bg-white/10 dark:text-amber-200">Luxury perfume collection</p>
            <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight md:text-7xl">Find the scent that becomes your signature.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-700 dark:text-white/65">Choose bottle size, EDP or Extrait variation, and preferred currency. Built for a smooth customer shopping experience.</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/products" className="rounded-full bg-amber-800 px-7 py-4 text-center font-bold text-white shadow-xl shadow-amber-900/20 transition hover:-translate-y-1 hover:bg-stone-950">Browse Collection</Link>
              <Link href="/checkout" className="rounded-full border border-stone-300 bg-white/70 px-7 py-4 text-center font-bold text-stone-950 transition hover:-translate-y-1 hover:border-stone-950 dark:border-white/15 dark:bg-white/10 dark:text-white">View Checkout</Link>
            </div>
            <div className="mt-8 block sm:hidden"><CurrencySelector compact /></div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md">
            <div className="rounded-[3rem] border border-white/70 bg-white/50 p-5 shadow-2xl shadow-amber-900/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-stone-950">
                <div className="absolute inset-0 flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
                  {(heroSlides.length ? heroSlides : [hero]).map((slide, index) => (
                    <div key={slide?.id || index} className="relative h-full min-w-full">
                      <AppImage
                        src={slide?.image || heroImage}
                        alt={slide?.name || heroName}
                        fill
                        sizes="(max-width:768px) 100vw,40vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent" />

                {heroSlides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => goHero('prev')}
                      aria-label="Previous featured perfume"
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-xl font-black text-white backdrop-blur transition hover:bg-amber-700"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => goHero('next')}
                      aria-label="Next featured perfume"
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-xl font-black text-white backdrop-blur transition hover:bg-amber-700"
                    >
                      ›
                    </button>
                  </>
                )}

                <div className="absolute bottom-16 left-6 right-6 rounded-3xl bg-white/15 p-5 text-white backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[.25em] text-amber-100">{hero?.hero_badge || hero?.tag || 'Featured'}</p>
                  <h2 className="mt-1 text-3xl font-black">{heroName}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-white/75">{heroDescription}</p>
                  {hero?.id && (
                    <Link href={heroButtonLink} className="mt-4 inline-flex rounded-full bg-amber-700 px-4 py-2 text-xs font-black text-white transition hover:bg-amber-600">
                      {heroButtonText}
                    </Link>
                  )}
                </div>

                {heroSlides.length > 1 && (
                  <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2">
                    {heroSlides.map((slide, index) => (
                      <button
                        key={slide.id || index}
                        type="button"
                        onClick={() => setHeroIndex(index)}
                        aria-label={`Show featured perfume ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${index === heroIndex ? 'w-8 bg-amber-300' : 'w-2.5 bg-white/45 hover:bg-white/75'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-8"><HomepageVideoBanner /></div>

      <section id="products" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-bold uppercase tracking-[.25em] text-amber-800">Featured Collection</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Best-selling perfumes</h2>
            <p className="mt-3 max-w-2xl text-stone-600 dark:text-white/55">This section is now controlled by the Admin Dashboard. Edit product name, image, description, rating, stock, tag, and size/variation prices there.</p>
          </div>
          <CurrencySelector />
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 font-bold dark:border-white/10 dark:bg-white/5">Loading products...</div>
        ) : productsError ? (
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 font-bold text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">{productsError}</div>
        ) : featured.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 font-bold dark:border-white/10 dark:bg-white/5">No active products yet. Add products in the admin dashboard.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => {
              const startPrice = p.variants?.[0]?.prices?.['10ml'] || p.price;
              return (
                <article key={p.id} className="group rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl dark:border-white/10 dark:bg-white/5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-stone-100">
                    <AppImage src={p.image} alt={p.name} fill sizes="(max-width:768px) 100vw,25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">{p.tag || p.promo || 'New'}</span>
                      <span className="text-xs font-black text-amber-500">★ {Number(p.rating || 5).toFixed(1)}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-black">{p.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-stone-600 dark:text-white/55">{p.description || p.notes?.join(', ')}</p>
                    <p className="mt-3 text-xs font-bold text-stone-500 dark:text-white/45">10ml EDP starts at</p>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <Price amount={startPrice} className="text-lg font-black" />
                      <Link href={`/products/${p.id}`} className="rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-800">Choose</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="scents" className="bg-stone-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-[.25em] text-amber-300">Scent Families</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">Shop by mood, personality, and occasion.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {scents.map((s) => <Link key={s} href={`/products?family=${encodeURIComponent(s)}`} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center font-black transition hover:-translate-y-1 hover:bg-amber-700">{s}</Link>)}
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-7xl px-6 py-20">
        <p className="font-bold uppercase tracking-[.25em] text-amber-800">Customer Reviews</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Loved by fragrance buyers.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => <article key={r.name} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"><p className="text-amber-600">{'★'.repeat(r.rating)}</p><p className="mt-4 text-lg font-bold leading-7">“{r.text}”</p><p className="mt-5 text-sm font-black text-stone-500 dark:text-white/50">— {r.name}</p></article>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[3rem] bg-stone-950 p-8 text-center text-white md:p-14">
          <p className="font-bold uppercase tracking-[.25em] text-amber-300">Ready to shop?</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">Pick your size and perfume variation in the collection page.</h2>
          <Link href="/products" className="mt-8 inline-flex rounded-full bg-amber-700 px-8 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-amber-600">Open Products</Link>
        </div>
      </section>
    </main>
  );
}
