'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomepageVideoBanner from '@/components/shop/HomepageVideoBanner';
import { useProducts } from '@/context/ProductContext';
import AppImage from '@/components/ui/AppImage';
import Price from '@/components/Price';
import { supabase } from '@/lib/supabase';
import type { ManagedProduct } from '@/context/ProductContext';

const categories = [
  { title: 'Perfumes', href: '/perfumes', eyebrow: 'Signature scents', description: 'Find a fragrance that feels unmistakably yours.', image: '/assets/images/exousia-originals-hero.webp' },
  { title: 'Cosmetics', href: '/cosmetics', eyebrow: 'Beauty essentials', description: 'Beauty essentials for everyday confidence.', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Wellness', href: '/wellness', eyebrow: 'Self-care rituals', description: 'Thoughtful essentials for moments of care.', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Event Scents', href: '#event-scents', eyebrow: 'A scent experience', description: 'Bring our portable Perfume Bar to your celebration.', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop' },
];

type HomeProduct = ReturnType<typeof useProducts>['activeProducts'][number];
function heroHref(product: HomeProduct) { return String(product.hero_button_link || '').trim() || `/products/${product.id}`; }
function productHref(product: HomeProduct) { return product.id.startsWith('preview-') ? '/perfumes' : `/products/${product.id}`; }

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

  const active = slides.length ? slides[index % slides.length] : null;
  return (
    <section className="home-campaign relative isolate overflow-hidden bg-[#F5F0E8] text-[#241817] dark:bg-[#220A0D] dark:text-[#F7F0E8]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-10 h-[34rem] w-[34rem] rounded-full bg-[#8A0303]/[.08] blur-3xl dark:bg-[#8A0303]/20" />
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-5 sm:px-8 sm:py-7 md:grid-cols-[.88fr_1.12fr] md:gap-4 md:py-3 lg:px-10">
        <div className="relative z-10 max-w-xl py-1 md:py-2">
          <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.38em] text-[#8A0303] dark:text-[#E0C27A]"><span className="h-px w-9 bg-[#C5A46D]"/>Exousia &amp; Co. · Originals</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight text-[#271719] dark:text-[#FFF8F0] sm:text-6xl lg:text-6xl">{active?.hero_title || 'Wear your'}{!active?.hero_title && <><br/><span className="italic text-[#8A0303] dark:text-[#E0C27A]">own story.</span></>}</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#65514A] dark:text-[#D8C8BC] md:text-base">{active?.hero_description || active?.description || 'Discover a signature fragrance, beauty essentials, and thoughtful rituals for everyday confidence.'}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={active ? heroHref(active) : '/products'} className="inline-flex items-center gap-3 rounded-full bg-[#8A0303] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#700404]/20 transition hover:bg-[#700404]">{active?.hero_button_text || 'Explore the collection'} <span aria-hidden="true">→</span></Link>
            <Link href="/quiz" className="inline-flex items-center rounded-full border border-[#9A7854]/45 px-7 py-3 text-sm font-semibold text-[#392625] transition hover:border-[#8A0303] hover:text-[#8A0303] dark:text-[#F4E9DF] dark:hover:text-[#E0C27A]">Find your scent</Link>
          </div>
          <div className="mt-6 flex items-center gap-4 text-[9px] font-semibold uppercase tracking-[.24em] text-[#7D6B61] dark:text-[#C2B1A2]"><span>{active ? String(index + 1).padStart(2,'0') : '01'} / {String(Math.max(slides.length, 1)).padStart(2,'0')}</span><span className="h-px w-10 bg-[#C5A46D]/70"/>{slides.length > 1 ? <div className="flex gap-2">{slides.map((p, i) => <button key={p.id} aria-label={`Show ${p.name}`} onClick={() => setIndex(i)} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-[#8A0303] dark:bg-[#E0C27A]' : 'w-3 bg-[#C7B8AA] dark:bg-white/30'}`}/>)}</div> : <span>Make everywhere your territory</span>}</div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[320px]">
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-[#C5A46D]/45 bg-[#16090b] shadow-[0_20px_55px_rgba(0,0,0,.28)] dark:border-[#C5A46D]/35 dark:bg-[#101010]">
            {active ? <AppImage src={active.image} alt={active.name} fill smartFill priority sizes="(max-width:768px) 100vw,36vw" className="!h-full !w-full object-contain object-center" /> : <AppImage src="/assets/images/exousia-signature-collection-banner.png" alt="Exousia & Co. signature perfume collection" fill smartFill priority sizes="(max-width:768px) 100vw,36vw" className="!h-full !w-full object-contain object-center" />}
          </div>
          {active && <div className="absolute bottom-4 left-3 z-[2] rounded-2xl border border-[#C5A46D]/65 bg-[#FFF9F2]/95 px-4 py-3 shadow-xl dark:bg-[#090909]/95 sm:bottom-5 sm:left-4 sm:px-5"><p className="text-[9px] font-bold uppercase tracking-[.25em] text-[#8A0303] dark:text-[#E0C27A]">The current signature</p><p className="mt-1 font-serif text-lg text-[#321C1D] dark:text-[#FFF8F0] sm:text-xl">{active.name}</p></div>}
        </div>
      </div>
      <div className="home-ribbon border-y border-[#C5A46D]/50 bg-[#8A0303] py-3 text-center text-[9px] font-semibold uppercase tracking-[.28em] text-white sm:text-[10px]">Fragrance with presence <span className="mx-3 text-[#E0C27A]">✦</span> Beauty with intention <span className="mx-3 text-[#E0C27A]">✦</span> A signature that stays</div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, light = false }: {eyebrow: string; title: string; light?: boolean}) {
  return <div className="mb-6 text-center"><p className={`text-[11px] font-semibold uppercase tracking-[.35em] ${light ? 'text-[#8A0303]' : 'text-[#9a7543] dark:text-[#d6b477]'}`}>{eyebrow}</p><h2 className={`mt-2 font-serif text-2xl tracking-wide md:text-4xl ${light ? 'text-[#f5f0e8]' : 'text-[#211c17] dark:text-[#f5f0e8]'}`}>{title}</h2><div className="mx-auto mt-4 h-px w-16 bg-[#8A0303]"/></div>;
}

export default function HomePage() {
  const [eventMedia, setEventMedia] = useState<{media_type:'image'|'video';file_url:string;title:string}|null>(null);
  useEffect(() => { if (!supabase) return; let alive=true; supabase.from('event_scents_hero_media').select('media_type,file_url,title').eq('is_active',true).maybeSingle().then(({data,error})=>{if(alive&&!error&&data)setEventMedia(data as any)}); return ()=>{alive=false}; }, []);
  const { products, activeProducts } = useProducts();
  // Development-only visual preview for the local project when its product database is not configured.
  const localPreviewProducts: HomeProduct[] = process.env.NODE_ENV === 'development' ? ([
    { id:'preview-cherry-mirage', name:'Cherry Mirage', family:'Fruity Floral', notes:['Black cherry','Floral'], price:380, size:'50ml', image:'/assets/images/scent-family-floral.jpg', rating:5, reviews:0, stock:20, tag:'Signature', description:'A luscious black cherry accord softened by delicate florals.', category:'perfumes', active:true, hero_enabled:true, hero_order:1, hero_title:'A scent that leaves an impression.', hero_description:'Meet your signature. A luminous, long-lasting extrait crafted for the moments that become yours.', hero_button_text:'Discover Cherry Mirage', hero_button_link:'/perfumes' },
    { id:'preview-obsidian-trail', name:'Obsidian Trail', family:'Woody', notes:['Leather','Woods'], price:380, size:'50ml', image:'/assets/images/scent-family-woody.jpg', rating:5, reviews:0, stock:20, tag:'Signature', description:'Bold woods and smooth leather, refined with a smoky finish.', category:'perfumes', active:true, hero_enabled:true, hero_order:2, hero_title:'Leave a trail worth remembering.', hero_description:'Deep woods, polished leather, and a quiet confidence that stays with you.', hero_button_text:'Discover Obsidian Trail', hero_button_link:'/perfumes' },
    { id:'preview-amber-smoke', name:'Amber Smoke', family:'Oriental', notes:['Tobacco','Vanilla'], price:380, size:'50ml', image:'/assets/images/scent-family-oriental.jpg', rating:5, reviews:0, stock:20, tag:'Signature', description:'Warm tobacco and vanilla wrapped in a rich amber accord.', category:'perfumes', active:true, hero_enabled:true, hero_order:3, hero_title:'Warmth, with a little mystery.', hero_description:'A captivating blend of amber, smooth woods, and soft vanilla for after-dark elegance.', hero_button_text:'Discover Amber Smoke', hero_button_link:'/perfumes' },
    { id:'preview-musky-rose', name:'Musky Rose', family:'Floral', notes:['Rose','Musk'], price:380, size:'50ml', image:'/assets/images/scent-family-floral.jpg', rating:5, reviews:0, stock:20, tag:'Signature', description:'A modern rose with soft musk and a luminous floral finish.', category:'perfumes', active:true, hero_enabled:true, hero_order:4, hero_title:'Soft rose. Unmistakable presence.', hero_description:'A graceful floral signature that feels timeless, intimate, and entirely your own.', hero_button_text:'Discover Musky Rose', hero_button_link:'/perfumes' },
  ] as ManagedProduct[]) : [];
  const homepageProducts = activeProducts.length ? activeProducts : localPreviewProducts;
  // Exclude products marked Coming Soon from the normal Featured Collection.
  const featured = (activeProducts.length ? activeProducts : localPreviewProducts).filter((p) => p.upcoming_enabled !== true).slice(0, 5);
  // Coming Soon cards intentionally use the full product list so their visibility
  // is independent from the normal "Show product in shop" (active) setting.
  const upcoming = useMemo(() => products.filter((p) => p.upcoming_enabled === true).sort((a, b) => Number(a.upcoming_order || 999) - Number(b.upcoming_order || 999)), [products]);
  return <>
    <div className="grain" aria-hidden="true"/><Header/>
    <main className="min-h-screen bg-[#F5F0E8] pt-28 text-[#271719] dark:bg-[#1E090D] dark:text-[#F7F0E8]">
      <HomepageHeroCarousel products={homepageProducts}/>

      {/* Curated shopping paths */}
      <section className="bg-[#EFE5D9] px-5 py-12 dark:bg-[#271017] md:px-8 md:py-16">
        <div className="mx-auto mb-7 flex max-w-7xl items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.35em] text-[#8A0303] dark:text-[#E0C27A]">Curated for every moment</p><p className="mt-2 font-serif text-3xl text-[#2E1A1B] dark:text-[#F7F0E8] md:text-4xl">A world of Exousia</p></div><span className="hidden text-xs uppercase tracking-[.22em] text-[#78665C] dark:text-white/50 sm:block">Discover your ritual&nbsp; ↗</span></div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((cat) => <Link key={cat.title} href={cat.href} className="home-card group relative isolate min-h-[260px] overflow-hidden rounded-2xl border border-[#C5A46D]/50 bg-[#24211e] md:min-h-[310px]">
            <div className="absolute inset-0 -z-10"><img src={cat.image} alt={cat.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10"/></div>
            <div className="flex h-full min-h-[260px] flex-col justify-end p-5 md:min-h-[310px]"><p className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#E0C27A]">{cat.eyebrow}</p><h2 className="mt-2 font-serif text-3xl text-white">{cat.title}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-white/75">{cat.description}</p><span className="mt-5 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.2em] text-[#E0C27A]">Explore <span className="transition group-hover:translate-x-1">→</span></span></div>
          </Link>)}
        </div>
      </section>

      {/* Brand promise */}
      <section className="home-brand-promise border-y border-[#C5A46D]/40 bg-[#8A0303] px-5 py-7 text-white dark:bg-[#700404] dark:text-[#FFF8F0]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
          {[['◇','Curated Quality','Thoughtfully selected essentials'],['✧','Beauty & Care','Fragrance, beauty and wellness'],['♧','Delivery Options','Shipping and local delivery'],['☆','Customer Experience','Support throughout your journey']].map(([icon,title,desc])=><div key={title} className="text-center"><span className="text-2xl text-[#E0C27A]">{icon}</span><h3 className="mt-2 text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-white/75">{desc}</p></div>)}
        </div>
      </section>

      <section className="px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl"><div className="mb-8 flex flex-col items-center justify-between gap-5 md:mb-10 md:flex-row"><div className="text-center md:text-left"><p className="text-[10px] font-semibold uppercase tracking-[.36em] text-[#9a7543] dark:text-[#D6B477]">The Exousia edit</p><h2 className="mt-2 font-serif text-3xl tracking-tight text-[#211c17] dark:text-[#F7F0E8] md:text-5xl">Featured Collection</h2><p className="mt-2 text-sm text-[#62594f] dark:text-white/55">The scents everyone is talking about.</p></div><div className="flex flex-wrap justify-center gap-2"><Link href="/products" className="rounded-full bg-[#8A0303] px-5 py-2.5 text-xs font-semibold text-white">Shop all&nbsp; →</Link><Link href="/perfumes" className="rounded-full border border-[#C5A46D]/60 px-5 py-2.5 text-xs font-semibold">Perfumes</Link><Link href="/reviews" className="rounded-full border border-[#C5A46D]/60 px-5 py-2.5 text-xs font-semibold">Customer reviews</Link></div></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{featured.map((p) => <Link key={p.id} href={productHref(p)} className="home-card group overflow-hidden rounded-2xl border border-[#C5A46D]/45 bg-white/80 transition hover:-translate-y-1 hover:shadow-xl dark:border-[#C5A46D]/45 dark:bg-[#271114]"><div className="relative aspect-[4/5] overflow-hidden bg-[#e8dfd2] dark:bg-[#2B1718]"><AppImage src={p.image} alt={p.name} fill smartFill sizes="(max-width:768px) 100vw,20vw" className="object-cover transition duration-700 group-hover:scale-105"/></div><div className="p-4 text-[#211c17] dark:text-[#F7F0E8]"><p className="text-[10px] uppercase tracking-[.25em] text-[#9a7543] dark:text-[#D6B477]">{p.category || 'Collection'}</p><h3 className="mt-2 line-clamp-1 font-serif text-lg text-[#452F21] dark:text-[#F0D59A]">{p.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#62594f] dark:text-[#D7C9BE]">{p.description}</p><Price amount={p.price} className="mt-3 block text-sm font-semibold text-[#744D18] dark:text-[#E0C27A]"/></div></Link>)}</div>
        </div>
      </section>

      {upcoming.length > 0 && <section className="border-y border-[#C5A46D]/25 bg-[#4A0C14] px-5 py-12 text-[#f5f0e8] md:py-14"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="A new chapter" title="Coming Soon" light/><p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-6 text-white/75">Preview the next creations from Exousia &amp; Co.</p><div className="-mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-5">{upcoming.map((p,i)=><Link key={p.id} href={`/products/${p.id}`} className="home-card group flex-none snap-start overflow-hidden rounded-2xl border border-[#C5A46D]/60 bg-[#2A1016] sm:w-[300px]"><div className="relative aspect-[4/5]"><AppImage src={p.image} alt={p.name} fill smartFill sizes="300px" className="object-cover transition group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/><div className="absolute bottom-4 left-4 text-white"><p className="text-xs uppercase tracking-widest text-[#d6b477]">{p.upcoming_badge || 'Coming soon'}</p><h3 className="mt-2 font-serif text-2xl text-[#E0C27A]">{p.name}</h3></div></div><div className="p-4"><p className="line-clamp-2 text-sm text-white/75">{p.upcoming_description || p.description}</p><span className="mt-4 block text-xs uppercase tracking-widest text-[#d6b477]">Preview #{i+1} →</span></div></Link>)}</div></div></section>}

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8"><HomepageVideoBanner/></div>

      
      {/* Scent discovery */}
      <section className="relative overflow-hidden bg-[#EFE5D9] px-5 py-14 text-[#271719] dark:bg-[#271017] dark:text-[#F7F0E8] md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.35em] text-[#8A0303] dark:text-[#D6B477]">Discover your scent</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">Find your<br/><span className="italic text-[#8A0303] dark:text-[#E0C27A]">signature.</span></h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#65514A] dark:text-white/70">
              Not sure where to begin? Explore fragrance families or take the scent quiz to discover fragrances that match your preferences.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/quiz" className="rounded-full bg-[#8A0303] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#700404]/20">
                Take the Scent Quiz →
              </Link>
              <Link href="/collections/floral" className="rounded-full border border-[#9A7854]/50 px-6 py-3.5 text-sm text-[#392625] dark:text-[#F4E9DF]">
                Explore scent families
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Floral', '/assets/images/scent-family-floral.jpg'],
              ['Woody', '/assets/images/scent-family-woody.jpg'],
              ['Oriental', '/assets/images/scent-family-oriental.jpg'],
              ['Fresh', '/assets/images/scent-family-fresh.jpg']
            ].map(([name, img]) => (
              <Link
                href={`/collections/${String(name).toLowerCase()}`}
                key={name}
                className="home-card group relative aspect-[3/4] overflow-hidden rounded-xl border border-[#C5A46D]/70"
              >
                <img
                  src={img}
                  alt={`${name} fragrance family`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/>
                <span className="absolute bottom-3 left-3 font-serif text-lg text-[#E0C27A] sm:text-xl">
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Event Scents feature */}
      <section
        id="event-scents"
        className="scroll-mt-28 bg-gradient-to-br from-[#8A0303] via-[#700404] to-[#3B0A0D] px-5 py-14 text-white md:py-20"
      >
        <div className="event-scents-panel relative isolate mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[2rem] border border-[#C5A46D]/70 p-6 shadow-2xl sm:p-9 md:grid-cols-[1.05fr_.95fr] md:gap-12 md:p-10 lg:p-12">
          <div className="relative z-10 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[.35em] text-[#FFF9F2]">
              Exousia &amp; Co. Originals
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[#FFF9F4] md:text-5xl lg:text-6xl">
              Event Scents
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 md:text-base">
              A portable Perfume Bar experience for weddings, birthdays, corporate gatherings, and celebrations. Let your guests discover a scent and take home a memorable moment.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/event-scents/book"
                className="inline-flex w-fit items-center rounded-full bg-[#8A0303] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-[#700404]"
              >
                Book Us Now →
              </Link>
              <Link
                href="/reviews"
                className="inline-flex w-fit items-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
              >
                See guest experiences →
              </Link>
            </div>
          </div>

          <div className="relative z-10 min-w-0">
            {eventMedia?.file_url && (
              <>
                {eventMedia.media_type === 'video' ? (
                  <video
                    src={eventMedia.file_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
                  />
                ) : (
                  <img
                    src={eventMedia.file_url}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/20 to-[#8A0303]/30" />
              </>
            )}
            <div className="event-scents-visual relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/15 p-2 shadow-[0_24px_70px_rgba(0,0,0,.4)] sm:p-3">
              {eventMedia ? (
                eventMedia.media_type === 'video' ? (
                  <video
                    key={eventMedia.file_url}
                    src={eventMedia.file_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    preload="metadata"
                    className="relative z-10 h-full w-full rounded-[1rem] object-contain"
                    aria-label={eventMedia.title || 'Event Scents promotional video'}
                  />
                ) : (
                  <img
                    src={eventMedia.file_url}
                    alt={eventMedia.title || 'Event Scents promotional image'}
                    className="relative z-10 h-full w-full rounded-[1rem] object-contain"
                  />
                )
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1400&auto=format&fit=crop"
                  alt="Elegant event setting"
                  className="relative z-10 h-full w-full rounded-[1rem] object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews and social navigation without invented testimonials */}
      <section className="bg-[#F5F0E8] px-5 py-12 text-[#271719] dark:bg-[#1E090D] dark:text-[#F7F0E8] md:py-16"><div className="mx-auto max-w-7xl text-center"><SectionHeading eyebrow="Community" title="Your experience matters"/><p className="mx-auto max-w-xl text-sm leading-7 text-current/70">Discover feedback from our customers and share your own Exousia &amp; Co. experience.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/reviews" className="rounded-full bg-[#8A0303] px-6 py-3 text-sm font-semibold text-white">Read customer reviews →</Link><Link href="/account" className="rounded-full border border-[#C5A46D]/70 px-6 py-3 text-sm font-semibold">Your account</Link></div></div></section>
    </main><Footer/>
  </>;
}
