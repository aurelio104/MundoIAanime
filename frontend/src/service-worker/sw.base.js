// ✅ FILE: src/service-worker/sw.base.js

const CACHE_NAME = 'MundoIAanime-cache-v1';
const OFFLINE_URL = '/offline.html';

// ✅ Placeholder obligatorio para Workbox (¡debe ir al principio!)
self.__WB_MANIFEST = self.__WB_MANIFEST || [];

// ✅ Recursos estáticos críticos a precachear manualmente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/logo192.png',
  '/logo512.png'
];

// ✅ Instala el SW y precachea recursos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(STATIC_ASSETS);
        console.log('✅ Archivos precacheados manualmente');
      } catch (err) {
        console.error('❌ Error al precachear archivos:', err);
      }
    })
  );
  self.skipWaiting();
});

// ✅ Activa el nuevo SW y elimina cachés antiguos
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

  // 🌐 Páginas: Red primero, fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 🎨 Archivos estáticos: Cache-first
  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        }).catch(() => undefined);
      })
    );
  }
});
