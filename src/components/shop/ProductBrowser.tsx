'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import CurrencySelector from '@/components/CurrencySelector';
import Price from '@/components/Price';
import AddToCartButton from '@/components/shop/AddToCartButton';
import WishlistButton from '@/components/shop/WishlistButton';
import { getAvailableVariantOptions, getDefaultVariantOption, getLowestVariantPrice, useProducts } from '@/context/ProductContext';
import type { SizeOption, ConcentrationOption } from '@/data/products';

const families = ['All', 'Amber', 'Floral', 'Woody', 'Fresh', 'Oud', 'Citrus', 'Skin Care', 'Makeup', 'Body Care', 'Wellness'];

type Product = ReturnType<typeof useProducts>['activeProducts'][number];
type CategoryKey = 'perfumes' | 'cosmetics' | 'wellness';

const categoryCopy: Record<CategoryKey, { eyebrow: string; title: string; description: string; empty: string }> = {
  perfumes: {
    eyebrow: 'Perfume Collection',
    title: 'Luxury perfumes',
    description: 'Choose size, variation, currency, then add your perfume to cart.',
    empty: 'No perfumes found. Add perfume products in Admin or try another search.',
  },
  cosmetics: {
    eyebrow: 'Cosmetics Collection',
    title: 'Cosmetics essentials',
    description: 'Shop beauty, makeup, skin-prep, and glow essentials with category-specific product details.',
    empty: 'No cosmetics yet. Add cosmetics products in Admin and set category to cosmetics.',
  },
  wellness: {
    eyebrow: 'Wellness Collection',
    title: 'Wellness essentials',
    description: 'Shop self-care, body care, and wellness products with inventory, wishlist, and checkout support.',
    empty: 'No wellness products yet. Add wellness products in Admin and set category to wellness.',
  },
};

function productCategory(product: Product): CategoryKey {
  const category = String(product.category || 'perfumes').toLowerCase();
  if (category === 'cosmetics' || category === 'wellness') return category;
  return 'perfumes';
}

