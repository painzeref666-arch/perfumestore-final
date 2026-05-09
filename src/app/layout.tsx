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
  title: 'Exousia & Co. — Luxury Inspired Perfumes',
  description: 'Shop Exousia & Co. luxury inspired perfumes with secure checkout, GCash payment verification, customer reviews, and order tracking.',
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