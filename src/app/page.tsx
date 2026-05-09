'use client';

import Link from 'next/link';
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

export default function HomePage() {
  const { activeProducts } = useProducts();
  const featured = activeProducts.slice(0, 4);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header />
      <main className="min-h-screen bg-[#fbf7ef] pt-28 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
        <section className="relative overflow-hidden px-6 py-16 md:py-24">
          <div className="absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl text-center">
            <p className="inline-flex rounded-full border border-amber-700/30 bg-amber-100/80 px-5 py-2 text-xs font-black uppercase tracking-[.35em] text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">Exousia & Co.</p>
            <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-black leading-tight tracking-tight md:text-7xl">Choose your world of luxury.</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-stone-600 dark:text-white/60">Shop perfumes, cosmetics, and wellness products from one premium ecommerce experience. Each category has its own page, filters, cart, wishlist, reviews, and checkout flow.</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-16 md:grid-cols-3">
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
