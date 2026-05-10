'use client';
import { ReactNode, useState } from 'react';
import { useCart } from '@/context/CartContext';
import type { ConcentrationOption, SizeOption } from '@/data/products';

export default function AddToCartButton({ productId, size = '10ml', concentration = 'EDP', className = '', children = 'Add to Cart' }: { productId: string; size?: SizeOption; concentration?: ConcentrationOption; className?: string; children?: ReactNode }) {
  const { addToCart } = useCart();
  const [checking, setChecking] = useState(false);

  async function handleClick() {
    if (checking) return;

    setChecking(true);

    const timeout = new Promise<boolean>((resolve) => {
      window.setTimeout(() => resolve(false), 5000);
    });

    try {
      const ok = await Promise.race([
        addToCart(productId, size, concentration),
        timeout,
      ]);

      if (!ok && typeof window !== 'undefined') {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/account?loginRequired=1&redirect=${redirect}`;
        return;
      }
    } catch (error) {
      console.error('Add to cart failed:', error);
      if (typeof window !== 'undefined') {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/account?loginRequired=1&redirect=${redirect}`;
        return;
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={checking}
      className={className || 'rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-800 disabled:cursor-wait disabled:opacity-70'}
    >
      {checking ? 'Checking account...' : children}
    </button>
  );
}
