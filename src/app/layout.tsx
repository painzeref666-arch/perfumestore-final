import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import { WishlistProvider } from '@/context/WishlistContext';
import CartDrawer from '@/components/shop/CartDrawer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'PerfumeStore — Discover Your Signature Scent',
  description: 'Shop curated luxury fragrances at PerfumeStore. From floral to woody, find your perfect scent with same-day dispatch across the US.',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <CurrencyProvider>
            <ProductProvider>
              <CartProvider>
                <WishlistProvider>
                  {children}
                  <CartDrawer />
                </WishlistProvider>
              </CartProvider>
            </ProductProvider>
          </CurrencyProvider>
        </ThemeProvider>
</body>
    </html>
  );
}