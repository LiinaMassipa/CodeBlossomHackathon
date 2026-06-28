const CACHE_NAME = 'safecalc-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/calculator.js',
  '/safe-screen.js',
  '/trigger.js',
  '/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});