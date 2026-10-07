const CACHE_NAME = 'skyline-pos-v2.3';
const isPosScope = self.registration.scope.includes('/pos');
const prefix = isPosScope ? '/pos' : '';

const ASSETS = [
  prefix + '/',
  prefix + '/index.html',
  prefix + '/app.js',
  prefix + '/bluetooth-print.js',
  prefix + '/icon.svg',
  prefix + '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Let API requests pass to network
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ offline: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Network-First for navigation and HTML / JS files so updates are immediately visible
  const isDocOrScript = event.request.mode === 'navigate' ||
    event.request.url.endsWith('/') ||
    event.request.url.includes('index.html') ||
    event.request.url.includes('app.js') ||
    event.request.url.includes('bluetooth-print.js');

  if (isDocOrScript) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static icons / assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
