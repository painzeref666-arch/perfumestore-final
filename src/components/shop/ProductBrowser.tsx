'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import CurrencySelector from '@/components/CurrencySelector';
import Price from '@/components/Price';
import AddToCartButton from '@/components/shop/AddToCartButton';
import { useProducts, getVariantPrice } from '@/context/ProductContext';
import { sizes, concentrations, type SizeOption, type ConcentrationOption } from '@/data/products';

const families = ['All', 'Amber', 'Floral', 'Woody', 'Fresh', 'Oud', 'Citrus'];
const genders = ['All', 'Men', 'Women', 'Unisex'];
const notes = ['All', 'Amber', 'Vanilla', 'Musk', 'Rose', 'Pear', 'Oud', 'Saffron', 'Cedar', 'Bergamot', 'Vetiver', 'Jasmine', 'Citrus', 'Floral', 'Woody'];

function inferGender(product: ReturnType<typeof useProducts>['activeProducts'][number]) {
  const text = `${product.name} ${product.family} ${product.tag} ${product.description} ${(product.notes || []).join(' ')}`.toLowerCase();
  if (/women|feminine|rose|pear|floral|bloom|éclat|eclat/.test(text)) return 'Women';
  if (/men|masculine|cedar|oud|smoke|vetiver|noir|royale/.test(text)) return 'Men';
  return 'Unisex';
}

