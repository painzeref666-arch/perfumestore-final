'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';

export default function Price({ amount, className = '' }: { amount: number; className?: string }) {
  const { formatPrice } = useCurrency();
  return <span className={className}>{formatPrice(amount)}</span>;
}
