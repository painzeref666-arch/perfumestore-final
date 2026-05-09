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
    const ok = await addToCart(productId, size, concentration);
    if (ok) setChecking(false);
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