function ProductCard({ p }: { p: ReturnType<typeof useProducts>['activeProducts'][number] }) {
  const [firstSize] = sizes;
  const [firstConcentration] = concentrations;
  const [size, setSize] = useState<SizeOption>(firstSize);
  const [concentration, setConcentration] = useState<ConcentrationOption>(firstConcentration);
  const price = getVariantPrice(p, size, concentration);
  const gender = inferGender(p);

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/10 dark:border-white/10 dark:bg-white/5">
      <Link href={`/products/${p.id}`} className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-stone-100">
        <AppImage src={p.image} alt={p.name} fill sizes="(max-width:768px) 100vw,33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-90" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-amber-900">{p.promo || p.tag || 'Signature'}</span>
        <span className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white">{gender}</span>
        <span className="absolute bottom-4 right-4 rounded-full bg-amber-700 px-3 py-1 text-xs font-black text-white">★ {Number(p.rating || 5).toFixed(1)}</span>
      </Link>

      <div className="p-2 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/products/${p.id}`} className="hover:text-amber-700"><h2 className="text-2xl font-black">{p.name}</h2></Link>
            <p className="mt-1 text-sm font-semibold text-amber-800">{p.family} • {concentration}</p>
          </div>
          <Price amount={price} className="text-xl font-black" />
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600 dark:text-white/60">{p.description}</p>
        {p.event && <p className="mt-3 rounded-2xl bg-amber-100 px-4 py-2 text-xs font-black text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">{p.event}</p>}
        <div className="mt-4 flex flex-wrap gap-2">{(p.notes || []).slice(0, 4).map(n => <span key={n} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold dark:bg-white/10">{n}</span>)}</div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-white/40">Size
            <select value={size} onChange={e => setSize(e.target.value as SizeOption)} className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-bold normal-case text-stone-950 outline-none dark:border-white/10 dark:bg-black/20 dark:text-white">
              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-white/40">Variation
            <select value={concentration} onChange={e => setConcentration(e.target.value as ConcentrationOption)} className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-bold normal-case text-stone-950 outline-none dark:border-white/10 dark:bg-black/20 dark:text-white">
              {concentrations.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-stone-500 dark:text-white/50">{p.stock} stocks • {p.reviews} reviews</p>
          <AddToCartButton productId={p.id} size={size} concentration={concentration} className="rounded-full bg-stone-950 px-5 py-3 text-sm font-black text-white transition hover:bg-amber-800 dark:bg-amber-700">Add to Cart</AddToCartButton>
        </div>
      </div>
    </article>
  );
}

export default function ProductBrowser() {
  const { activeProducts: products, loading, error } = useProducts();
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState('All');
  const [gender, setGender] = useState('All');
  const [note, setNote] = useState('All');
  const [sort, setSort] = useState('featured');
  const [stock, setStock] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;

    return products
      .filter(p => {
        const price = getVariantPrice(p, '10ml', 'EDP');
        const searchable = [p.name, p.family, p.tag, p.description, ...(p.notes || [])].join(' ').toLowerCase();
        const productGender = inferGender(p);
        return (family === 'All' || p.family === family)
          && (gender === 'All' || productGender === gender)
          && (note === 'All' || searchable.includes(note.toLowerCase()))
          && (stock === 'all' || (stock === 'in' ? (p.stock || 0) > 0 : (p.stock || 0) <= 0))
          && price >= min
          && price <= max
          && (!q || searchable.includes(q));
      })
      .sort((a, b) => sort === 'price-low'
        ? getVariantPrice(a, '10ml', 'EDP') - getVariantPrice(b, '10ml', 'EDP')
        : sort === 'price-high'
          ? getVariantPrice(b, '10ml', 'EDP') - getVariantPrice(a, '10ml', 'EDP')
          : sort === 'rating'
            ? (b.rating || 0) - (a.rating || 0)
            : sort === 'stock'
              ? (b.stock || 0) - (a.stock || 0)
              : 0);
  }, [query, family, gender, note, sort, stock, minPrice, maxPrice, products]);

  const resetFilters = () => {
    setQuery('');
    setFamily('All');
    setGender('All');
    setNote('All');
    setSort('featured');
    setStock('all');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <section id="featured" className="mx-auto max-w-7xl px-6 py-14 md:py-20">
      <div className="relative mb-10 overflow-hidden rounded-[2.5rem] border border-amber-900/10 bg-stone-950 p-8 text-white shadow-2xl shadow-amber-950/10 md:p-12">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="font-bold uppercase tracking-[.25em] text-amber-300">Shop Collection</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">Luxury perfumes, easier to discover.</h1>
            <p className="mt-4 max-w-2xl text-white/65">Filter by scent family, notes, price, stock, and style. Choose size and variation before adding to cart.</p>
          </div>
          <CurrencySelector />
        </div>
      </div>

      <div className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, notes, inspired vibe..." className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20" />
          <select value={family} onChange={e => setFamily(e.target.value)} className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none dark:border-white/10 dark:bg-black/20">{families.map(x => <option key={x}>{x}</option>)}</select>
          <select value={gender} onChange={e => setGender(e.target.value)} className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none dark:border-white/10 dark:bg-black/20">{genders.map(x => <option key={x}>{x}</option>)}</select>
          <select value={note} onChange={e => setNote(e.target.value)} className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none dark:border-white/10 dark:bg-black/20">{notes.map(x => <option key={x}>{x === 'All' ? 'All notes' : x}</option>)}</select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <input inputMode="numeric" value={minPrice} onChange={e => setMinPrice(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Min price" className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20" />
          <input inputMode="numeric" value={maxPrice} onChange={e => setMaxPrice(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Max price" className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20" />
          <select value={stock} onChange={e => setStock(e.target.value)} className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none dark:border-white/10 dark:bg-black/20"><option value="all">All stock</option><option value="in">In stock</option><option value="out">Out of stock</option></select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-full border border-stone-200 bg-white px-5 py-3 outline-none dark:border-white/10 dark:bg-black/20"><option value="featured">Featured</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="rating">Top Rated</option><option value="stock">Most Stock</option></select>
          <button type="button" onClick={resetFilters} className="rounded-full border border-stone-300 px-5 py-3 text-sm font-black transition hover:border-amber-700 hover:text-amber-800 dark:border-white/10">Reset</button>
        </div>
        <p className="mt-4 text-sm font-bold text-stone-500 dark:text-white/45">Showing {list.length} of {products.length} perfumes</p>
      </div>

      {loading ? <div className="rounded-[2rem] border border-stone-200 bg-white p-8 font-bold dark:border-white/10 dark:bg-white/5">Loading products...</div> : null}
      {error ? <div className="mb-6 rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">{error}</div> : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
      {!loading && list.length === 0 && <p className="rounded-3xl bg-white p-10 text-center font-bold dark:bg-white/5">No perfumes found. Try another search or reset filters.</p>}
    </section>
  );
}
