'use client';
import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

const archImages = [
{ src: "https://images.unsplash.com/photo-1599342166997-58552e91d9f5", alt: 'Floral perfume bottle with white flowers on marble surface', style: { left: '3%', top: '72%', transform: 'rotate(-38deg)' } },
{ src: "https://images.unsplash.com/photo-1720423738890-37689a6f6b95", alt: 'Elegant amber glass perfume bottle on dark background', style: { left: '13%', top: '42%', transform: 'rotate(-26deg)' } },
{ src: "https://images.unsplash.com/photo-1659006026407-af59b9046ce3", alt: 'Crystal clear perfume flacon with golden cap on white surface', style: { left: '24%', top: '16%', transform: 'rotate(-15deg)' } },
{ src: "https://images.unsplash.com/photo-1595425959632-34f2822322ce", alt: 'Luxury perfume bottle surrounded by rose petals', style: { left: '37%', top: '4%', transform: 'rotate(-5deg)' } },
{ src: "https://images.unsplash.com/photo-1717992411100-50402e0216fe", alt: 'Modern minimalist perfume bottle on reflective surface', style: { left: '51%', top: '4%', transform: 'rotate(5deg)' } },
{ src: "https://images.unsplash.com/photo-1609186482504-67c8fb2cedb9", alt: 'Vintage style perfume bottle with ornate details', style: { left: '64%', top: '16%', transform: 'rotate(15deg)' } },
{ src: "https://images.unsplash.com/photo-1642698215110-87817f1fbe0e", alt: 'Oud and spice fragrance bottle with wooden accents', style: { left: '76%', top: '42%', transform: 'rotate(26deg)' } },
{ src: "https://images.unsplash.com/photo-1684953461064-b2591660c574", alt: 'Fresh citrus perfume bottle on linen background', style: { left: '86%', top: '72%', transform: 'rotate(38deg)' } }];


export default function HeroSection() {
  const archRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load GSAP
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // Initial states
      gsap.set('.arch-image', { opacity: 0, y: 40 });
      gsap.set([titleRef.current, descRef.current, btnsRef.current, statsRef.current], { opacity: 0, y: 30 });

      // Hero entrance timeline
      const tl = gsap.timeline({ delay: 0.2 });
      tl.to('.arch-image', {
        opacity: 1,
        y: 0,
        duration: 1.6,
        stagger: 0.08,
        ease: 'elastic.out(1, 0.75)'
      }).
      to(titleRef.current, { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out' }, '-=1').
      to(descRef.current, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.8').
      to(btnsRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.7').
      to(statsRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');

      // Subtle parallax on arch images on scroll
      gsap.to('.arch-image', {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    };

    loadGSAP();
  }, []);

  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex flex-col items-center justify-center pt-44 pb-24 overflow-hidden bg-background dark:bg-[#0F0D0A]"
      aria-label="Hero section">
      
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(201,151,74,0.07) 0%, transparent 70%)'
        }}
        aria-hidden="true" />
      

      {/* Arching Image Gallery */}
      <div
        ref={archRef}
        className="absolute top-28 left-1/2 -translate-x-1/2 w-full max-w-[1100px] h-[380px] pointer-events-none"
        aria-hidden="true">
        
        {archImages.map((img, i) =>
        <AppImage
          key={i}
          src={img.src}
          alt={img.alt}
          width={130}
          height={160}
          className="arch-image"
          style={img.style as React.CSSProperties} />

        )}
      </div>

      {/* Hero Content */}
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center mt-44">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          New Spring Collection 2026
        </div>

        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6 text-foreground dark:text-white">
          
          Make Everywhere Your{' '}
          <span className="font-display italic font-normal text-primary">
            Territory.
          </span>
        </h1>

        <p
          ref={descRef}
          className="text-lg md:text-xl text-muted dark:text-white/50 max-w-xl mx-auto leading-relaxed mb-10">
          
          Over 200 hand-curated fragrances from the world's finest perfumers.
          From morning freshness to midnight mystery — your scent awaits.
        </p>

        <div
          ref={btnsRef}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          
          <a
            href="#featured"
            className="btn-amber inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-full text-base font-semibold shadow-lg shadow-primary/20">
            
            Explore Collection
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#scent-families"
            className="inline-flex items-center justify-center gap-2.5 border border-border dark:border-white/15 bg-card dark:bg-white/5 px-10 py-4 rounded-full text-base font-semibold text-foreground dark:text-white hover:bg-border/30 dark:hover:bg-white/10 transition-all">
            
            Find My Scent
          </a>
        </div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          
          {[
          { value: '200+', label: 'Fragrances' },
          { value: '50k+', label: 'Happy Customers' },
          { value: '4.9★', label: 'Average Rating' }].
          map((stat) =>
          <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold tracking-tighter text-foreground dark:text-white">{stat.value}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted dark:text-white/40 font-semibold mt-1">{stat.label}</p>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted dark:text-white/30 animate-bounce" aria-hidden="true">
        <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>);

}