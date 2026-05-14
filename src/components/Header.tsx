'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { useTheme } from '@/context/ThemeContext';
import CurrencySelector from '@/components/CurrencySelector';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';

type ThemeMode = 'light' | 'dark' | 'system';

function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ),
    },
    {
      value: 'system',
      label: 'System',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
    },
  ];

  const currentOption = options.find((o) => o.value === mode) ?? options[2];

  return (
    <div ref={ref} className="relative">
      <button
        aria-label={`Theme: ${currentOption.label}. Click to change theme`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full border border-border hover:bg-border/40 transition-colors text-muted hover:text-foreground dark:border-white/10 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10"
      >
        {currentOption.icon}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-36 bg-card dark:bg-[#1A1410] border border-border dark:border-white/10 rounded-2xl shadow-xl shadow-foreground/10 dark:shadow-black/40 overflow-hidden z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setMode(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors
                ${mode === opt.value
                  ? 'text-primary bg-primary/8 dark:bg-primary/15' :'text-muted hover:text-foreground hover:bg-border/30 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/8'
                }`}
            >
              {opt.icon}
              {opt.label}
              {mode === opt.value && (
                <svg className="ml-auto" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount: cartCount, setCartOpen } = useCart();
  const { activeProducts } = useProducts();
  const searchResults = activeProducts
    .filter((product) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return false;
      return [product.name, product.family, product.description, product.category, ...product.notes].join(' ').toLowerCase().includes(query);
    })
    .slice(0, 6);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-[100] px-4 md:px-6 py-4">
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between glass dark:glass-dark rounded-2xl px-5 md:px-8 py-3.5 transition-all duration-500 ${
          scrolled ? 'shadow-xl shadow-foreground/5 dark:shadow-black/30' : ''
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <AppLogo
            size={34}
            iconName="SparklesIcon"
            className="group-hover:rotate-12 transition-transform duration-500"
          />
          <span className="font-sans font-700 text-lg tracking-tight text-foreground dark:text-white">
            Exousia and Co. <span className="font-display italic text-primary font-normal">Marketing</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted dark:text-white/50">
          <Link href="/perfumes" className="hover:text-foreground dark:hover:text-white transition-colors">Perfumes</Link>
          <Link href="/cosmetics" className="hover:text-foreground dark:hover:text-white transition-colors">Cosmetics</Link>
          <Link href="/wellness" className="hover:text-foreground dark:hover:text-white transition-colors">Wellness</Link>
          <Link href="/quiz" className="hover:text-foreground dark:hover:text-white transition-colors">Scent Quiz</Link>
          <Link href="/#scents" className="hover:text-foreground dark:hover:text-white transition-colors">Scent Families</Link>
          <Link href="/wishlist" className="hover:text-foreground dark:hover:text-white transition-colors">Wishlist</Link>
          <Link href="/rewards" className="hover:text-foreground dark:hover:text-white transition-colors">Rewards</Link>
          <Link href="/reviews" className="hover:text-foreground dark:hover:text-white transition-colors">Reviews</Link>
          <Link href="/track" className="hover:text-foreground dark:hover:text-white transition-colors">Track Order</Link>
          <Link href="/account" className="hover:text-foreground dark:hover:text-white transition-colors">Account</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            aria-label="Search fragrances"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full border border-border dark:border-white/10 hover:bg-border/40 dark:hover:bg-white/10 transition-colors text-muted dark:text-white/50 hover:text-foreground dark:hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {/* Currency Selector */}
          <div className="hidden lg:block">
            <CurrencySelector />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Cart */}
          <button
            aria-label={`Shopping cart with ${cartCount} items`}
            onClick={() => setCartOpen(true)}
            className="relative flex w-9 h-9 items-center justify-center rounded-full border border-border dark:border-white/10 hover:bg-border/40 dark:hover:bg-white/10 transition-colors text-muted dark:text-white/50 hover:text-foreground dark:hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* CTA */}
          <Link
            href="/perfumes"
            className="hidden sm:inline-flex btn-amber items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            Shop Now
          </Link>

          {/* Hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border dark:border-white/10 text-foreground dark:text-white hover:bg-border/40 dark:hover:bg-white/10 transition-colors"
          >
            {menuOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto glass dark:glass-dark rounded-2xl px-6 py-6 shadow-2xl">
          <nav className="flex flex-col gap-4">
            {[
              ['Perfumes','/perfumes'],
              ['Cosmetics','/cosmetics'],
              ['Wellness','/wellness'],
              ['Scent Quiz','/quiz'],
              ['Scent Families','/#scents'],
              ['Wishlist','/wishlist'],
              ['Reviews','/reviews'],
              ['Track Order','/track'],
              ['Account','/account'],
            ].map(([item, href]) => (
              <Link
                key={item}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-lg font-medium text-foreground dark:text-white hover:text-primary transition-colors py-1"
              >
                {item}
              </Link>
            ))}
            <hr className="border-border dark:border-white/10 my-2" />
            <CurrencySelector compact />
            {/* Mobile theme options */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted dark:text-white/40">Theme</span>
              <MobileThemeButtons />
            </div>
            <Link
              href="/perfumes"
              onClick={() => setMenuOpen(false)}
              className="btn-amber w-full text-center py-3 rounded-full font-semibold"
            >
              Shop Now
            </Link>
          </nav>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[120] bg-black/45 px-4 py-24 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-5 shadow-2xl dark:border-white/10 dark:bg-[#1A1410]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3">
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products, notes, or categories"
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-5 py-3 text-foreground outline-none focus:border-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="h-11 w-11 rounded-full border border-border text-xl font-black transition hover:bg-border/40 dark:border-white/10 dark:hover:bg-white/10"
              >
                x
              </button>
            </div>
            <div className="mt-5 grid gap-2">
              {!searchQuery.trim() && <p className="rounded-2xl bg-border/30 p-4 text-sm font-bold text-muted dark:bg-white/5 dark:text-white/60">Type a product name, note, or category.</p>}
              {searchQuery.trim() && searchResults.length === 0 && <p className="rounded-2xl bg-border/30 p-4 text-sm font-bold text-muted dark:bg-white/5 dark:text-white/60">No matching products found.</p>}
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="rounded-2xl border border-border p-4 transition hover:border-primary dark:border-white/10"
                >
                  <p className="font-black">{product.name}</p>
                  <p className="mt-1 text-sm text-muted dark:text-white/60">{product.category || 'perfumes'} - {product.family}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileThemeButtons() {
  const { mode, setMode } = useTheme();
  const options: { value: 'light' | 'dark' | 'system'; label: string }[] = [
    { value: 'light', label: '☀️' },
    { value: 'dark', label: '🌙' },
    { value: 'system', label: '💻' },
  ];
  return (
    <div className="flex gap-2 ml-auto">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setMode(opt.value)}
          aria-label={`Set ${opt.value} theme`}
          className={`w-8 h-8 rounded-full text-sm flex items-center justify-center border transition-all
            ${mode === opt.value
              ? 'border-primary bg-primary/10' :'border-border dark:border-white/10 hover:bg-border/30 dark:hover:bg-white/10'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
