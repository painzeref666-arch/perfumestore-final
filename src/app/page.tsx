'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomepageVideoBanner from '@/components/shop/HomepageVideoBanner';
import { useProducts } from '@/context/ProductContext';
import AppImage from '@/components/ui/AppImage';
import Price from '@/components/Price';

const categories = [
  {
    title: 'Perfumes',
    href: '/perfumes',
    eyebrow: 'Signature scents',
    description: 'Luxury-inspired perfumes with size, concentration, wishlist, reviews, and smooth checkout.',
    image: 'https://images.unsplash.com/photo-1594035910663-369b72b7abe2?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Cosmetics',
    href: '/cosmetics',
    eyebrow: 'Beauty essentials',
    description: 'Makeup, glow, skin-prep, and cosmetics products with the same ecommerce flow.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Wellness',
    href: '/wellness',
    eyebrow: 'Self-care rituals',
    description: 'Wellness and body-care essentials for daily balance and premium self-care.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
  },
];

type HomeProduct = ReturnType<typeof useProducts>['activeProducts'][number];

function heroHref(product: HomeProduct) {
  const savedLink = String(product.hero_button_link || '').trim();
  return savedLink || `/products/${product.id}`;
}

function HomepageHeroCarousel({ products }: { products: HomeProduct[] }) {
  const slides = useMemo(() => {
    const enabled = products
      .filter((product) => product.hero_enabled === true)
      .sort((a, b) => Number(a.hero_order || 999) - Number(b.hero_order || 999));

    return (enabled.length ? enabled : products.slice(0, 4)).slice(0, 6);
  }, [products]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <section className="relative overflow-hidden bg-stone-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-black uppercase tracking-[.35em] text-amber-300">Exousia & Co.</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight md:text-7xl">Choose your world of luxury.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">Shop perfumes, cosmetics, and wellness products from one premium ecommerce experience.</p>
          <Link href="/products" className="mt-8 inline-flex rounded-full bg-amber-700 px-7 py-4 font-black text-white transition hover:bg-amber-600">Shop collection</Link>
        </div>
      </section>
    );
  }

  const active = slides[index % slides.length];
  const activeHref = heroHref(active);

  return (
    <section className="relative min-h-[560px] overflow-hidden bg-stone-950 text-white md:min-h-[620px]">
      <div className="absolute inset-0">
        {slides.map((product, slideIndex) => (
          <div
            key={product.id}
            className={`absolute inset-0 transition-opacity duration-700 ${slideIndex === index ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={slideIndex !== index}
          >
            <AppImage
              src={product.image}
              alt={product.name}
              fill
              priority={slideIndex === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/15" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#fbf7ef] to-transparent dark:from-[#0f0d0a]" />
      </div>

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-6 py-16 md:min-h-[620px]">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-amber-300/30 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[.3em] text-amber-200 backdrop-blur">
            {active.hero_badge || active.tag || active.promo || 'Featured'}
          </p>
          <h1 className="mt-6 text-5xl font-black leading-none tracking-tight md:text-7xl">
            {active.hero_title || active.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            {active.hero_description || active.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={activeHref} className="rounded-full bg-amber-700 px-7 py-4 font-black text-white transition hover:bg-amber-600">
              {active.hero_button_text || 'View Product'}
            </Link>
            <Link href="/products" className="rounded-full border border-white/25 bg-black/25 px-7 py-4 font-black text-white backdrop-blur transition hover:bg-white hover:text-stone-950">
              Browse All
            </Link>
            <Price amount={Number(active.salePrice || active.price || 0)} className="text-xl font-black text-amber-100" />
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 p-2 backdrop-blur">
          {slides.map((product, slideIndex) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Show ${product.name}`}
              onClick={() => setIndex(slideIndex)}
              className={`h-2.5 rounded-full transition-all ${slideIndex === index ? 'w-9 bg-amber-300' : 'w-2.5 bg-white/45 hover:bg-white'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const { activeProducts } = useProducts();
  const featured = activeProducts.slice(0, 4);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header />
      <main className="min-h-screen bg-[#fbf7ef] pt-28 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
        <HomepageHeroCarousel products={activeProducts} />

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.href} href={cat.href} className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-stone-950 shadow-2xl shadow-amber-900/10 transition duration-500 hover:-translate-y-2">
              <div className="relative aspect-[4/5]">
                <img src={cat.image} alt={cat.title} className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                  <p className="text-xs font-black uppercase tracking-[.35em] text-amber-200">{cat.eyebrow}</p>
                  <h2 className="mt-3 text-4xl font-black">{cat.title}</h2>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-white/75">{cat.description}</p>
                  <span className="mt-6 inline-flex rounded-full bg-amber-700 px-5 py-3 text-sm font-black text-white transition group-hover:bg-white group-hover:text-stone-950">Open {cat.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <div className="mx-auto max-w-7xl px-6 pb-12"><HomepageVideoBanner /></div>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-black uppercase tracking-[.35em] text-amber-700">Featured products</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">From the Exousia collection</h2>
            </div>
            <Link href="/products" className="rounded-full bg-stone-950 px-6 py-3 text-center font-black text-white transition hover:bg-amber-700 dark:bg-white dark:text-stone-950">View all products</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl dark:border-white/10 dark:bg-white/5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-stone-100">
                  <AppImage src={p.image} alt={p.name} fill sizes="(max-width:768px) 100vw,25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-4">
                  <p className="text-xs font-black uppercase tracking-[.25em] text-amber-700">{p.category || 'perfumes'}</p>
                  <h3 className="mt-2 text-xl font-black">{p.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-stone-600 dark:text-white/55">{p.description}</p>
                  <Price amount={p.price} className="mt-4 block text-lg font-black" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
