import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductBrowser from '@/components/shop/ProductBrowser';
export const metadata: Metadata = { title:'All Products — Exousia & Co.', description:'Search, filter, and shop Exousia perfumes, cosmetics, and wellness products.' };
export default function ProductsPage(){return <><div className="grain" aria-hidden="true"/><Header/><main className="min-h-screen bg-[#fbf7ef] pt-28 dark:bg-[#0f0d0a] dark:text-white"><ProductBrowser category="all" title="All products" description="Browse perfumes, cosmetics, and wellness products in one place."/></main><Footer/></>}
