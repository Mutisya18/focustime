// sw.js - simple static caching for offline shell
const CACHE_NAME = 'focus-shell-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/index.js',
  '/App.js',
  '/sw.js'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  // For navigation requests, prefer cache first for offline shell, fall back to network
  if (evt.request.mode === 'navigate') {
    evt.respondWith(
      caches.match('/index.html').then(res => res || fetch(evt.request))
    );
    return;
  }

  // For other requests, try cache, else network
  evt.respondWith(
    caches.match(evt.request).then(cached => cached || fetch(evt.request).catch(()=>{}))
  );
});
