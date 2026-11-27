import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Exousia & Co. — Luxury Fragrance, Beauty & Wellness',
    short_name: 'Exousia & Co.',
    description: 'Shop signature fragrances, beauty essentials, and wellness rituals from Exousia & Co.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#E7E5E4',
    theme_color: '#8A0303',
    categories: ['shopping', 'beauty', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192-v2.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512-v2.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512-v2.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
