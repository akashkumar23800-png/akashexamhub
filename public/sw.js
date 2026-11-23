/* Akash Exam Hub service worker: makes the site installable and keeps the
   homepage reachable offline. It never intercepts Supabase API calls,
   cross-origin requests or non-GET requests, so authentication and database
   behaviour stay exactly as they are without a service worker. */
const CACHE = 'akash-exam-hub-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/app.html',
  '/manifest.json',
  '/icon-192.png',
  '/website-icon-512x512.png',
  '/favicon-32.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        // Individual failures must not abort the whole install.
        Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => undefined)))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Let the Supabase backend, fonts and every other origin go straight to the network.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Network first so the live site stays current, cache as offline fallback.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/index.html'))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            if (response && response.ok && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
            }
            return response;
          })
          .catch(() => cached)
    )
  );
});
