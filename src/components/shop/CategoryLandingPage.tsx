import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductBrowser from '@/components/shop/ProductBrowser';

type CategoryKey = 'perfumes' | 'cosmetics' | 'wellness';

const hero: Record<CategoryKey, { eyebrow: string; title: string; description: string; image: string }> = {
  perfumes: {
    eyebrow: 'Exousia Perfumes',
    title: 'Signature fragrances for every mood.',
    description: 'Luxury-inspired perfumes with size, concentration, wishlist, reviews, cart, checkout, and order tracking.',
    image: 'https://images.unsplash.com/photo-1594035910663-369b72b7abe2?q=80&w=1200&auto=format&fit=crop',
  },
  cosmetics: {
    eyebrow: 'Exousia Cosmetics',
    title: 'Beauty essentials for polished everyday confidence.',
    description: 'Cosmetics products use the same ecommerce flow: filters, cart, checkout, inventory, reviews, and admin controls.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
  },
  wellness: {
    eyebrow: 'Exousia Wellness',
    title: 'Self-care essentials for daily balance.',
    description: 'Wellness and body-care products with the same smooth shopping, cart, checkout, and tracking experience.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
  },
};

export default function CategoryLandingPage({ category }: { category: CategoryKey }) {
  const h = hero[category];
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header />
      <main className="min-h-screen bg-[#fbf7ef] pt-28 dark:bg-[#0f0d0a] dark:text-white">
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 md:grid-cols-[1fr_420px]">
          <div>
            <p className="font-black uppercase tracking-[.35em] text-amber-700">{h.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">{h.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600 dark:text-white/60">{h.description}</p>
          </div>
          <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-amber-900/10">
            <img src={h.image} alt={h.title} className="aspect-[4/5] w-full rounded-[2.3rem] object-cover" />
          </div>
        </section>
        <ProductBrowser category={category} />
      </main>
      <Footer />
    </>
  );
}
