'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  products as defaultProducts,
  type Product,
  type ProductVariant,
  type SizeOption,
  type ConcentrationOption,
} from '@/data/products';
import { isSupabaseConfigured, productToRow, rowToProduct, supabase, supabaseConfigError, withTimeout } from '@/lib/supabase';

export type ManagedProduct = Product & {
  category?: 'perfumes' | 'cosmetics' | 'wellness' | string;
  event?: string;
  promo?: string;
  salePrice?: number;
  active?: boolean;
};

type ProductContextValue = {
  products: ManagedProduct[];
  activeProducts: ManagedProduct[];
  loading: boolean;
  usingSupabase: boolean;
  error: string;
  addProduct: (p: ManagedProduct) => Promise<void>;
  updateProduct: (id: string, p: Partial<ManagedProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProducts: () => Promise<void>;
  refreshProducts: () => Promise<void>;
};

const C = createContext<ProductContextValue | undefined>(undefined);
const KEY = 'perfumestore-products-v5-supabase-fallback';
const seed: ManagedProduct[] = defaultProducts.map((p, index) => ({
  ...p,
  active: true,
  category: p.category || 'perfumes',
  promo: p.tag,
  event: '',
  hero_enabled: index < 4,
  hero_badge: p.tag,
  hero_title: p.name,
  hero_description: p.description,
  hero_button_text: 'View Perfume',
  hero_button_link: `/products/${p.id}`,
  hero_order: index + 1,
}));

function mergeById(products: ManagedProduct[], product: ManagedProduct) {
  return products.some((p) => p.id === product.id)
    ? products.map((p) => (p.id === product.id ? product : p))
    : [product, ...products];
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ManagedProduct[]>(seed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const saveLocal = (next: ManagedProduct[]) => {
    setProducts(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const loadLocal = () => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        setProducts(JSON.parse(saved));
        return;
      }
    } catch {}
    setProducts(seed);
  };

  const refreshProducts = async () => {
    setLoading(true);
    setError('');

    try {
      if (!isSupabaseConfigured || !supabase) {
        if (supabaseConfigError) setError(`${supabaseConfigError} Using built-in demo products for now.`);
        loadLocal();
        return;
      }

      const response = await fetch('/api/admin/products', { cache: 'no-store' });
      const json = await response.json();

      if (json.error) {
        setError(`Products are using backup mode. ${json.error}`);
        loadLocal();
      } else if (!json.data || json.data.length === 0) {
        setProducts(seed);
      } else {
        setProducts(json.data.map(rowToProduct));
      }
    } catch (err: any) {
      setError(`Products are using backup mode. ${err?.message || 'Supabase request did not finish.'}`);
      loadLocal();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const activeProducts = useMemo(() => products.filter((p) => p.active !== false), [products]);

  const addProduct = async (p: ManagedProduct) => {
    const product = { ...p, active: p.active !== false };
    if (isSupabaseConfigured && supabase) {
      const { error: dbError } = await withTimeout(supabase.from('products').upsert(productToRow(product)), 10000, 'Product save');
      if (dbError) {
        setError(dbError.message);
        throw dbError;
      }
      await refreshProducts();
      return;
    }
    saveLocal(mergeById(products, product));
  };

  const updateProduct = async (id: string, p: Partial<ManagedProduct>) => {
    const current = products.find((x) => x.id === id);
    const product = { ...current, ...p, id } as ManagedProduct;

    if (isSupabaseConfigured && supabase) {
      const { error: dbError } = await withTimeout(supabase.from('products').upsert(productToRow(product)), 10000, 'Product save');
      if (dbError) {
        setError(dbError.message);
        throw dbError;
      }
      await refreshProducts();
      return;
    }

    saveLocal(products.map((x) => (x.id === id ? product : x)));
  };

  const deleteProduct = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error: dbError } = await supabase.from('products').delete().eq('id', id);
      if (dbError) {
        setError(dbError.message);
        throw dbError;
      }
      await refreshProducts();
      return;
    }
    saveLocal(products.filter((x) => x.id !== id));
  };

  const resetProducts = async () => {
    if (isSupabaseConfigured && supabase) {
      const rows = seed.map(productToRow);
      const { error: dbError } = await withTimeout(supabase.from('products').upsert(rows), 10000, 'Products seed save');
      if (dbError) {
        setError(dbError.message);
        throw dbError;
      }
      await refreshProducts();
      return;
    }
    saveLocal(seed);
  };

  return (
    <C.Provider
      value={{
        products,
        activeProducts,
        loading,
        usingSupabase: isSupabaseConfigured,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProducts,
        refreshProducts,
      }}
    >
      {children}
    </C.Provider>
  );
}

export function useProducts() {
  const c = useContext(C);
  if (!c) throw new Error('useProducts must be used inside ProductProvider');
  return c;
}

export function makeProductId(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `product-${Date.now()}`
  );
}

export function getVariantPrice(
  product: ManagedProduct,
  size: SizeOption,
  concentration: ConcentrationOption
) {
  const v = product.variants?.find((x) => x.concentration === concentration);
  return v?.prices?.[size] ?? product.salePrice ?? product.price;
}

export function defaultVariants(base = 999): ProductVariant[] {
  return [
    {
      concentration: 'EDP',
      prices: {
        '10ml': base,
        '15ml': Math.round(base * 1.35),
        '50ml': Math.round(base * 3.5),
        '85ml': Math.round(base * 5.2),
      },
    },
    {
      concentration: 'Extrait',
      prices: {
        '10ml': Math.round(base * 1.3),
        '15ml': Math.round(base * 1.8),
        '50ml': Math.round(base * 4.6),
        '85ml': Math.round(base * 6.9),
      },
    },
  ];
}
