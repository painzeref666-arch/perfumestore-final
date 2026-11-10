'use client';

import { useEffect, useMemo, useState } from 'react';
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
    gallery_images?: string[];
  };
};

function uniqueImages(images: Array<string | undefined | null>) {
  return Array.from(new Set(images.filter((img): img is string => Boolean(img && String(img).trim()))));
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const images = useMemo(() => {
    const extra = Array.isArray(product.gallery_images)
      ? product.gallery_images
      : Array.isArray(product.gallery)
      ? product.gallery
      : Array.isArray(product.image_gallery)
        ? product.image_gallery
        : [];

    return uniqueImages([
      product.image,
      ...extra,
    ]).slice(0, 4);
  }, [product.gallery, product.gallery_images, product.image, product.image_gallery]);

  const [active, setActive] = useState(images[0] || product.image);

  useEffect(() => {
    if (!images.includes(active)) {
      setActive(images[0] || product.image);
    }
  }, [active, images, product.image]);


  return (
    <div className="space-y-4">
      <div
        className="group relative aspect-[4/5] overflow-hidden rounded-[2.75rem] border border-white/15 bg-[#16090b] shadow-2xl shadow-black/30"
      >
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,.22),transparent_28%),linear-gradient(120deg,transparent,rgba(255,255,255,.16),transparent)] opacity-80 transition duration-700 group-hover:translate-x-10" />
        <AppImage
          src={active}
          alt={product.name}
          fill
	  smartFill
          sizes="(max-width:1024px) 100vw,50vw"
          className="object-contain p-3 transition-opacity duration-300"
          priority
        />
        <div className="absolute left-6 top-6 z-20 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-stone-950 shadow-xl">
          {product.tag || product.promo || product.family || 'Featured'}
        </div>
        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between rounded-3xl border border-white/15 bg-black/45 p-4 backdrop-blur-xl">
          <div>
            <p className="text-xs font-black uppercase tracking-[.25em] text-amber-200">Full Product View</p>
            <p className="mt-1 text-sm font-bold text-white/70">Entire image displayed • No cropping</p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-2 text-xs font-black text-white">FIT</span>
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setActive(img)}
              className={`relative aspect-square overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 ${active === img ? 'border-amber-300 ring-2 ring-amber-400/40' : 'border-white/10 opacity-75 hover:opacity-100'}`}
              aria-label={`View ${product.name} image ${index + 1}`}
            >
              <AppImage src={img} alt={`${product.name} thumbnail ${index + 1}`} fill smartFill sizes="120px" className="object-contain bg-[#16090b] p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
