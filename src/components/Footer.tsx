import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  return (
    <footer className="border-t border-border dark:border-white/8 py-8 px-4 md:px-6 bg-background dark:bg-[#0F0D0A]">
      <div className="max-w-7xl mx-auto">
        {/* Pattern 3: Vercel Horizontal Flow */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo + Links */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <Link href="/products" className="flex items-center gap-2">
              <AppLogo size={28} iconName="SparklesIcon" />
              <span className="font-sans font-semibold text-sm text-foreground dark:text-white">
                Perfume<span className="font-display italic text-primary font-normal">Store</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 flex-wrap justify-center">
              {[
                { label: 'Collections', href: '/products' },
                { label: 'Scent Families', href: '#scent-families' },
                { label: 'Our Story', href: '#about' },
                { label: 'Gift Sets', href: '#gift' },
                { label: 'Privacy', href: '#' },
                { label: 'Terms', href: '#' },
              ]?.map((link, i) => (
                <React.Fragment key={link?.label}>
                  <a href={link?.href} className="footer-link px-2 py-1">
                    {link?.label}
                  </a>
                  {i < 5 && <span className="text-border dark:text-white/20 text-xs">·</span>}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Social + Copyright */}
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a href="#" aria-label="PerfumeStore on Instagram" className="w-8 h-8 flex items-center justify-center rounded-full border border-border dark:border-white/10 text-muted dark:text-white/40 hover:text-foreground dark:hover:text-white hover:border-foreground/30 dark:hover:border-white/30 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            {/* Pinterest */}
            <a href="#" aria-label="PerfumeStore on Pinterest" className="w-8 h-8 flex items-center justify-center rounded-full border border-border dark:border-white/10 text-muted dark:text-white/40 hover:text-foreground dark:hover:text-white hover:border-foreground/30 dark:hover:border-white/30 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.19-.77 1.29-5.47 1.29-5.47s-.33-.66-.33-1.63c0-1.53.89-2.67 1.99-2.67.94 0 1.39.7 1.39 1.55 0 .94-.6 2.35-.91 3.66-.26 1.09.54 1.98 1.61 1.98 1.93 0 3.42-2.04 3.42-4.97 0-2.6-1.87-4.41-4.54-4.41-3.09 0-4.9 2.32-4.9 4.72 0 .93.36 1.93.81 2.48.09.11.1.2.07.31-.08.34-.27 1.09-.31 1.24-.05.2-.17.24-.38.15-1.43-.67-2.33-2.77-2.33-4.46 0-3.62 2.63-6.95 7.59-6.95 3.98 0 7.08 2.84 7.08 6.63 0 3.96-2.49 7.14-5.95 7.14-1.16 0-2.26-.6-2.63-1.31l-.72 2.67c-.26.99-.95 2.24-1.42 2.99.07.02.14.04.22.06A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z"/>
              </svg>
            </a>
            <span className="text-muted dark:text-white/30 text-xs font-medium">© 2026 PerfumeStore</span>
          </div>
        </div>
      </div>
    </footer>
  );
}