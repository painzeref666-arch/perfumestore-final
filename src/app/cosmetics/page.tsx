import type { Metadata } from 'next';
import CategoryLandingPage from '@/components/shop/CategoryLandingPage';

export const metadata: Metadata = { title: 'Cosmetics — Exousia & Co.', description: 'Shop Exousia cosmetics collection.' };

export default function Page() {
  return <CategoryLandingPage category="cosmetics" />;
}