function ProductCard({ product }: { product: Product }) {
  const category = productCategory(product);
  const isPerfume = category === 'perfumes';
  const availableVariants = useMemo(() => getAvailableVariantOptions(product), [product]);
  const defaultVariant = useMemo(() => getDefaultVariantOption(product), [product]);
  const [variantKey, setVariantKey] = useState(defaultVariant?.key || '');

  useEffect(() => {
    if (!availableVariants.some((option) => option.key === variantKey)) {
      setVariantKey(defaultVariant?.key || '');
    }
  }, [availableVariants, defaultVariant, variantKey]);

  const selectedVariant = availableVariants.find((option) => option.key === variantKey) || defaultVariant;
  const size = (selectedVariant?.size || '10ml') as SizeOption;
  const concentration = (selectedVariant?.concentration || 'EDP') as ConcentrationOption;
  const price = isPerfume
    ? (selectedVariant?.price || getLowestVariantPrice(product))
    : Number(product.price || 0);
  const productType = category === 'cosmetics' ? 'Beauty' : category === 'wellness' ? 'Wellness' : concentration;
  const detailLabel = category === 'cosmetics' ? 'Shade / finish' : category === 'wellness' ? 'Benefit / variant' : 'Variation';
  const detailValue = category === 'cosmetics'
    ? (product.size || product.notes.slice(0, 2).join(' / ') || 'Standard')
    : category === 'wellness'
      ? (product.size || product.family || 'Daily care')
      : concentration;

  return (
    <article className="product-card group relative overflow-hidden rounded-[2rem] border border-[#C5A46D]/70 bg-[#FFFCF8] p-4 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/10 dark:border-[#C5A46D]/70 dark:bg-[#700404]">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-stone-100">
        <AppImage src={product.image} alt={product.name} fill smartFill sizes="(max-width:768px) 100vw,33vw" className="object-contain transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full border border-[#C5A46D]/80 bg-[#700404]/95 px-3 py-1 text-xs font-black text-[#E0C27A]">{product.promo || product.tag}</span>
        <span className="absolute bottom-4 right-4 rounded-full border border-[#C5A46D]/70 bg-[#700404]/95 px-3 py-1 text-xs font-black text-[#E0C27A]">Rating {product.rating}</span>
      </Link>
      <WishlistButton productId={product.id} className="absolute right-8 top-8 z-10 h-11 w-11 border border-[#C5A46D]/70 bg-[#700404]/90 text-xl text-[#E0C27A] backdrop-blur" />

      <div className="p-2 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/products/${product.id}`} className="text-[#6B4B16] transition-colors hover:text-[#8A0303] dark:text-[#E0C27A] dark:hover:text-[#F4DEA2]">
              <h2 className="text-2xl font-black">{product.name}</h2>
            </Link>
            <p className="mt-1 text-sm font-semibold text-[#75551D] dark:text-[#D6B36A]">{product.family} - {productType}</p>
          </div>
          <Price amount={price} className="text-xl font-black text-[#6B4B16] dark:text-[#E0C27A]" />
        </div>

        <p className="mt-3 text-sm leading-6 text-[#392A24]/90 dark:text-[#FFF9F2]/80">{product.description}</p>
        {product.event && <p className="mt-3 rounded-2xl border border-[#C5A46D]/50 bg-[#700404] px-4 py-2 text-xs font-black text-[#E0C27A]">{product.event}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {product.notes.map((note) => (
            <span key={note} className="rounded-full border border-[#C5A46D]/50 bg-[#F1E7D9] px-3 py-1 text-xs font-bold text-[#6B4B16] dark:bg-[#700404] dark:text-[#D6B36A]">{note}</span>
          ))}
        </div>

        {isPerfume ? (
          <div className="mt-5">
            {availableVariants.length > 1 ? (
              <label className="text-xs font-black uppercase tracking-widest text-[#D6B36A]">
                Choose option
                <select
                  value={selectedVariant?.key || ''}
                  onChange={(event) => setVariantKey(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#C5A46D]/60 bg-[#700404] px-3 py-3 text-sm font-bold normal-case text-[#FFF9F2] outline-none"
                >
                  {availableVariants.map((option) => (
                    <option key={option.key} value={option.key}>{option.label} — ₱{option.price.toLocaleString()}</option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="rounded-2xl border border-[#C5A46D]/60 bg-[#700404] px-4 py-3 text-[#FFF9F2]">
                <p className="text-xs font-black uppercase tracking-widest text-[#D6B36A]">Available option</p>
                <p className="mt-1 text-sm font-black text-[#E0C27A]">{selectedVariant?.label || 'Unavailable'}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-[#C5A46D]/60 bg-[#700404] px-4 py-3 text-[#FFF9F2]">
            <p className="text-xs font-black uppercase tracking-widest text-[#D6B36A]">{detailLabel}</p>
            <p className="mt-1 text-sm font-bold text-[#E0C27A]">{detailValue}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-[#655238] dark:text-[#D6B36A]/85">{product.stock} stocks - {product.reviews} reviews</p>
          <AddToCartButton
            productId={product.id}
            size={isPerfume ? size : '10ml'}
            concentration={isPerfume ? concentration : 'EDP'}
            disabled={isPerfume && availableVariants.length === 0}
            className="rounded-full border border-[#C5A46D]/70 bg-[#700404] px-5 py-3 text-sm font-black text-[#E0C27A] transition hover:bg-[#8A0303] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to Cart
          </AddToCartButton>
        </div>
      </div>
    </article>
  );
}

export default function ProductBrowser({ category = 'perfumes', title, description }: { category?: CategoryKey | 'all'; title?: string; description?: string }) {
  const { activeProducts: products } = useProducts();
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState('All');
  const [sort, setSort] = useState('featured');
  const [stock, setStock] = useState('all');
  const copy = category === 'all' ? categoryCopy.perfumes : categoryCopy[category];

  const list = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return products
      .filter((product) => category === 'all' || productCategory(product) === category)
      .filter((product) => {
        const inFamily = family === 'All' || product.family === family;
        const inStock = stock === 'all' || (stock === 'in' ? (product.stock || 0) > 0 : (product.stock || 0) <= 0);
        const matchesQuery = !normalizedQuery || [product.name, product.family, product.description, product.category, ...product.notes].join(' ').toLowerCase().includes(normalizedQuery);
        return inFamily && inStock && matchesQuery;
      })
      .sort((a, b) => {
        const priceA = productCategory(a) === 'perfumes' ? getLowestVariantPrice(a) : Number(a.price || 0);
        const priceB = productCategory(b) === 'perfumes' ? getLowestVariantPrice(b) : Number(b.price || 0);
        if (sort === 'price-low') return priceA - priceB;
        if (sort === 'price-high') return priceB - priceA;
        if (sort === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [query, family, sort, stock, products, category]);

  return (
    <section id="featured" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="font-bold uppercase tracking-[.25em] text-[#75551D] dark:text-[#D6B36A]">{copy.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#6B4B16] dark:text-[#E0C27A] md:text-6xl">{title || copy.title}</h1>
          <p className="mt-4 max-w-2xl text-[#392A24] dark:text-[#FFF9F2]/85">{description || copy.description}</p>
        </div>
        <CurrencySelector />
      </div>

      <div className="mb-8 grid gap-3 rounded-[2rem] border border-[#C5A46D]/60 bg-[#700404] p-4 shadow-sm md:grid-cols-[1fr_160px_160px_160px]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, category, or notes..." className="rounded-full border border-[#C5A46D]/50 bg-[#700404] px-5 py-3 text-[#FFF9F2] outline-none placeholder:text-[#F5F0E8]/60 focus:border-[#E0C27A]" />
        <select value={family} onChange={(event) => setFamily(event.target.value)} className="rounded-full border border-[#C5A46D]/50 bg-[#700404] px-5 py-3 text-[#FFF9F2] outline-none focus:border-[#E0C27A]">
          {families.map((option) => <option key={option}>{option}</option>)}
        </select>
        <select value={stock} onChange={(event) => setStock(event.target.value)} className="rounded-full border border-[#C5A46D]/50 bg-[#700404] px-5 py-3 text-[#FFF9F2] outline-none focus:border-[#E0C27A]">
          <option value="all">All stock</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-[#C5A46D]/50 bg-[#700404] px-5 py-3 text-[#FFF9F2] outline-none focus:border-[#E0C27A]">
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      {list.length === 0 && <p className="rounded-3xl bg-white p-10 text-center font-bold dark:bg-white/5">{copy.empty}</p>}
    </section>
  );
}
