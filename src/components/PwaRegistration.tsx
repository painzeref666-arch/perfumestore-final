'use client';

import { useEffect } from 'react';

export default function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // The storefront remains usable if service worker registration is unavailable.
    });
  }, []);

  return null;
}
