// public/custom-sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

const CACHE_NAME = 'MundoIAanime-cache-v1';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/logo192.png',
  '/logo512.png'
];

// ✅ Precache: recursos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('❌ Error precacheando archivos estáticos:', err);
      })
    )
  );
  self.skipWaiting();
});

// ✅ Activación: limpiar versiones viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// ✅ Estrategia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 🌐 Para navegación: red primero, fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 🎨 Para assets estáticos: cache-first
  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((resp) => {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(request, respClone)
          );
          return resp;
        }).catch(() => undefined);
      })
    );
  }
});
