const CACHE_NAME = 'exousia-pwa-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('exousia-pwa-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error())
    );
    return;
  }

  // Only cache public static files. Never cache API responses, account data,
  // cart, checkout, payment, or order pages.
  const isPublicStaticFile = url.pathname.startsWith('/_next/static/')
    || url.pathname.startsWith('/assets/')
    || url.pathname.startsWith('/icons/');
  if (!isPublicStaticFile) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const network = fetch(request).then((response) => {
      if (response.ok && response.type === 'basic') cache.put(request, response.clone());
      return response;
    });
    return cached || network.catch(() => Response.error());
  })());
});
