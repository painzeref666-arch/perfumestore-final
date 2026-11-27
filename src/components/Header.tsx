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
        className="navbar-icon hidden sm:flex w-9 h-9 shrink-0 items-center justify-center rounded-full border border-[#8A0303]/30 hover:text-[#8A0303] hover:bg-[#8A0303]/10 transition-colors"
      >
        {currentOption.icon}
      </button>

      {open && (
        <div className="site-theme-menu absolute right-0 top-11 w-36 bg-card dark:bg-[#201B16] border border-border dark:border-white/10 rounded-2xl shadow-xl shadow-foreground/10 dark:shadow-black/40 overflow-hidden z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setMode(opt.value); setOpen(false); }}
              className={`site-theme-option w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors
                ${mode === opt.value
                  ? 'text-[#8A0303] bg-[#8A0303]/10' :'text-[#f5f0e8]/75 hover:text-[#8A0303] hover:bg-[#8A0303]/10'
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
  const [moreOpen, setMoreOpen] = useState(false);
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
    <header className="site-header fixed top-0 left-0 w-full z-[100] px-3 md:px-6 pt-2">
      <div className="site-announcement mx-auto max-w-7xl rounded-t-xl bg-[#8A0303] px-4 py-1.5 text-center text-[9px] font-semibold uppercase tracking-[.26em] text-white sm:text-[10px]">
        Fragrance · Beauty · Wellness &nbsp; <span className="text-[#E8C982]">A scent for every story</span>
      </div>
      <div
        className={`site-navbar max-w-7xl mx-auto flex items-center justify-between bg-[#FFF9F2]/95 dark:bg-[#270C12]/96 backdrop-blur-xl border border-[#C5A46D]/65 border-t-0 rounded-b-2xl px-4 md:px-8 py-3 transition-all duration-500 ${
          scrolled ? 'shadow-xl shadow-black/40' : ''
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <AppLogo
            size={34}
            iconName="SparklesIcon"
            className="group-hover:rotate-12 transition-transform duration-500"
          />
          <span className="flex shrink-0 flex-col whitespace-nowrap font-sans font-700 text-sm leading-tight tracking-tight text-[#700404] dark:text-[#F2D89D] md:text-base lg:text-lg">
            Exousia &amp; Co. <span className="font-display text-[10px] italic font-normal tracking-[.12em] text-[#70534A] dark:text-[#E8D7BE]">Marketing</span>
          </span>
        </Link>

        {/* Desktop Nav: primary shopping links, secondary customer links grouped under More */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-5 text-[12px] font-medium text-[#382525] dark:text-[#F1E8DD]">
          <Link href="/perfumes" className="whitespace-nowrap hover:text-[#FFF2C2] transition-colors">Perfumes</Link>
          <Link href="/cosmetics" className="whitespace-nowrap hover:text-[#FFF2C2] transition-colors">Cosmetics</Link>
          <Link href="/wellness" className="whitespace-nowrap hover:text-[#FFF2C2] transition-colors">Wellness</Link>
          <Link href="/quiz" className="whitespace-nowrap hover:text-[#FFF2C2] transition-colors">Scent Quiz</Link>
          <Link href="/#scents" className="whitespace-nowrap hover:text-[#FFF2C2] transition-colors">Scent Families</Link>
          <div className="relative">
            <button type="button" aria-expanded={moreOpen} onClick={() => setMoreOpen(!moreOpen)} className="inline-flex items-center gap-1 hover:text-[#8A0303] transition-colors">
              More <span className="text-xs">{moreOpen ? '▴' : '▾'}</span>
            </button>
            {moreOpen && (
              <div className="site-menu-dropdown absolute right-0 top-9 z-50 w-48 rounded-2xl border border-[#C5A46D]/45 bg-[#FFF9F2] p-2 shadow-2xl shadow-black/20 dark:bg-[#2A1016] dark:shadow-black/40">
                {[
                  ['Wishlist', '/wishlist'], ['Rewards', '/rewards'], ['Reviews', '/reviews'], ['Track Order', '/track'], ['Account', '/account'],
                ].map(([label, href]) => (
                  <Link key={label} href={href} onClick={() => setMoreOpen(false)} className="site-menu-link block rounded-xl px-4 py-2.5 text-[#201b16]/90 transition hover:bg-[#8A0303]/20 hover:text-[#201b16] dark:text-[#f5f0e8]/80 dark:hover:bg-[#8A0303]/10 dark:hover:text-[#8A0303]">{label}</Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            aria-label="Search fragrances"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(true)}
            className="navbar-icon flex w-9 h-9 shrink-0 items-center justify-center rounded-full border border-[#8A0303]/30 hover:bg-[#8A0303]/10 transition-colors"
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
            className="navbar-icon relative flex w-9 h-9 shrink-0 items-center justify-center rounded-full border border-[#8A0303]/30 hover:bg-[#8A0303]/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8A0303] text-[#171411] text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* CTA */}
          <Link
            href="/perfumes"
            className="navbar-cta hidden shrink-0 whitespace-nowrap sm:inline-flex bg-[#8A0303] text-white hover:bg-[#700404] items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
          >
            Shop Now
          </Link>

          {/* Hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="navbar-icon md:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-[#8A0303]/30 hover:bg-[#8A0303]/10 transition-colors"
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
      {/* Mobile Menu: isolated full-screen overlay and scrollable panel */}
      {menuOpen && (
        <div className="site-mobile-overlay md:hidden fixed inset-0 z-[110] bg-black/65 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="site-mobile-panel fixed right-4 left-4 top-[92px] max-h-[calc(100dvh-112px)] overflow-y-auto overscroll-contain rounded-2xl border border-[#C5A46D]/45 bg-[#FFF9F2] p-5 shadow-2xl shadow-black/60 dark:bg-[#2A1016]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#8A0303]/20 pb-3">
                <span className="text-sm font-semibold tracking-wide text-[#8A0303]">MENU</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="site-mobile-close flex h-9 w-9 items-center justify-center rounded-full border border-[#8A0303]/30 text-[#f5f0e8]">×</button>
            </div>
            <nav className="flex flex-col gap-1">
              {[
                ['Perfumes','/perfumes'],
                ['Cosmetics','/cosmetics'],
                ['Wellness','/wellness'],
                ['Scent Quiz','/quiz'],
                ['Scent Families','/#scents'],
                ['Wishlist','/wishlist'],
                ['Rewards','/rewards'],
                ['Reviews','/reviews'],
                ['Track Order','/track'],
                ['Account','/account'],
              ].map(([item, href]) => (
                <Link key={item} href={href} onClick={() => setMenuOpen(false)} className="site-mobile-menu-link block rounded-xl px-4 py-3 text-base font-medium text-[#f5f0e8] transition hover:bg-[#8A0303]/15 hover:text-[#8A0303]">
                  {item}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t border-[#8A0303]/20 pt-4">
              <CurrencySelector compact />
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8A0303]">Theme</span>
                <MobileThemeButtons />
              </div>
              <Link href="/perfumes" onClick={() => setMenuOpen(false)} className="mt-5 block w-full rounded-full bg-[#8A0303] py-3 text-center font-semibold text-[#171411] transition hover:bg-[#d6b783]">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="site-search-overlay fixed inset-0 z-[120] bg-black/70 px-4 py-24 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="site-search-panel mx-auto max-w-2xl rounded-3xl border border-[#C5A46D]/45 bg-[#FFF9F2] p-5 shadow-2xl dark:bg-[#2A1016]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3">
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products, notes, or categories"
                className="site-search-input min-w-0 flex-1 rounded-full border border-[#C5A46D]/50 bg-white px-5 py-3 text-[#241817] outline-none focus:border-[#8A0303] dark:bg-[#1D0B10] dark:text-[#F7F0E8]"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="h-11 w-11 rounded-full border border-[#8A0303]/25 text-[#f5f0e8] text-xl font-black transition hover:bg-[#8A0303]/10"
              >
                x
              </button>
            </div>
            <div className="mt-5 grid gap-2">
              {!searchQuery.trim() && <p className="rounded-2xl bg-[#8A0303]/5 p-4 text-sm font-bold text-[#f5f0e8]/60">Type a product name, note, or category.</p>}
              {searchQuery.trim() && searchResults.length === 0 && <p className="rounded-2xl bg-[#8A0303]/5 p-4 text-sm font-bold text-[#f5f0e8]/60">No matching products found.</p>}
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="rounded-2xl border border-[#8A0303]/20 p-4 transition hover:border-[#8A0303]"
                >
                  <p className="font-black text-[#f5f0e8]">{product.name}</p>
                  <p className="mt-1 text-sm text-[#f5f0e8]/60">{product.category || 'perfumes'} - {product.family}</p>
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
              ? 'border-[#8A0303] bg-[#8A0303]/10' :'border-[#8A0303]/25 hover:bg-[#8A0303]/10'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
