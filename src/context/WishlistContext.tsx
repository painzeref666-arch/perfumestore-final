'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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

function readLocal(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeLocal(ids: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { activeProducts } = useProducts();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function getUserId() {
    if (!supabase) return '';
    const { data } = await supabase.auth.getUser();
    return data.user?.id || '';
  }

  const refreshWishlist = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      setWishlistIds(readLocal());
      setLoading(false);
      return;
    }

    const userId = await getUserId();
    if (!userId) {
      setWishlistIds(readLocal());
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from('wishlists').select('product_id').eq('user_id', userId);
    if (error) setWishlistIds(readLocal());
    else setWishlistIds((data || []).map((x: any) => x.product_id));
    setLoading(false);
  };

  useEffect(() => {
    refreshWishlist();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => refreshWishlist());
    return () => data.subscription.unsubscribe();
  }, []);

  const persistLocal = (ids: string[]) => { setWishlistIds(ids); writeLocal(ids); };

  const removeFromWishlist = async (productId: string) => {
    if (isSupabaseConfigured && supabase) {
      const userId = await getUserId();
      if (userId) {
        await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId);
        await refreshWishlist();
        return;
      }
    }
    persistLocal(wishlistIds.filter((id) => id !== productId));
  };

  const toggleWishlist = async (productId: string) => {
    const exists = wishlistIds.includes(productId);
    if (exists) return removeFromWishlist(productId);

    if (isSupabaseConfigured && supabase) {
      const userId = await getUserId();
      if (userId) {
        const { error } = await supabase.from('wishlists').upsert({ user_id: userId, product_id: productId });
        if (!error) { await refreshWishlist(); return; }
      }
    }
    persistLocal([...wishlistIds, productId]);
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
