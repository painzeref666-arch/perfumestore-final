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
  { title: 'Perfumes', href: '/perfumes', eyebrow: 'Signature scents', description: 'Find a fragrance that feels unmistakably yours.', image: '/assets/images/exousia-originals-hero.webp' },
  { title: 'Cosmetics', href: '/cosmetics', eyebrow: 'Beauty essentials', description: 'Beauty essentials for everyday confidence.', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Wellness', href: '/wellness', eyebrow: 'Self-care rituals', description: 'Thoughtful essentials for moments of care.', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Event Scents', href: '#event-scents', eyebrow: 'A scent experience', description: 'Bring our portable Perfume Bar to your celebration.', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop' },
];

type HomeProduct = ReturnType<typeof useProducts>['activeProducts'][number];
function heroHref(product: HomeProduct) { return String(product.hero_button_link || '').trim() || `/products/${product.id}`; }

function HomepageHeroCarousel({ products }: { products: HomeProduct[] }) {
  const slides = useMemo(() => {
    const enabled = products.filter((p) => p.hero_enabled === true).sort((a, b) => Number(a.hero_order || 999) - Number(b.hero_order || 999));
    return (enabled.length ? enabled : products.slice(0, 4)).slice(0, 6);
  }, [products]);
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [slides.length]);
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => setIndex((n) => (n + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return (
    <section className="relative overflow-hidden bg-[#11110f] px-6 py-24 text-[#f5f0e8] md:py-36">
      <div className="mx-auto max-w-7xl"><p className="text-xs uppercase tracking-[.35em] text-[#c5a46d]">Exousia &amp; Co.</p><h1 className="mt-5 max-w-4xl font-serif text-5xl leading-tight md:text-7xl">The art of personal luxury.</h1><p className="mt-6 max-w-xl text-[#f5f0e8]/70">Fragrance. Beauty. Wellness.</p><Link href="/products" className="mt-8 inline-flex rounded-full bg-[#c5a46d] px-7 py-3.5 font-semibold text-[#171411]">Explore the collection</Link></div>
    </section>
  );
  const active = slides[index % slides.length];
  return (
    <section className="relative isolate min-h-[590px] overflow-hidden bg-[#11110f] text-[#f5f0e8] md:min-h-[680px]">
      <div className="absolute inset-0">
        {slides.map((p, i) => <div key={p.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`} aria-hidden={i !== index}><AppImage src={p.image} alt={p.name} fill priority={i === 0} sizes="100vw" className="object-cover object-center" /></div>)}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090908]/95 via-[#090908]/75 to-[#090908]/20"/><div className="absolute inset-0 bg-gradient-to-t from-[#11110f]/75 via-transparent to-[#11110f]/20"/>
      </div>
      <div className="relative mx-auto flex min-h-[590px] max-w-7xl items-center px-6 py-20 md:min-h-[680px] md:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[.4em] text-[#d6b477]">Exousia &amp; Co.</p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] tracking-wide md:text-7xl">{active.hero_title || active.name}</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/75 md:text-lg">{active.hero_description || active.description || 'Curated fragrances, beauty essentials, and self-care for your everyday elegance.'}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={heroHref(active)} className="rounded-full bg-[#c5a46d] px-7 py-3.5 text-sm font-semibold text-[#171411] transition hover:bg-[#e0c18b]">{active.hero_button_text || 'Discover the scent'} <span aria-hidden="true">→</span></Link>
            <Link href="/products" className="rounded-full border border-[#d6b477]/70 px-7 py-3.5 text-sm font-semibold text-[#f5f0e8] transition hover:bg-white/10">Shop all</Link>
          </div>
          {slides.length > 1 && <div className="mt-12 flex gap-2">{slides.map((p, i) => <button key={p.id} aria-label={`Show ${p.name}`} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-[#c5a46d]' : 'w-2 bg-white/40 hover:bg-white/80'}`}/>)}</div>}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, light = false }: {eyebrow: string; title: string; light?: boolean}) {
  return <div className="mb-9 text-center"><p className={`text-[11px] font-semibold uppercase tracking-[.35em] ${light ? 'text-[#c5a46d]' : 'text-[#9a7543]'}`}>{eyebrow}</p><h2 className={`mt-3 font-serif text-3xl tracking-wide md:text-5xl ${light ? 'text-[#f5f0e8]' : 'text-[#211c17]'}`}>{title}</h2><div className="mx-auto mt-5 h-px w-16 bg-[#c5a46d]"/></div>;
}

