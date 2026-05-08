'use client';

import React from 'react';
import { currencies, useCurrency, type CurrencyCode } from '@/context/CurrencyContext';

export default function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <label className={`inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-2 text-xs font-bold text-foreground shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white ${compact ? 'w-full justify-between' : ''}`}>
      <span className="text-muted dark:text-white/50">Currency</span>
      <select
        aria-label="Choose display currency"
        value={currency}
        onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
        className="bg-transparent text-xs font-black outline-none"
      >
        {currencies.map((item) => (
          <option key={item.code} value={item.code} className="bg-white text-stone-950">
            {item.symbol} {item.code}
          </option>
        ))}
      </select>
    </label>
  );
}
