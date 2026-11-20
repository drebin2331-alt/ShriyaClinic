const CACHE_NAME = 'shriya-clinic-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/app-icon.svg',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('shriya-clinic-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    // Fetch the current HTML so it references the current hashed CSS and scripts.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request, { cache: 'no-cache' });
        if (response.ok) {
          await cache.put('/index.html', response.clone());
          return response;
        }
        return await cache.match('/index.html') || response;
      } catch {
        return await cache.match('/index.html') || Response.error();
      }
    })());
    return;
  }

  if (!url.pathname.startsWith('/assets/') && !ASSETS_TO_CACHE.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});

