import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductBrowser from '@/components/shop/ProductBrowser';

type CategoryKey = 'perfumes' | 'cosmetics' | 'wellness';

const hero: Record<CategoryKey, { eyebrow: string; title: string; description: string; image: string }> = {
  perfumes: {
    eyebrow: 'Exousia & Co. Originals',
    title: 'Find the scent that feels like you.',
    description: 'Explore fragrances designed to leave an impression. Find the notes, mood, and character that feel unmistakably yours.',
    image: '/assets/images/exousia-originals-hero.webp',
  },
  cosmetics: {
    eyebrow: 'Exousia Cosmetics',
    title: 'Your everyday, in a better light.',
    description: 'Discover beauty essentials chosen to make everyday routines feel more considered.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
  },
  wellness: {
    eyebrow: 'Exousia Wellness',
    title: 'Make a little room for yourself.',
    description: 'Thoughtful self-care and wellness essentials for the rituals that bring you back to balance.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
  },
};

export default function CategoryLandingPage({ category }: { category: CategoryKey }) {
  const h = hero[category];
  const isPerfume = category === 'perfumes';

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header />
      <main className="category-page min-h-screen bg-[#F5F0E8] pt-28 text-[#271719] dark:bg-[#1E090D] dark:text-[#F7F0E8]">
        <section className="category-campaign relative isolate mx-auto grid max-w-7xl items-center gap-6 overflow-hidden px-5 pb-8 pt-8 sm:px-8 md:min-h-[510px] md:grid-cols-[.95fr_1.05fr] md:gap-4 md:px-10 md:pb-10 md:pt-12">
          <div className="relative z-10 py-7 md:py-12">
            <p className="text-[10px] font-bold uppercase tracking-[.38em] text-[#8A0303] dark:text-[#E0C27A]">{h.eyebrow}</p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.03] tracking-tight text-[#2B191A] dark:text-[#FFF8F0] md:text-6xl lg:text-7xl">{h.title}</h1>
            {h.description && <p className="mt-5 max-w-lg text-sm leading-7 text-[#65514A] dark:text-[#D8C8BC] md:text-base">{h.description}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#featured" className="inline-flex items-center gap-3 rounded-full bg-[#8A0303] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#700404]">Shop {isPerfume ? 'fragrance' : category}&nbsp; →</a>
              {isPerfume && <Link href="/quiz" className="inline-flex items-center rounded-full border border-[#9A7854]/50 px-6 py-3.5 text-sm font-semibold text-[#392625] transition hover:border-[#8A0303] hover:text-[#8A0303] dark:text-[#F4E9DF] dark:hover:text-[#E0C27A]">Take the scent quiz</Link>}
            </div>
            {isPerfume && <p className="mt-8 text-[9px] font-semibold uppercase tracking-[.25em] text-[#806D62] dark:text-[#C2B1A2]">Explore the mood&nbsp; · &nbsp;Discover the notes&nbsp; · &nbsp;Make it yours</p>}
          </div>
          <div className="category-art relative mx-auto flex h-[330px] w-full max-w-[580px] items-end justify-center md:h-[460px]">
            <div aria-hidden="true" className="absolute bottom-0 right-[4%] h-[88%] w-[78%] rounded-t-[48%] rounded-b-[2.5rem] bg-gradient-to-br from-[#A10A16] via-[#700404] to-[#3A1017]" />
            <div aria-hidden="true" className="absolute bottom-4 left-[8%] h-20 w-20 rounded-full border border-[#C5A46D]/80 md:h-28 md:w-28" />
            <img src={h.image} alt={`${h.eyebrow} collection`} className={`relative z-[1] h-[95%] w-[90%] drop-shadow-[0_24px_24px_rgba(35,10,12,.22)] ${isPerfume ? 'object-contain object-bottom' : 'rounded-t-[45%] object-cover object-center'}`} />
            <div className="absolute bottom-5 left-0 z-[2] rounded-xl border border-[#C5A46D]/65 bg-[#FFF9F2]/95 px-4 py-3 shadow-lg dark:bg-[#2A1016]/95">
              <p className="text-[9px] font-bold uppercase tracking-[.22em] text-[#8A0303] dark:text-[#E0C27A]">{isPerfume ? 'The signature collection' : 'Thoughtfully selected'}</p>
              <p className="mt-1 font-serif text-lg text-[#321C1D] dark:text-[#FFF8F0]">{category === 'perfumes' ? 'Make it yours.' : category === 'cosmetics' ? 'Beauty, your way.' : 'A softer daily ritual.'}</p>
            </div>
          </div>
        </section>

        {isPerfume && <section className="mx-auto max-w-7xl border-y border-[#C5A46D]/45 px-5 py-8 sm:px-8 md:px-10 md:py-10">
          <div className="grid gap-7 md:grid-cols-3 md:gap-12">
            <div><p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#8A0303] dark:text-[#E0C27A]">01 / The mood</p><h2 className="mt-3 font-serif text-2xl">Wear how you feel.</h2><p className="mt-2 text-sm leading-6 text-[#65514A] dark:text-[#D8C8BC]">From fresh and effortless to warm and captivating, choose a scent to match your moment.</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#8A0303] dark:text-[#E0C27A]">02 / The notes</p><h2 className="mt-3 font-serif text-2xl">Explore your scent family.</h2><p className="mt-2 text-sm leading-6 text-[#65514A] dark:text-[#D8C8BC]">Discover floral, amber, woody, citrus, fresh, and other fragrance directions.</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#8A0303] dark:text-[#E0C27A]">03 / Your signature</p><h2 className="mt-3 font-serif text-2xl">Make it unmistakably yours.</h2><p className="mt-2 text-sm leading-6 text-[#65514A] dark:text-[#D8C8BC]">Find the fragrance you want people to remember.</p></div>
          </div>
        </section>}

        <ProductBrowser category={category} />
      </main>
      <Footer />
    </>
  );
}
