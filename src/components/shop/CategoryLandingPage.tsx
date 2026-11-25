import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductBrowser from '@/components/shop/ProductBrowser';

type CategoryKey = 'perfumes' | 'cosmetics' | 'wellness';

const hero: Record<CategoryKey, { eyebrow: string; title: string; description: string; image: string }> = {
  perfumes: {
    eyebrow: 'Exousia & Co. Originals',
    title: 'A fragrance that becomes your signature.',
    description: 'Explore scents designed to leave an impression. Find the notes, mood, and character that feel unmistakably yours.',
    image: '/assets/images/exousia-originals-hero.webp',
  },
  cosmetics: {
    eyebrow: 'Exousia Cosmetics',
    title: 'Beauty essentials for polished everyday confidence.',
    description: '',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
  },
  wellness: {
    eyebrow: 'Exousia Wellness',
    title: 'Self-care essentials for daily balance.',
    description: '',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
  },
};

export default function CategoryLandingPage({ category }: { category: CategoryKey }) {
  const h = hero[category];

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header />
      <main className="min-h-screen bg-[#F5F0E8] pt-28 text-[#171411] dark:bg-[#11110F] dark:text-[#F5F0E8]">
        {category === 'perfumes' ? (
          <>
            <section className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-12 pt-8 md:pb-20 md:pt-12">
              <div className="grid min-h-[520px] overflow-hidden rounded-[2rem] border border-[#C5A46D]/30 bg-[#201B16] md:grid-cols-[.92fr_1.08fr]">
                <div className="relative z-10 flex flex-col justify-center p-8 md:p-14 lg:p-16">
                  <p className="text-xs font-bold uppercase tracking-[.4em] text-[#C5A46D]">{h.eyebrow}</p>
                  <h1 className="mt-6 font-serif text-5xl leading-[1.08] text-[#F5F0E8] md:text-6xl lg:text-7xl">{h.title}</h1>
                  <p className="mt-6 max-w-xl text-base leading-8 text-[#F5F0E8]/70 md:text-lg">{h.description}</p>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <a href="#featured" className="rounded-full bg-[#C5A46D] px-7 py-4 text-sm font-bold text-[#11110F] transition hover:bg-[#D8BC8B]">Shop the Collection <span aria-hidden="true">→</span></a>
                    <Link href="/quiz" className="rounded-full border border-[#C5A46D]/70 px-7 py-4 text-sm font-bold text-[#F5F0E8] transition hover:bg-[#C5A46D]/10">Discover Your Scent</Link>
                  </div>
                  <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#C5A46D]/80">
                    <span>Find Your Signature</span><span>•</span><span>Explore Scent Families</span><span>•</span><span>Make It Yours</span>
                  </div>
                </div>
                <div className="relative min-h-[360px] md:min-h-full">
                  <img src={h.image} alt="Exousia & Co. Originals signature perfume collection" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#201B16]/50 via-transparent to-[#201B16]/10 md:bg-gradient-to-l md:from-[#201B16]/20 md:via-transparent md:to-[#201B16]/20" />
                  <div className="absolute bottom-6 left-6 rounded-full border border-[#F5F0E8]/30 bg-[#11110F]/50 px-4 py-2 text-xs uppercase tracking-[.25em] text-[#F5F0E8] backdrop-blur-sm">Exousia Originals</div>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-12 md:pb-16">
              <div className="grid gap-6 border-y border-[#C5A46D]/25 py-8 md:grid-cols-3 md:gap-12 md:py-12">
                <div><p className="text-xs font-bold uppercase tracking-[.3em] text-[#C5A46D]">01 / The Mood</p><h2 className="mt-3 font-serif text-2xl">Wear how you feel.</h2><p className="mt-3 text-sm leading-7 text-[#62594E] dark:text-[#F5F0E8]/60">From fresh and effortless to warm and captivating, choose a scent to match your moment.</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[.3em] text-[#C5A46D]">02 / The Notes</p><h2 className="mt-3 font-serif text-2xl">Discover your scent family.</h2><p className="mt-3 text-sm leading-7 text-[#62594E] dark:text-[#F5F0E8]/60">Explore floral, amber, woody, citrus, fresh, and other fragrance directions.</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[.3em] text-[#C5A46D]">03 / The Signature</p><h2 className="mt-3 font-serif text-2xl">Make it unmistakably yours.</h2><p className="mt-3 text-sm leading-7 text-[#62594E] dark:text-[#F5F0E8]/60">Browse the collection and discover the fragrance you want people to remember.</p></div>
              </div>
            </section>
          </>
        ) : (
          <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 md:grid-cols-[1fr_420px]">
            <div>
              <p className="font-black uppercase tracking-[.35em] text-[#C5A46D]">{h.eyebrow}</p>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">{h.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#62594E] dark:text-[#F5F0E8]/60">{h.description}</p>
            </div>
            <div className="w-full overflow-hidden rounded-[2rem] border border-[#C5A46D]/40 bg-[#11110F] shadow-2xl shadow-black/20 dark:shadow-black/40">
              <img src={h.image} alt={h.title} className="block aspect-[3/2] w-full object-cover" />
            </div>
          </section>
        )}
        <ProductBrowser category={category} />
      </main>
      <Footer />
    </>
  );
}
