import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductBrowser from '@/components/shop/ProductBrowser';
export const metadata: Metadata = { title:'Shop Perfumes — Exousia & Co.', description:'Search, filter, and shop luxury fragrances with currency support and cart checkout.' };
export default function ProductsPage(){return <><div className="grain" aria-hidden="true"/><Header/><main className="min-h-screen bg-[#fbf7ef] pt-28 dark:bg-[#0f0d0a] dark:text-white"><ProductBrowser/></main><Footer/></>}
