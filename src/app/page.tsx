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
    image: '/assets/images/exousia-originals-hero.webp',
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
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#fff7f7] to-transparent dark:from-[#160508]" />
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
  const upcoming = useMemo(
    () => activeProducts
      .filter((product) => product.upcoming_enabled === true)
      .sort((a, b) => Number(a.upcoming_order || 999) - Number(b.upcoming_order || 999)),
    [activeProducts]
  );

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header />
      <main className="min-h-screen bg-[#fff7f7] pt-28 text-stone-950 dark:bg-[#160508] dark:text-white">
        <HomepageHeroCarousel products={activeProducts} />

        <section className="mx-auto grid max-w-7xl items-stretch gap-6 px-6 py-16 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-rose-900/60 bg-[#1b080c] shadow-2xl shadow-amber-900/10 transition duration-500 hover:-translate-y-1 hover:border-rose-700"
            >
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#160508]">
                <img
                  src={cat.image}
                  alt={cat.title === 'Perfumes' ? 'Exousia & Co. Originals perfume collection' : cat.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[.3em] text-rose-200">{cat.eyebrow}</p>
                <h2 className="mt-2 text-3xl font-black">{cat.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-white/75">{cat.description}</p>
                <span className="mt-6 inline-flex w-fit rounded-full bg-rose-700 px-5 py-3 text-sm font-black text-white transition group-hover:bg-white group-hover:text-stone-950">
                  Open {cat.title} <span aria-hidden="true" className="ml-2">→</span>
                </span>
              </div>
            </Link>
          ))}
        </section>

        <div className="mx-auto max-w-7xl px-6 pb-12"><HomepageVideoBanner /></div>

        {upcoming.length > 0 && (
          <section className="relative overflow-hidden border-y border-violet-200/60 bg-gradient-to-br from-[#fff8fb] via-white to-violet-50/70 py-20 dark:border-violet-400/10 dark:from-[#1b070c] dark:via-[#160508] dark:to-[#241027]">
            <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/10" />
            <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-rose-300/20 blur-3xl dark:bg-rose-500/10" />

            <div className="relative mx-auto max-w-7xl px-6">
              <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-px w-10 bg-violet-500" />
                    <p className="text-xs font-black uppercase tracking-[.35em] text-violet-700 dark:text-violet-300">A new chapter is coming</p>
                  </div>
                  <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Coming Soon</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 dark:text-white/60">Discover the next Exousia & Co. creations before they officially arrive. Swipe through the collection to preview what is coming next.</p>
                </div>
                <div className="shrink-0 rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-stone-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white/55">
                  {upcoming.length} {upcoming.length === 1 ? 'upcoming creation' : 'upcoming creations'}
                </div>
              </div>

              <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-5 [scrollbar-width:thin] md:gap-6">
                {upcoming.map((p, index) => {
                  const category = String(p.category || 'other').toLowerCase();
                  const categoryLabel = category === 'perfumes' ? 'Perfumes' : category === 'cosmetics' ? 'Cosmetics' : category === 'wellness' ? 'Wellness' : String(p.category || 'Exousia');
                  const collectionLabel = category === 'perfumes'
                    ? (p.family || 'Signature collection')
                    : category === 'cosmetics'
                      ? 'Beauty collection'
                      : category === 'wellness'
                        ? 'Wellness collection'
                        : `${categoryLabel} collection`;

                  return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group relative flex-none snap-start overflow-hidden rounded-[2rem] border border-violet-200/70 bg-white/90 shadow-lg shadow-violet-900/5 transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-900/10 dark:border-violet-400/15 dark:bg-white/[0.06] sm:w-[330px] lg:w-[360px]"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 dark:bg-black/20">
                      <AppImage
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width:640px) 82vw, (max-width:1024px) 330px, 360px"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-[10px] font-black uppercase tracking-[.22em] text-white backdrop-blur">
                        {p.upcoming_badge || 'Coming Soon'}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[.25em] text-violet-200">{categoryLabel}</p>
                          <h3 className="mt-1 text-2xl font-black leading-tight">{p.name}</h3>
                        </div>
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-black backdrop-blur">#{String(index + 1).padStart(2, '0')}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-black uppercase tracking-[.25em] text-violet-700 dark:text-violet-300">{collectionLabel}</p>
                      <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-stone-600 dark:text-white/55">{p.upcoming_description || p.description}</p>
                      <span className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-stone-200 px-5 py-3 text-sm font-black transition group-hover:border-stone-950 group-hover:bg-stone-950 group-hover:text-white dark:border-white/10 dark:group-hover:border-white dark:group-hover:bg-white dark:group-hover:text-stone-950">View product</span>
                    </div>
                  </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

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
