import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return [
    {
      url: `${baseUrl}/products`,
      lastModified: new Date('2026-03-14'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}