'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured, withTimeout } from '@/lib/supabase';
import { useProducts, type ManagedProduct } from '@/context/ProductContext';

type WishlistContextValue = {
  wishlistIds: string[];
  wishlistProducts: ManagedProduct[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
};

const C = createContext<WishlistContextValue | undefined>(undefined);
const KEY = 'exousia-wishlist-v1';
const WISHLIST_TIMEOUT_MS = 4500;

function normalizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((id) => String(id || '').trim()).filter(Boolean)));
}

function mergeIds(current: string[], next: string[]) {
  return Array.from(new Set([...current, ...next].filter(Boolean)));
}

function readLocal(): string[] {
  try { return normalizeIds(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return []; }
}
function writeLocal(ids: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(normalizeIds(ids))); } catch {}
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { activeProducts } = useProducts();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function getUserId() {
    if (!supabase) return '';
    const { data } = await withTimeout(
      supabase.auth.getUser(),
      WISHLIST_TIMEOUT_MS,
      'Wishlist session check'
    );
    return data.user?.id || '';
  }

  const refreshWishlist = async () => {
    const localIds = readLocal();
    setWishlistIds(localIds);
    setLoading(localIds.length === 0);

    try {
      if (!isSupabaseConfigured || !supabase) return;

      const userId = await getUserId();
      if (!userId) return;

      const { data, error } = await withTimeout(
        supabase.from('wishlists').select('product_id').eq('user_id', userId),
        WISHLIST_TIMEOUT_MS,
        'Wishlist load'
      );
      if (error) throw error;

      const remoteIds = normalizeIds((data || []).map((x: any) => x.product_id));
      const mergedIds = mergeIds(localIds, remoteIds);
      setWishlistIds(mergedIds);
      writeLocal(mergedIds);
    } catch {
      setWishlistIds(readLocal());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => refreshWishlist());
    return () => data.subscription.unsubscribe();
  }, []);

  const persistLocal = (ids: string[]) => {
    const normalized = normalizeIds(ids);
    setWishlistIds(normalized);
    writeLocal(normalized);
  };

  const removeFromWishlist = async (productId: string) => {
    persistLocal(wishlistIds.filter((id) => id !== productId));

    if (isSupabaseConfigured && supabase) {
      try {
        const userId = await getUserId();
        if (userId) {
          await withTimeout(
            supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId),
            WISHLIST_TIMEOUT_MS,
            'Wishlist remove'
          );
        }
      } catch {
        // Keep local wishlist usable even if the remote wishlist table is unavailable.
      }
    }
  };

  const toggleWishlist = async (productId: string) => {
    const exists = wishlistIds.includes(productId);
    if (exists) return removeFromWishlist(productId);

    persistLocal(mergeIds(wishlistIds, [productId]));

    if (isSupabaseConfigured && supabase) {
      try {
        const userId = await getUserId();
        if (userId) {
          await withTimeout(
            supabase.from('wishlists').upsert({ user_id: userId, product_id: productId }),
            WISHLIST_TIMEOUT_MS,
            'Wishlist save'
          );
        }
      } catch {
        // Local save already succeeded, so the customer can keep using wishlist.
      }
    }
  };

  const wishlistProducts = useMemo(
    () => activeProducts.filter((p) => wishlistIds.includes(p.id)),
    [activeProducts, wishlistIds]
  );

  return <C.Provider value={{ wishlistIds, wishlistProducts, loading, isWishlisted: (id) => wishlistIds.includes(id), toggleWishlist, removeFromWishlist, refreshWishlist }}>{children}</C.Provider>;
}

export function useWishlist() {
  const c = useContext(C);
  if (!c) throw new Error('useWishlist must be used inside WishlistProvider');
  return c;
}
