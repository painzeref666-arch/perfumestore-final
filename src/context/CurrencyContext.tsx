'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CurrencyCode = 'PHP' | 'USD' | 'EUR' | 'GBP' | 'JPY';

type CurrencyConfig = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  rateFromPHP: number;
  locale: string;
  fractionDigits: number;
};

export const currencies: CurrencyConfig[] = [
  { code: 'PHP', label: 'Philippine Peso', symbol: '₱', rateFromPHP: 1, locale: 'en-PH', fractionDigits: 0 },
  { code: 'USD', label: 'US Dollar', symbol: '$', rateFromPHP: 1 / 58, locale: 'en-US', fractionDigits: 2 },
  { code: 'EUR', label: 'Euro', symbol: '€', rateFromPHP: 0.92 / 58, locale: 'en-IE', fractionDigits: 2 },
  { code: 'GBP', label: 'British Pound', symbol: '£', rateFromPHP: 0.79 / 58, locale: 'en-GB', fractionDigits: 2 },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥', rateFromPHP: 155 / 58, locale: 'ja-JP', fractionDigits: 0 },
];

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (phpPrice: number) => string;
  selectedCurrency: CurrencyConfig;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('PHP');

  useEffect(() => {
    const saved = window.localStorage.getItem('preferred-currency') as CurrencyCode | null;
    if (saved && currencies.some((item) => item.code === saved)) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (nextCurrency: CurrencyCode) => {
    setCurrencyState(nextCurrency);
    window.localStorage.setItem('preferred-currency', nextCurrency);
  };

  const selectedCurrency = currencies.find((item) => item.code === currency) ?? currencies[0];

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency,
    selectedCurrency,
    formatPrice: (phpPrice: number) => {
      const amount = phpPrice * selectedCurrency.rateFromPHP;
      return new Intl.NumberFormat(selectedCurrency.locale, {
        style: 'currency',
        currency: selectedCurrency.code,
        maximumFractionDigits: selectedCurrency.fractionDigits,
        minimumFractionDigits: selectedCurrency.fractionDigits,
      }).format(amount);
    },
  }), [currency, selectedCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
