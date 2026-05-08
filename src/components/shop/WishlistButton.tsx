'use client';

import { useWishlist } from '@/context/WishlistContext';

export default function WishlistButton({ productId, className = '' }: { productId: string; className?: string }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(productId);
  return (
    <button
      type="button"
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(productId); }}
      className={`inline-flex items-center justify-center rounded-full border transition ${active ? 'border-rose-400 bg-rose-500 text-white' : 'border-white/20 bg-white/10 text-white hover:border-rose-300'} ${className}`}
    >
      {active ? '♥' : '♡'}
    </button>
  );
}
