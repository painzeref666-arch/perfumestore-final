'use client';
import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Price from '@/components/Price';

export default function GiftBanner() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap?.registerPlugin(ScrollTrigger);

      // Parallax blobs
      gsap?.to('.gift-blob-1', {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef?.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
      gsap?.to('.gift-blob-2', {
        y: -30,
        x: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef?.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2
        }
      });

      // Content reveal
      gsap?.fromTo(
        '.gift-content',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef?.current,
            start: 'top 75%',
            toggleActions: 'play none none none'
          }
        }
      );
    };
    loadGSAP();
  }, []);

  return (
    <section
      id="gift"
      ref={sectionRef}
      className="py-24 md:py-32 px-4 md:px-6 gift-bg overflow-hidden relative"
      aria-labelledby="gift-heading">
      
      {/* Animated blobs */}
      <div
        className="gift-blob-1 blob absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,151,74,0.15) 0%, transparent 70%)' }}
        aria-hidden="true" />
      
      <div
        className="gift-blob-2 blob absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(201,151,74,0.08) 0%, transparent 70%)',
          animationDelay: '3s'
        }}
        aria-hidden="true" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative gift-content order-2 lg:order-1">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40 max-w-md mx-auto lg:mx-0">
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_19ad22eab-1772572629849.png"
                alt="Luxury perfume gift set wrapped in amber ribbon with tissue paper"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
            </div>

            {/* Floating badge */}
            <div
              className="absolute -top-6 -right-4 md:right-8 w-32 h-32 bg-primary rounded-full flex flex-col items-center justify-center text-white p-3 text-center shadow-xl"
              style={{ transform: 'rotate(-12deg)' }}
              aria-label="Free gift wrapping included">
              
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wide leading-tight">Free Gift Wrapping</span>
            </div>
          </div>

          {/* Content */}
          <div className="gift-content order-1 lg:order-2 space-y-8">
            <div>
              <p className="text-primary font-semibold uppercase tracking-[0.2em] text-xs mb-4">Perfect For Every Occasion</p>
              <h2
                id="gift-heading"
                className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight text-white">
                
                Give the Gift of{' '}
                <span className="font-display italic font-normal text-primary">
                  Scent.
                </span>
              </h2>
            </div>

            <p className="text-lg text-white/60 leading-relaxed max-w-md">
              Our curated gift sets make the perfect present — beautifully packaged, 
              with complimentary handwritten notes. From our Discovery Set, delivered in 2 days.
            </p>

            {/* Gift options */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
              { label: 'Discovery Set', price: 85, pieces: '5 × 5ml' },
              { label: 'Duo Gift', price: 145, pieces: '2 × 30ml' },
              { label: 'Luxury Box', price: 280, pieces: '3 × 50ml' }]?.
              map((option) =>
              <div
                key={option?.label}
                className="glass-dark rounded-2xl p-4 text-center cursor-pointer hover:border-primary/30 transition-all">
                
                  <p className="font-bold text-white text-sm">{option?.label}</p>
                  <p className="text-primary font-bold mt-1"><Price amount={option?.price ?? 0} /></p>
                  <p className="text-white/40 text-xs mt-0.5">{option?.pieces}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                aria-label="Shop gift sets"
                className="btn-amber inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-full text-base font-semibold">
                
                Shop Gift Sets
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" />
                </svg>
              </button>
              <button
                aria-label="Build a custom gift set"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 px-10 py-4 rounded-full text-base font-semibold hover:bg-white/5 transition-all">
                
                Build Custom Set
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>);

}