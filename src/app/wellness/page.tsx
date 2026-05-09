import type { Metadata } from 'next';
import CategoryLandingPage from '@/components/shop/CategoryLandingPage';

export const metadata: Metadata = { title: 'Wellness — Exousia & Co.', description: 'Shop Exousia wellness collection.' };

export default function Page() {
  return <CategoryLandingPage category="wellness" />;
}
