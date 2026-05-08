'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Price from '@/components/Price';
import WishlistButton from '@/components/shop/WishlistButton';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistPage() {
  const { wishlistProducts, loading } = useWishlist();
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fbf7ef] px-6 py-32 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[.3em] text-amber-700">Customer Features</p>
          <h1 className="mt-4 text-5xl font-black md:text-7xl">Your wishlist</h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-600 dark:text-white/60">Save perfumes you love, compare scent notes, and return when you are ready to order.</p>

          {loading ? <p className="mt-10 rounded-3xl bg-white p-6 font-black dark:bg-white/5">Loading wishlist...</p> : wishlistProducts.length === 0 ? (
            <section className="mt-10 rounded-[2.5rem] border border-stone-200 bg-white p-10 text-center dark:border-white/10 dark:bg-white/5">
              <h2 className="text-3xl font-black">No saved perfumes yet</h2>
              <p className="mt-3 text-stone-600 dark:text-white/60">Tap the heart on a product to save it here.</p>
              <Link href="/products" className="mt-7 inline-flex rounded-full bg-amber-700 px-7 py-4 font-black text-white">Browse perfumes</Link>
            </section>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {wishlistProducts.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl dark:border-white/10 dark:bg-white/5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                    <AppImage src={p.image} alt={p.name} fill sizes="25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                    <WishlistButton productId={p.id} className="absolute right-4 top-4 h-11 w-11 text-xl" />
                  </div>
                  <div className="mt-5">
                    <p className="text-xs font-black uppercase tracking-[.2em] text-amber-700">{p.family}</p>
                    <h2 className="mt-2 text-xl font-black">{p.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-stone-600 dark:text-white/50">{p.description}</p>
                    <Price amount={p.salePrice || p.price} className="mt-4 block text-lg font-black" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
