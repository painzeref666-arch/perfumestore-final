'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import AppImage from '@/components/ui/AppImage';

type ProductGalleryProps = {
  product: {
    name: string;
    image: string;
    family?: string;
    tag?: string;
    promo?: string;
    notes?: string[];
    gallery?: string[];
    image_gallery?: string[];
  };
};

function uniqueImages(images: Array<string | undefined | null>) {
  return Array.from(new Set(images.filter((img): img is string => Boolean(img && String(img).trim()))));
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const images = useMemo(() => {
    const extra = Array.isArray(product.gallery)
      ? product.gallery
      : Array.isArray(product.image_gallery)
        ? product.image_gallery
        : [];

    // The extra generated image URLs keep the gallery premium even when a product has only one uploaded photo.
    return uniqueImages([
      product.image,
      ...extra,
      'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=1200&auto=format&fit=crop',
    ]).slice(0, 5);
  }, [product.gallery, product.image, product.image_gallery]);

  const [active, setActive] = useState(images[0] || product.image);
  const [zoom, setZoom] = useState({ x: 50, y: 50, on: false });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ x, y, on: true });
  }

  return (
    <div className="space-y-4">
      <div
        className="group relative aspect-[4/5] overflow-hidden rounded-[2.75rem] border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-amber-500/10 shadow-2xl shadow-black/30"
        onMouseMove={handleMove}
        onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
        onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
      >
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,.22),transparent_28%),linear-gradient(120deg,transparent,rgba(255,255,255,.16),transparent)] opacity-80 transition duration-700 group-hover:translate-x-10" />
        <AppImage
          src={active}
          alt={product.name}
          fill
          sizes="(max-width:1024px) 100vw,50vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-110"
          style={{
            transformOrigin: `${zoom.x}% ${zoom.y}%`,
            transform: zoom.on ? 'scale(1.55)' : 'scale(1)',
            transition: zoom.on ? 'transform 120ms ease-out' : 'transform 700ms ease-out',
          }}
          priority
        />
        <div className="absolute left-6 top-6 z-20 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-stone-950 shadow-xl">
          {product.tag || product.promo || product.family || 'Featured'}
        </div>
        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between rounded-3xl border border-white/15 bg-black/45 p-4 backdrop-blur-xl">
          <div>
            <p className="text-xs font-black uppercase tracking-[.25em] text-amber-200">Luxury Detail View</p>
            <p className="mt-1 text-sm font-bold text-white/70">Hover image to zoom</p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-2 text-xs font-black text-white">⌕ Zoom</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {images.map((img, index) => (
          <button
            key={`${img}-${index}`}
            type="button"
            onClick={() => setActive(img)}
            className={`relative aspect-square overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 ${active === img ? 'border-amber-300 ring-2 ring-amber-400/40' : 'border-white/10 opacity-75 hover:opacity-100'}`}
            aria-label={`View ${product.name} image ${index + 1}`}
          >
            <AppImage src={img} alt={`${product.name} thumbnail ${index + 1}`} fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
