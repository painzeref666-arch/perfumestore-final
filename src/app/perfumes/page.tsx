import type { Metadata } from 'next';
import CategoryLandingPage from '@/components/shop/CategoryLandingPage';

export const metadata: Metadata = { title: 'Perfumes — Exousia & Co.', description: 'Shop Exousia perfume collection.' };

export default function Page() {
  return <CategoryLandingPage category="perfumes" />;
}
