'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HomepageVideoBanner() {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-rose-200/15 bg-gradient-to-br from-[#861126] via-[#650b1b] to-[#25070d] px-5 py-5 text-white shadow-xl shadow-black/20 sm:px-7 sm:py-6 lg:px-9 lg:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-rose-300/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-amber-200/10 blur-3xl" />

      <div className="relative grid items-center gap-5 lg:grid-cols-[1fr_0.72fr] lg:gap-7">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-200 sm:text-xs">
            Exousia &amp; Co. Originals
          </p>
          <h2 className="mt-4 text-2xl font-black leading-[1.08] tracking-tight sm:text-3xl lg:text-4xl">
            A signature scent for every moment.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-5 text-white/75 sm:text-sm sm:leading-6">
            Discover fragrances made to leave a lasting impression. Find the scent that makes every moment yours.
          </p>
          <p className="mt-3 text-xs font-semibold tracking-wide text-amber-100/90">
            Make Every Where Your Territory
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2 focus:ring-offset-[#650b1b]"
          >
            Explore perfumes <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-[250px] overflow-hidden rounded-2xl border border-amber-200/20 bg-black/30 shadow-2xl shadow-black/30">
          <div className="relative mx-auto h-[300px] w-full sm:h-[330px] lg:h-[350px]">
            <Image
              src="/assets/images/exousia-signature-collection-banner.png"
              alt="Exousia & Co. Originals signature perfume collection"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-contain object-center"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
