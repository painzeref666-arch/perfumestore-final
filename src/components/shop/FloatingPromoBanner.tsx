'use client';

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'exousia-hide-floating-promo-v2';

export default function FloatingPromoBanner() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hidden = window.localStorage.getItem(DISMISS_KEY) === '1';
    if (hidden) return;

    const timer = window.setTimeout(() => setShow(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const closePromo = () => {
    window.localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  };

  const shopCollection = () => {
    setShow(false);

    const productsSection = document.getElementById('products') || document.getElementById('collection');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    window.location.href = '/products';
  };

  if (!mounted || !show) return null;

  return (
    <aside className="fixed bottom-5 left-4 right-4 z-[9999] mx-auto max-w-3xl overflow-hidden rounded-[1.75rem] border border-amber-300/40 bg-stone-950/95 p-1 shadow-2xl shadow-black/30 backdrop-blur md:left-8 md:right-auto md:w-[420px] pointer-events-auto animate-[promoFloat_.45s_ease-out]">
      <div className="relative rounded-[1.5rem] border border-white/10 bg-gradient-to-r from-amber-500/20 via-white/5 to-stone-950 px-5 py-4 text-white">
        <button
          type="button"
          aria-label="Hide promo"
          onClick={closePromo}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white transition hover:scale-105 hover:bg-white/20 active:scale-95"
        >
          ×
        </button>

        <p className="text-[10px] font-black uppercase tracking-[.25em] text-amber-200">Limited Exousia Offer</p>
        <h3 className="mt-1 pr-8 text-lg font-black">Build your signature scent wardrobe</h3>
        <p className="mt-1 text-sm text-white/65">Mix favorites, save your wishlist, and checkout when ready.</p>

        <button
          type="button"
          onClick={shopCollection}
          className="mt-3 inline-flex rounded-full bg-amber-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-amber-500 active:translate-y-0"
        >
          Shop collection
        </button>
      </div>
    </aside>
  );
}
