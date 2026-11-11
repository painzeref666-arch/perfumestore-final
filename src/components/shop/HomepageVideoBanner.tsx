
'use client';

import Link from 'next/link';

export default function HomepageVideoBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-300/20 bg-stone-950 px-6 py-7 text-white shadow-xl shadow-amber-950/10 md:px-9 md:py-9">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-amber-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_250px]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-amber-300">
            Exousia & Co.
          </p>

          <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight md:text-4xl">
            A premium scent experience, crafted for modern confidence.
          </h2>

          <p className="mt-3 text-sm text-white/65 md:text-base">
            Make Every Where Your Territory
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-amber-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-500"
          >
            Explore perfumes
          </Link>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[250px] rounded-3xl border border-white/10 bg-gradient-to-br from-amber-300/25 via-white/10 to-transparent p-5">
          <div className="flex h-full items-center justify-center rounded-2xl bg-black/30 text-center">
            <div>
              <p className="font-display text-5xl italic text-amber-200">
                Exousia
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[.22em] text-white/50">
                Signature Collection
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
