import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

const shopLinks = [
  { label: 'Perfumes', href: '/perfumes' },
  { label: 'Cosmetics', href: '/cosmetics' },
  { label: 'Wellness', href: '/wellness' },
  { label: 'Gift collections', href: '/products' },
];

const helpLinks = [
  { label: 'Track an order', href: '/track' },
  { label: 'Shipping information', href: '/shipping' },
  { label: 'Your account', href: '/account' },
  { label: 'Customer reviews', href: '/reviews' },
];

export default function Footer() {
  return (
    <footer className="site-footer border-t border-[#C5A46D]/30 bg-[#F1EAE0] text-[#27191A] dark:bg-[#19090D] dark:text-[#F5EDE4]">
      <div className="mx-auto max-w-7xl px-5 pb-7 pt-14 md:px-8 md:pt-16">
        <div className="grid gap-10 border-b border-[#8A0303]/15 pb-10 md:grid-cols-[1.3fr_.7fr_.7fr] md:gap-16">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C5A46D]/75 bg-[#FFF9F2] dark:bg-[#2A1016]"><AppLogo size={31} iconName="SparklesIcon" /></span>
              <span><span className="block font-serif text-xl text-[#700404] dark:text-[#F2D89D]">Exousia &amp; Co.</span><span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[.27em] text-[#755D50] dark:text-[#D2BFA8]">Fragrance · Beauty · Wellness</span></span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-[#64534A] dark:text-[#D1C5B8]">Find a scent that feels like you, and the little rituals that make every day more yours.</p>
          </div>

          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[.28em] text-[#8A0303] dark:text-[#E0C27A]">Explore</h2>
            <nav className="mt-4 grid gap-3">
              {shopLinks.map((link) => <Link key={link.label} href={link.href} className="site-footer-link text-sm text-[#493735] transition hover:text-[#8A0303] dark:text-[#E6D9CE] dark:hover:text-[#E0C27A]">{link.label}</Link>)}
            </nav>
          </div>

          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[.28em] text-[#8A0303] dark:text-[#E0C27A]">Customer care</h2>
            <nav className="mt-4 grid gap-3">
              {helpLinks.map((link) => <Link key={link.label} href={link.href} className="site-footer-link text-sm text-[#493735] transition hover:text-[#8A0303] dark:text-[#E6D9CE] dark:hover:text-[#E0C27A]">{link.label}</Link>)}
            </nav>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-[#75635A] dark:text-[#B7A99A]">© {new Date().getFullYear()} Exousia &amp; Co. All rights reserved.</p>
          <nav className="flex items-center gap-5 text-xs text-[#75635A] dark:text-[#B7A99A]">
            <Link href="/" className="transition hover:text-[#8A0303] dark:hover:text-[#E0C27A]">Privacy</Link>
            <Link href="/" className="transition hover:text-[#8A0303] dark:hover:text-[#E0C27A]">Terms</Link>
            <Link href="/event-scents/book" className="transition hover:text-[#8A0303] dark:hover:text-[#E0C27A]">Event Scents</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
