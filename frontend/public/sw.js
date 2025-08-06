// ✅ FILE: src/service-worker/sw.base.js

const CACHE_NAME = 'MundoIAanime-cache-v1';
const OFFLINE_URL = '/offline.html';

// ✅ Se inyectarán estos archivos automáticamente por Workbox
self.__WB_MANIFEST = self.__WB_MANIFEST || [];

const STATIC_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/logo192.png',
  '/logo512.png'
];

// ✅ Precaching inicial (manual + __WB_MANIFEST)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(STATIC_ASSETS);
        console.log('✅ Archivos precacheados');
      } catch (err) {
        console.error('❌ Error precacheando archivos estáticos:', err);
      }
    })
  );
  self.skipWaiting();
});

// ✅ Activación: limpiar versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ✅ Estrategia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 🌐 Navegación: red primero, fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 🎨 Assets estáticos: cache-first
  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((resp) => {
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(request, respClone)
            );
            return resp;
          })
          .catch(() => undefined);
      })
    );
  }
});
