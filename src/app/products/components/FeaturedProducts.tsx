'use client';
import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import Price from '@/components/Price';

interface Product {
  id: number;
  name: string;
  house: string;
  price: number;
  size: string;
  badge?: 'new' | 'bestseller';
  rating: number;
  reviews: number;
  image: string;
  imageAlt: string;
  notes: string;
  span?: 'wide' | 'tall' | 'normal';
}

const products: Product[] = [
{
  id: 1,
  name: 'Amber Dusk',
  house: 'Maison Lumière',
  price: 148,
  size: '50ml EDP',
  badge: 'bestseller',
  rating: 4.9,
  reviews: 312,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ca1c0709-1772072287305.png",
  imageAlt: 'Amber Dusk perfume bottle with warm golden tones surrounded by amber resin',
  notes: 'Amber · Sandalwood · Vanilla',
  span: 'wide'
},
{
  id: 2,
  name: 'Rose Noir',
  house: 'Atelier Floral',
  price: 195,
  size: '100ml EDP',
  badge: 'new',
  rating: 4.8,
  reviews: 87,
  image: "https://images.unsplash.com/photo-1594035910663-369b72b7abe2",
  imageAlt: 'Rose Noir dark rose perfume bottle with deep crimson accents',
  notes: 'Black Rose · Oud · Patchouli',
  span: 'tall'
},
{
  id: 3,
  name: 'Sea Glass',
  house: 'Pacific Notes',
  price: 89,
  size: '30ml EDP',
  rating: 4.7,
  reviews: 203,
  image: "https://images.unsplash.com/photo-1691779599834-4dd285a66a7e",
  imageAlt: 'Sea Glass fresh aquatic perfume bottle in translucent blue glass',
  notes: 'Bergamot · Sea Salt · Driftwood',
  span: 'normal'
},
{
  id: 4,
  name: 'Velvet Oud',
  house: 'Al Nashama',
  price: 265,
  size: '75ml EDP',
  badge: 'bestseller',
  rating: 5.0,
  reviews: 156,
  image: "https://images.unsplash.com/photo-1706527412865-0f15b3321b7a",
  imageAlt: 'Velvet Oud luxury perfume bottle with deep burgundy velvet packaging',
  notes: 'Oud · Saffron · Rose Absolute',
  span: 'normal'
},
{
  id: 5,
  name: 'Citrus Dawn',
  house: 'Soleil Blanc',
  price: 74,
  size: '50ml EDT',
  badge: 'new',
  rating: 4.6,
  reviews: 44,
  image: "https://images.unsplash.com/photo-1658654482546-1b7daf94a663",
  imageAlt: 'Citrus Dawn bright yellow perfume bottle with citrus slice decoration',
  notes: 'Yuzu · Neroli · White Musk',
  span: 'normal'
},
{
  id: 6,
  name: 'Midnight Iris',
  house: 'Obscura Labs',
  price: 220,
  size: '50ml EDP',
  rating: 4.9,
  reviews: 98,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_10425683d-1768402944875.png",
  imageAlt: 'Midnight Iris dark purple perfume bottle with silver iris motif',
  notes: 'Iris · Vetiver · Smoked Cedar',
  span: 'wide'
}];


function StarRating({ rating }: {rating: number;}) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) =>
      <svg
        key={star}
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill={star <= Math.floor(rating) ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className="star-filled">
        
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}
    </div>);

}

function ProductCard({ product }: {product: Product;}) {
  const isWide = product.span === 'wide';
  const isTall = product.span === 'tall';

  return (
    <article
      className={`product-card group relative bg-card dark:bg-[#1A1410] rounded-4xl overflow-hidden border border-border dark:border-white/8 cursor-pointer
        ${isWide ? 'md:col-span-2' : ''}
        ${isTall ? 'md:row-span-2' : ''}
      `}>
      
      {/* Image */}
      <div className={`relative overflow-hidden ${isTall ? 'h-80 md:h-[480px]' : isWide ? 'h-64 md:h-72' : 'h-56'}`}>
        <AppImage
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes={isWide ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
          className="object-cover transition-transform duration-700 group-hover:scale-105" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Badge */}
        {product.badge &&
        <div className="absolute top-4 left-4">
            <span className={product.badge === 'new' ? 'badge-new' : 'badge-bestseller'}>
              {product.badge === 'new' ? 'New' : 'Best Seller'}
            </span>
          </div>
        }

        {/* Quick add overlay */}
        <div className="product-overlay absolute inset-x-4 bottom-4">
          <Link
            href={`/products/${product.id}`}
            aria-label={`View details for ${product.name}`}
            className="btn-amber w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2">
            
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            View Details — <Price amount={product.price} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <Link href={`/products/${product.id}`} className="block p-5 hover:bg-card/80 dark:hover:bg-white/5 transition-colors">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted dark:text-white/40 mb-1">{product.house}</p>
        <h3 className="text-lg font-bold text-foreground dark:text-white mb-1">{product.name}</h3>
        <p className="text-xs text-muted dark:text-white/40 mb-3">{product.notes}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted dark:text-white/40">({product.reviews})</span>
          </div>
          <div className="text-right">
            <Price amount={product.price} className="font-bold text-foreground dark:text-white" />
            <span className="text-xs text-muted dark:text-white/40 ml-1">{product.size}</span>
          </div>
        </div>
      </Link>
    </article>);

}

export default function FeaturedProducts() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray<HTMLElement>('.product-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i % 3 * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
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
      id="featured"
      ref={sectionRef}
      className="py-24 md:py-32 px-4 md:px-6 bg-background dark:bg-[#0F0D0A]"
      aria-labelledby="featured-heading">
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="reveal flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <p className="text-primary font-semibold uppercase tracking-[0.2em] text-xs mb-4">Curated Selection</p>
            <h2
              id="featured-heading"
              className="text-4xl md:text-6xl font-bold tracking-tighter leading-none text-foreground dark:text-white">
              
              Featured{' '}
              <span className="font-display italic font-normal text-primary">Fragrances.</span>
            </h2>
          </div>
          <p className="text-muted dark:text-white/50 max-w-xs leading-relaxed md:text-right">
            Handpicked by our master perfumers. Each fragrance tells a story.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-auto">
          {products.map((product) =>
          <ProductCard key={product.id} product={product} />
          )}
        </div>

        {/* View All */}
        <div className="mt-12 text-center reveal">
          <button
            aria-label="View all 200+ fragrances"
            className="inline-flex items-center gap-3 border border-border dark:border-white/15 rounded-full px-10 py-4 font-semibold text-foreground dark:text-white hover:bg-border/30 dark:hover:bg-white/8 transition-all">
            
            View All 200+ Fragrances
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>);

}