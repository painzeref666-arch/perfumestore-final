'use client';
import React, { useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  fragrance: string;
  rating: number;
  avatar: string;
  avatarAlt: string;
  accent: 'amber' | 'gold';
}

const testimonials: Testimonial[] = [
{
  quote: "Amber Dusk is everything I've been searching for in a signature scent. The dry-down is absolutely extraordinary — warm amber with the most delicate vanilla finish. I've received more compliments wearing this than anything else in my collection.",
  name: 'Natalie Chen',
  location: 'San Francisco, CA',
  fragrance: 'Amber Dusk by Maison Lumière',
  rating: 5,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_165d5e118-1772208472738.png",
  avatarAlt: 'Natalie Chen, customer from San Francisco smiling',
  accent: 'amber'
},
{
  quote: "I was skeptical about buying fragrance online, but the sample kit convinced me instantly. Velvet Oud is unlike anything I've smelled — complex, long-lasting, and genuinely luxurious. Shipped the same day and arrived beautifully packaged.",
  name: 'Marcus Williams',
  location: 'Chicago, IL',
  fragrance: 'Velvet Oud by Al Nashama',
  rating: 5,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14fb3ef93-1772883344288.png",
  avatarAlt: 'Marcus Williams, customer from Chicago with confident expression',
  accent: 'gold'
}];


function StarsFull({ count }: {count: number;}) {
  return (
    <div className="flex gap-1" aria-label={`${count} stars`}>
      {Array.from({ length: count }).map((_, i) =>
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}
    </div>);

}

export default function Testimonials() {
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray<HTMLElement>('.testimonial-item').forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
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
      id="testimonials"
      className="py-24 md:py-32 px-4 md:px-6 bg-background dark:bg-[#0F0D0A]"
      aria-labelledby="testimonials-heading">
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-primary font-semibold uppercase tracking-[0.2em] text-xs mb-4">What Our Customers Say</p>
          <h2
            id="testimonials-heading"
            className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground dark:text-white">
            
            Worn & Loved by{' '}
            <span className="font-display italic font-normal text-primary">50,000+.</span>
          </h2>
        </div>

        {/* Two-column testimonials */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {testimonials.map((t, i) =>
          <article
            key={t.name}
            className={`testimonial-item bg-card dark:bg-[#1A1410] border border-border dark:border-white/8 rounded-4xl p-8 md:p-10 relative overflow-hidden`}>
            
              {/* Accent glow */}
              <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
              style={{ background: t.accent === 'amber' ? 'rgba(201,151,74,0.08)' : 'rgba(212,175,55,0.08)' }}
              aria-hidden="true" />
            

              {/* Stars */}
              <StarsFull count={t.rating} />

              {/* Quote */}
              <blockquote className="mt-5 text-lg md:text-xl leading-relaxed text-foreground dark:text-white/90 font-medium italic relative z-10">
                "{t.quote}"
              </blockquote>

              {/* Fragrance tag */}
              <div className="mt-5 inline-flex items-center gap-2 bg-primary/8 border border-primary/15 px-3 py-1.5 rounded-full">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                  <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" />
                </svg>
                <span className="text-xs font-semibold text-primary">{t.fragrance}</span>
              </div>

              {/* Author */}
              <div className="mt-6 flex items-center gap-4 pt-6 border-t border-border dark:border-white/8">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <AppImage
                  src={t.avatar}
                  alt={t.avatarAlt}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover" />
                
                </div>
                <div>
                  <p className="font-bold text-foreground dark:text-white">{t.name}</p>
                  <p className="text-xs text-muted dark:text-white/40">{t.location}</p>
                </div>
                {/* Verified badge */}
                <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Verified Purchase
                </div>
              </div>
            </article>
          )}
        </div>

        {/* Trust bar */}
        <div className="mt-14 reveal grid grid-cols-2 md:grid-cols-4 gap-6 border border-border dark:border-white/8 rounded-4xl p-8 dark:bg-[#1A1410]/50">
          {[
          { icon: '🚚', label: 'Same-Day Dispatch', sub: 'Orders before 3pm EST' },
          { icon: '🔁', label: '30-Day Returns', sub: 'Hassle-free exchanges' },
          { icon: '🧴', label: 'Sample Kits', sub: 'Try before you commit' },
          { icon: '🔒', label: 'Secure Checkout', sub: 'SSL encrypted payments' }].
          map((item) =>
          <div key={item.label} className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl" role="img" aria-label={item.label}>{item.icon}</span>
              <p className="font-semibold text-sm text-foreground dark:text-white">{item.label}</p>
              <p className="text-xs text-muted dark:text-white/40">{item.sub}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}