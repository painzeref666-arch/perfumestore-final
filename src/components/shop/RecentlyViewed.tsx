'use client';

import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Price from '@/components/Price';
import { useProducts } from '@/context/ProductContext';

const KEY = 'exousia-recently-viewed-v1';

export function rememberViewedProduct(productId: string) {
  if (typeof window === 'undefined' || !productId) return;
  try {
    const current = JSON.parse(localStorage.getItem(KEY) || '[]') as string[];
    const next = [productId, ...current.filter((id) => id !== productId)].slice(0, 8);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export default function RecentlyViewed({ currentProductId = '' }: { currentProductId?: string }) {
  const { activeProducts } = useProducts();
  let ids: string[] = [];
  if (typeof window !== 'undefined') {
    try { ids = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { ids = []; }
  }
  const products = ids
    .filter((id) => id !== currentProductId)
    .map((id) => activeProducts.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4) as any[];

  if (!products.length) return null;

  return (
    <section className="mt-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.25em] text-amber-400">Recently viewed</p>
          <h2 className="mt-2 text-3xl font-black">Continue exploring</h2>
        </div>
        <Link href="/products" className="text-sm font-black text-amber-300">View all</Link>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} className="group rounded-[2rem] border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:bg-white/10">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <AppImage src={p.image} alt={p.name} fill sizes="25vw" className="object-cover transition group-hover:scale-105" />
            </div>
            <p className="mt-4 font-black">{p.name}</p>
            <p className="text-sm text-white/45">{p.family}</p>
            <Price amount={p.price} className="mt-2 font-black text-amber-200" />
          </Link>
        ))}
      </div>
    </section>
  );
}
