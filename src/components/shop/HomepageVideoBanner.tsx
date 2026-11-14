'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type HomepageMedia = { id: string; title: string; media_type: 'image' | 'video'; file_url: string };

export default function HomepageVideoBanner() {
  const [media, setMedia] = useState<HomepageMedia | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.from('homepage_media').select('id,title,media_type,file_url').eq('is_active', true).maybeSingle()
      .then(({ data, error }) => { if (active && !error && data) setMedia(data as HomepageMedia); });
    return () => { active = false; };
  }, []);

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-rose-200/15 bg-gradient-to-br from-[#861126] via-[#650b1b] to-[#25070d] px-5 py-5 text-white shadow-xl shadow-black/20 sm:px-7 sm:py-6 lg:px-9 lg:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-rose-300/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-amber-200/10 blur-3xl" />
      <div className="relative grid items-center gap-5 lg:grid-cols-[1fr_0.72fr] lg:gap-7">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-200 sm:text-xs">Exousia &amp; Co. Originals</p>
          <h2 className="mt-4 text-2xl font-black leading-[1.08] tracking-tight sm:text-3xl lg:text-4xl">More Than Just a Scent. It's a Lifestyle.</h2>
          <p className="mt-3 max-w-md text-sm leading-5 text-white/75 sm:text-sm sm:leading-6">Discover the art of self-expression with Exousia &amp; Co. Explore captivating fragrances, beauty essentials, and wellness finds thoughtfully selected to elevate your everyday moments. From personal indulgence to unforgettable celebrations, let us bring beauty, confidence, and elegance into every experience.</p>
          <p className="mt-3 text-xs font-semibold tracking-wide text-[#D6B477]">YOUR SCENT, YOUR STORY</p>
          <Link href="/products" className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2 focus:ring-offset-[#650b1b]">Explore Exousia <span aria-hidden="true">→</span></Link>
        </div>
        <div className="relative mx-auto flex min-h-[220px] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-2xl border border-amber-200/20 bg-black/30 shadow-2xl shadow-black/30 sm:min-h-[280px] lg:min-h-[350px]">
          {media ? (media.media_type === 'video' ? <video key={media.id} src={media.file_url} autoPlay muted loop playsInline controls className="block max-h-[480px] max-w-full object-contain" aria-label={media.title} /> : <Image src={media.file_url} alt={media.title} width={1200} height={1200} unoptimized className="block max-h-[480px] max-w-full object-contain" />) : <div className="relative h-[300px] w-full sm:h-[330px] lg:h-[350px]"><Image src="/assets/images/exousia-signature-collection-banner.png" alt="Exousia & Co. Originals signature perfume collection" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-contain object-center" /><div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" /></div>}
        </div>
      </div>
    </section>
  );
}
