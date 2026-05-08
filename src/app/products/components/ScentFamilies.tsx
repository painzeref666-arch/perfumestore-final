'use client';
import React, { useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';

interface ScentFamily {
  name: string;
  descriptor: string;
  count: number;
  image: string;
  imageAlt: string;
  accent: string;
  examples: string[];
}

const families: ScentFamily[] = [
{
  name: 'Floral',
  descriptor: 'Romantic & Feminine',
  count: 62,
  image: "https://images.unsplash.com/photo-1526664089214-42c68e78f266",
  imageAlt: 'Floral perfume bottle surrounded by fresh pink roses and peonies',
  accent: '#D4A5C9',
  examples: ['Rose', 'Jasmine', 'Peony', 'Lily']
},
{
  name: 'Woody',
  descriptor: 'Warm & Grounded',
  count: 48,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1fb2c9bd6-1772983494374.png",
  imageAlt: 'Woody fragrance bottle on weathered oak wood with cedar bark',
  accent: '#C9974A',
  examples: ['Sandalwood', 'Cedarwood', 'Vetiver', 'Oud']
},
{
  name: 'Oriental',
  descriptor: 'Exotic & Mysterious',
  count: 41,
  image: "https://images.unsplash.com/photo-1632928145408-ef47a7672964",
  imageAlt: 'Oriental perfume bottle with spices and incense on dark velvet',
  accent: '#9B6B4A',
  examples: ['Amber', 'Musk', 'Vanilla', 'Saffron']
},
{
  name: 'Fresh',
  descriptor: 'Light & Energising',
  count: 55,
  image: "https://images.unsplash.com/photo-1658654482546-1b7daf94a663",
  imageAlt: 'Fresh citrus perfume bottle with sliced lemons and mint leaves',
  accent: '#6BA8A9',
  examples: ['Bergamot', 'Neroli', 'Sea Salt', 'Yuzu']
}];


export default function ScentFamilies() {
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray<HTMLElement>('.scent-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    };
    loadGSAP();
  }, []);

  return (
    <section
      id="scent-families"
      className="py-24 md:py-32 px-4 md:px-6 bg-foreground overflow-hidden"
      aria-labelledby="scent-families-heading">
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 reveal">
          <p className="text-primary font-semibold uppercase tracking-[0.2em] text-xs mb-4">Explore by Mood</p>
          <h2
            id="scent-families-heading"
            className="text-4xl md:text-7xl font-bold tracking-tighter leading-tight text-white">
            
            Discover Your{' '}
            <span className="font-display italic font-normal text-primary">
              Scent Family.
            </span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {families.map((family) =>
          <article
            key={family.name}
            className="scent-card group relative rounded-4xl overflow-hidden cursor-pointer bg-accent border border-white/5 hover:border-white/10 transition-all">
            
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <AppImage
                src={family.image}
                alt={family.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="scent-img object-cover" />
              
                <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${family.accent}33 0%, transparent 60%)`
                }} />
              
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{family.name}</h3>
                    <p className="text-xs text-white/50 font-medium mt-0.5">{family.descriptor}</p>
                  </div>
                  <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${family.accent}25`, color: family.accent }}>
                  
                    {family.count}
                  </span>
                </div>

                {/* Note tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {family.examples.map((note) =>
                <span
                  key={note}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                  style={{ borderColor: `${family.accent}30`, color: `${family.accent}CC` }}>
                  
                      {note}
                    </span>
                )}
                </div>

                <button
                aria-label={`Explore ${family.name} fragrances`}
                className="flex items-center gap-2 text-sm font-semibold text-white/60 group-hover:text-white transition-colors">
                
                  Explore
                  <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-1">
                  
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>);

}