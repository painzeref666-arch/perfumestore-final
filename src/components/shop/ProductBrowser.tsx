'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import CurrencySelector from '@/components/CurrencySelector';
import Price from '@/components/Price';
import AddToCartButton from '@/components/shop/AddToCartButton';
import { useProducts, getVariantPrice } from '@/context/ProductContext';
import { sizes, concentrations, type SizeOption, type ConcentrationOption } from '@/data/products';

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
  const [firstSize] = sizes;
  const [firstConcentration] = concentrations;
  const [size, setSize] = useState<SizeOption>(firstSize);
  const [concentration, setConcentration] = useState<ConcentrationOption>(firstConcentration);

  const category = productCategory(product);
  const isPerfume = category === 'perfumes';
  const price = isPerfume
    ? getVariantPrice(product, size, concentration)
    : Number(product.price || getVariantPrice(product, '10ml', 'EDP') || 0);
  const productType = category === 'cosmetics' ? 'Beauty' : category === 'wellness' ? 'Wellness' : concentration;
  const detailLabel = category === 'cosmetics' ? 'Shade / finish' : category === 'wellness' ? 'Benefit / variant' : 'Variation';
  const detailValue = category === 'cosmetics'
    ? (product.size || product.notes.slice(0, 2).join(' / ') || 'Standard')
    : category === 'wellness'
      ? (product.size || product.family || 'Daily care')
      : concentration;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/10 dark:border-white/10 dark:bg-white/5">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-stone-100">
        <AppImage src={product.image} alt={product.name} fill sizes="(max-width:768px) 100vw,33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-amber-900">{product.promo || product.tag}</span>
        <span className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white">Rating {product.rating}</span>
      </Link>

      <div className="p-2 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/products/${product.id}`} className="hover:text-amber-700">
              <h2 className="text-2xl font-black">{product.name}</h2>
            </Link>
            <p className="mt-1 text-sm font-semibold text-amber-800">{product.family} - {productType}</p>
          </div>
          <Price amount={price} className="text-xl font-black" />
        </div>

        <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-white/60">{product.description}</p>
        {product.event && <p className="mt-3 rounded-2xl bg-amber-100 px-4 py-2 text-xs font-black text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">{product.event}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {product.notes.map((note) => (
            <span key={note} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold dark:bg-white/10">{note}</span>
          ))}
        </div>

        {isPerfume ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-white/40">
              Size
              <select value={size} onChange={(event) => setSize(event.target.value as SizeOption)} className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-bold normal-case text-stone-950 outline-none dark:border-white/10 dark:bg-black/20 dark:text-white">
                {sizes.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-white/40">
              Variation
              <select value={concentration} onChange={(event) => setConcentration(event.target.value as ConcentrationOption)} className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-bold normal-case text-stone-950 outline-none dark:border-white/10 dark:bg-black/20 dark:text-white">
                {concentrations.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-white/10 dark:bg-black/20">
            <p className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-white/40">{detailLabel}</p>
            <p className="mt-1 text-sm font-bold">{detailValue}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-stone-500 dark:text-white/50">{product.stock} stocks - {product.reviews} reviews</p>
          <AddToCartButton productId={product.id} size={isPerfume ? size : '10ml'} concentration={isPerfume ? concentration : 'EDP'} className="rounded-full bg-stone-950 px-5 py-3 text-sm font-black text-white transition hover:bg-amber-800 dark:bg-amber-700">
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
        const priceA = productCategory(a) === 'perfumes' ? getVariantPrice(a, '10ml', 'EDP') : Number(a.price || 0);
        const priceB = productCategory(b) === 'perfumes' ? getVariantPrice(b, '10ml', 'EDP') : Number(b.price || 0);
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
          <p className="font-bold uppercase tracking-[.25em] text-amber-700">{copy.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{title || copy.title}</h1>
          <p className="mt-4 max-w-2xl text-stone-600 dark:text-white/60">{description || copy.description}</p>
        </div>
        <CurrencySelector />
      </div>

      <div className="mb-8 grid gap-3 rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 md:grid-cols-[1fr_160px_160px_160px]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, category, or notes..." className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20" />
        <select value={family} onChange={(event) => setFamily(event.target.value)} className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none dark:border-white/10 dark:bg-black/20">
          {families.map((option) => <option key={option}>{option}</option>)}
        </select>
        <select value={stock} onChange={(event) => setStock(event.target.value)} className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none dark:border-white/10 dark:bg-black/20">
          <option value="all">All stock</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none dark:border-white/10 dark:bg-black/20">
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