export default function HomePage() {
  const { activeProducts } = useProducts();
  const featured = activeProducts.slice(0, 5);
  const upcoming = useMemo(() => activeProducts.filter((p) => p.upcoming_enabled === true).sort((a, b) => Number(a.upcoming_order || 999) - Number(b.upcoming_order || 999)), [activeProducts]);
  return <>
    <div className="grain" aria-hidden="true"/><Header/>
    <main className="min-h-screen bg-[#f5f0e8] pt-28 text-[#211c17] dark:bg-[#11110f] dark:text-[#f5f0e8]">
      <HomepageHeroCarousel products={activeProducts}/>

      {/* Curated shopping paths */}
      <section className="bg-[#171411] px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((cat) => <Link key={cat.title} href={cat.href} className="group relative isolate min-h-[300px] overflow-hidden rounded-2xl border border-[#c5a46d]/20 bg-[#24211e] md:min-h-[330px]">
            <div className="absolute inset-0 -z-10"><img src={cat.image} alt={cat.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10"/></div>
            <div className="flex h-full min-h-[300px] flex-col justify-end p-6 md:min-h-[330px]"><p className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#d6b477]">{cat.eyebrow}</p><h2 className="mt-2 font-serif text-3xl text-white">{cat.title}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-white/75">{cat.description}</p><span className="mt-5 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[.18em] text-[#d6b477]">Explore <span className="transition group-hover:translate-x-1">→</span></span></div>
          </Link>)}
        </div>
      </section>

      {/* Brand promise */}
      <section className="border-y border-[#c5a46d]/25 bg-[#eee5d7] px-5 py-6 text-[#211c17] dark:bg-[#201b16] dark:text-[#f5f0e8]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
          {[['◇','Curated Quality','Thoughtfully selected essentials'],['✧','Beauty & Care','Fragrance, beauty and wellness'],['♧','Delivery Options','Shipping and local delivery'],['☆','Customer Experience','Support throughout your journey']].map(([icon,title,desc])=><div key={title} className="text-center"><span className="text-2xl text-[#b18a50]">{icon}</span><h3 className="mt-2 text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-current/65">{desc}</p></div>)}
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl"><SectionHeading eyebrow="The Exousia Edit" title="Featured Collection"/><div className="mb-7 flex flex-wrap justify-center gap-3"><Link href="/products" className="rounded-full bg-[#211c17] px-5 py-2 text-xs font-semibold text-[#f5f0e8] dark:bg-[#c5a46d] dark:text-[#171411]">Shop all</Link><Link href="/perfumes" className="rounded-full border border-[#c5a46d]/60 px-5 py-2 text-xs font-semibold">Perfumes</Link><Link href="/reviews" className="rounded-full border border-[#c5a46d]/60 px-5 py-2 text-xs font-semibold">Customer reviews</Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{featured.map((p) => <Link key={p.id} href={`/products/${p.id}`} className="group overflow-hidden rounded-2xl border border-[#d6c9b6] bg-white/80 transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#1c1916]"><div className="relative aspect-[4/5] overflow-hidden bg-[#e8dfd2] dark:bg-[#28221d]"><AppImage src={p.image} alt={p.name} fill smartFill sizes="(max-width:768px) 100vw,20vw" className="object-cover transition duration-700 group-hover:scale-105"/></div><div className="p-4"><p className="text-[10px] uppercase tracking-[.25em] text-[#9a7543]">{p.category || 'Collection'}</p><h3 className="mt-2 line-clamp-1 font-serif text-lg">{p.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-current/60">{p.description}</p><Price amount={p.price} className="mt-3 block text-sm font-semibold"/></div></Link>)}</div>
        </div>
      </section>

      {upcoming.length > 0 && <section className="border-y border-[#c5a46d]/20 bg-[#201b16] px-5 py-16 text-[#f5f0e8] md:py-20"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="A new chapter" title="Coming Soon" light/><p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-6 text-white/65">Preview the next creations from Exousia &amp; Co.</p><div className="-mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-5">{upcoming.map((p,i)=><Link key={p.id} href={`/products/${p.id}`} className="group flex-none snap-start overflow-hidden rounded-2xl border border-[#c5a46d]/20 bg-black/20 sm:w-[300px]"><div className="relative aspect-[4/5]"><AppImage src={p.image} alt={p.name} fill smartFill sizes="300px" className="object-cover transition group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/><div className="absolute bottom-4 left-4 text-white"><p className="text-xs uppercase tracking-widest text-[#d6b477]">{p.upcoming_badge || 'Coming soon'}</p><h3 className="mt-2 font-serif text-2xl">{p.name}</h3></div></div><div className="p-4"><p className="line-clamp-2 text-sm text-white/65">{p.upcoming_description || p.description}</p><span className="mt-4 block text-xs uppercase tracking-widest text-[#d6b477]">Preview #{i+1} →</span></div></Link>)}</div></div></section>}

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8"><HomepageVideoBanner/></div>

      {/* Scent discovery */}
      <section className="relative overflow-hidden bg-[#11110f] px-5 py-16 text-[#f5f0e8] md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2"><div><p className="text-xs uppercase tracking-[.35em] text-[#c5a46d]">Discover your scent</p><h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">Find your signature.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-white/70">Not sure where to begin? Explore fragrance families or take the scent quiz to discover fragrances that match your preferences.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/quiz" className="rounded-full bg-[#c5a46d] px-6 py-3 text-sm font-semibold text-[#171411]">Take the Scent Quiz →</Link><Link href="/collections/floral" className="rounded-full border border-[#c5a46d]/60 px-6 py-3 text-sm">Explore scent families</Link></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Floral','https://images.unsplash.com/photo-1526664089214-42c68e78f266?auto=format&fit=crop&w=600'],['Woody','https://images.unsplash.com/photo-1615634260167-c8cd5b3a1f9b?auto=format&fit=crop&w=600'],['Oriental','https://images.unsplash.com/photo-1632928145408-ef47a7672964?auto=format&fit=crop&w=600'],['Fresh','https://images.unsplash.com/photo-1658654482546-1b7daf94a663?auto=format&fit=crop&w=600']].map(([name,img])=><Link href={`/collections/${String(name).toLowerCase()}`} key={name} className="group relative aspect-[3/4] overflow-hidden rounded-xl"><img src={img} alt={`${name} fragrance family`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/><span className="absolute bottom-3 left-3 font-serif text-lg text-white sm:text-xl">{name}</span></Link>)}</div></div>
      </section>

      {/* Event Scents feature */}
      <section id="event-scents" className="scroll-mt-28 bg-[#eee5d7] px-5 py-16 text-[#211c17] dark:bg-[#201b16] dark:text-[#f5f0e8] md:py-24"><div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-[#c5a46d]/30 md:grid-cols-2"><div className="flex flex-col justify-center p-8 md:p-12"><p className="text-xs uppercase tracking-[.35em] text-[#9a7543]">By Exousia &amp; Co.</p><h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">Event Scents</h2><p className="mt-5 text-sm leading-7 text-current/70">A portable Perfume Bar experience for weddings, birthdays, corporate gatherings, and celebrations. Let your guests discover a scent and take home a memorable moment.</p><Link href="/reviews" className="mt-7 inline-flex w-fit rounded-full bg-[#211c17] px-6 py-3 text-sm font-semibold text-[#f5f0e8] dark:bg-[#c5a46d] dark:text-[#171411]">See guest experiences →</Link></div><div className="relative min-h-[320px] md:min-h-[440px]"><img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1400&auto=format&fit=crop" alt="Elegant event setting" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/></div></div></section>

      {/* Reviews and social navigation without invented testimonials */}
      <section className="bg-[#f5f0e8] px-5 py-14 text-[#211c17] dark:bg-[#11110f] dark:text-[#f5f0e8] md:py-20"><div className="mx-auto max-w-7xl text-center"><SectionHeading eyebrow="Community" title="Your experience matters"/><p className="mx-auto max-w-xl text-sm leading-7 text-current/65">Discover feedback from our customers and share your own Exousia &amp; Co. experience.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/reviews" className="rounded-full bg-[#c5a46d] px-6 py-3 text-sm font-semibold text-[#171411]">Read customer reviews →</Link><Link href="/account" className="rounded-full border border-[#c5a46d]/60 px-6 py-3 text-sm font-semibold">Your account</Link></div></div></section>
    </main><Footer/>
  </>;
}
