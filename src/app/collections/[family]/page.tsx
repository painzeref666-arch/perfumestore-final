"use client";

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Price from '@/components/Price';
import { getVariantPrice, useProducts } from '@/context/ProductContext';

const familyCopy: Record<string, { title: string; description: string; seo: string }> = {
  floral: {
    title: 'Floral Perfumes',
    description: 'Romantic rose, white floral, and soft petal fragrances for elegant everyday wear.',
    seo: 'Shop floral perfumes with rose, jasmine, pear, and soft musks. Find romantic and fresh floral fragrances in EDP and Extrait variations.',
  },
  woody: {
    title: 'Woody Perfumes',
    description: 'Polished cedar, vetiver, sandalwood, and warm woods for refined confidence.',
    seo: 'Discover woody perfumes with cedarwood, vetiver, sandalwood, and amber woods. Luxury scents for lasting elegance.',
  },
  fresh: {
    title: 'Fresh Perfumes',
    description: 'Clean aquatic, airy musks, and bright freshness for daily signature scent energy.',
    seo: 'Browse fresh perfumes with aquatic notes, white musk, jasmine, and clean long-lasting fragrance profiles.',
  },
  amber: {
    title: 'Amber Perfumes',
    description: 'Warm amber, vanilla, musk, and resinous notes for sensual evening impressions.',
    seo: 'Explore amber perfumes with vanilla, musk, resin, and warm balsamic depth in luxury bottle sizes.',
  },
  oud: {
    title: 'Oud Perfumes',
    description: 'Deep oud, saffron, smoke, and spice for bold luxury fragrance lovers.',
    seo: 'Shop oud perfumes with smoky woods, saffron, spice, and extrait strength for powerful projection.',
  },
  citrus: {
    title: 'Citrus Perfumes',
    description: 'Bergamot, neroli, lemon, and cedar brightness for clean daytime confidence.',
    seo: 'Find citrus perfumes with bergamot, neroli, lemon, and fresh cedar notes for everyday wear.',
  },
};

function niceFamily(raw: string) {
  return decodeURIComponent(raw || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function CollectionPage() {
  const params = useParams<{ family: string }>();
  const familyKey = String(params?.family || '').toLowerCase();
  const copy = familyCopy[familyKey] || {
    title: `${niceFamily(familyKey)} Perfumes`,
    description: `Explore ${niceFamily(familyKey)} perfumes in multiple sizes and concentrations.`,
    seo: `Shop ${niceFamily(familyKey)} perfumes from Exousia & Co. Marketing.`,
  };
  const { activeProducts, loading } = useProducts();
  const products = useMemo(
    () => activeProducts.filter((p) => p.family.toLowerCase() === niceFamily(familyKey).toLowerCase()),
    [activeProducts, familyKey]
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0f0d0a] px-4 py-32 text-white md:px-6">
        <section className="mx-auto max-w-7xl">
          <nav className="mb-8 text-xs font-bold text-white/45">
            <Link href="/" className="hover:text-amber-300">Home</Link> <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-amber-300">Collections</Link> <span className="mx-2">/</span>
            <span className="text-white">{copy.title}</span>
          </nav>

          <div className="luxury-reveal relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 md:p-14">
            <div className="luxury-glow absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
            <p className="text-xs font-black uppercase tracking-[.28em] text-amber-300">SEO Collection Page</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">{copy.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/60">{copy.description}</p>
            <p className="mt-5 max-w-4xl text-sm leading-7 text-white/40">{copy.seo}</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading && <p className="text-white/60">Loading collection...</p>}
            {!loading && products.length === 0 && (
              <div className="col-span-full rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <p className="text-xl font-black">No active products in this collection yet.</p>
                <Link href="/admin" className="mt-4 inline-flex rounded-full bg-amber-700 px-5 py-3 font-black text-white">Add product in admin</Link>
              </div>
            )}
            {products.map((product, index) => {
              const price = getVariantPrice(product, '10ml', 'EDP');
              return (
                <Link key={product.id} href={`/products/${product.id}`} className="luxury-card soft-slide group rounded-[2rem] border border-white/10 bg-white/[0.04] p-4" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-white/5">
                    <AppImage src={product.image} alt={product.name} fill sizes="(max-width:768px) 50vw,25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-amber-300">{product.tag}</p>
                  <h2 className="mt-2 text-2xl font-black">{product.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-white/45">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <Price amount={price} className="text-xl font-black" />
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-stone-950">View</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
