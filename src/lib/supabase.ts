import { createClient } from '@supabase/supabase-js';
import type { ManagedProduct } from '@/context/ProductContext';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type OrderLine = {
  product_id: string;
  product_name: string;
  size: string;
  concentration: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type CustomerDetails = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  payment_method: string;
};

export function productToRow(product: ManagedProduct) {
  return {
    id: product.id,
    name: product.name,
    family: product.family,
    notes: product.notes || [],
    price: product.price,
    size: product.size || '10ml',
    image: product.image,
    rating: product.rating || 5,
    reviews: product.reviews || 0,
    stock: product.stock || 0,
    tag: product.tag || product.promo || 'New',
    description: product.description || '',
    variants: product.variants || [],
    promo: product.promo || product.tag || '',
    event: product.event || '',
    sale_price: product.salePrice || null,
    active: product.active !== false,
    hero_enabled: product.hero_enabled || false,
    hero_badge: product.hero_badge || product.tag || product.promo || 'Featured',
    hero_title: product.hero_title || product.name,
    hero_description: product.hero_description || product.description || '',
    hero_button_text: product.hero_button_text || 'View Perfume',
    hero_button_link: product.hero_button_link || `/products/${product.id}`,
    hero_order: product.hero_order || 0,
  };
}

export function rowToProduct(row: any): ManagedProduct {
  return {
    id: row.id,
    name: row.name,
    family: row.family,
    notes: Array.isArray(row.notes) ? row.notes : [],
    price: Number(row.price || 0),
    size: row.size || '10ml',
    image: row.image || '/assets/images/no_image.png',
    rating: Number(row.rating || 5),
    reviews: Number(row.reviews || 0),
    stock: Number(row.stock || 0),
    tag: row.tag || row.promo || 'New',
    description: row.description || '',
    variants: Array.isArray(row.variants) ? row.variants : [],
    promo: row.promo || row.tag || '',
    event: row.event || '',
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    active: row.active !== false,
    hero_enabled: row.hero_enabled === true,
    hero_badge: row.hero_badge || row.tag || row.promo || 'Featured',
    hero_title: row.hero_title || row.name,
    hero_description: row.hero_description || row.description || '',
    hero_button_text: row.hero_button_text || 'View Perfume',
    hero_button_link: row.hero_button_link || `/products/${row.id}`,
    hero_order: Number(row.hero_order || 0),
  };
}
