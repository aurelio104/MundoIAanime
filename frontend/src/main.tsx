// ✅ FILE: src/main.tsx (o index.tsx)
import React, { StrictMode, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// ✅ Estilos globales
import './index.css';

// ✅ Fuentes personalizadas
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/cinzel/600.css';

// 🔄 Fallback visual para carga
import LoadingSpinner from './components/LoadingSpinner';

/* ----------------------------------------
 ✅ Service Worker Registration (PWA)
---------------------------------------- */
function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/custom-sw.js')
        .then((registration: ServiceWorkerRegistration) => {
          console.log('✅ Service Worker registrado:', registration);

          registration.onupdatefound = () => {
            const installing = registration.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (installing.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('🔁 Nuevo contenido disponible. Recarga para actualizar.');
                  } else {
                    console.log('✅ Contenido cacheado para uso offline.');
                  }
                }
              };
            }
          };
        })
        .catch((error: Error) => {
          console.error('❌ Error registrando SW:', error);
        });
    });
  }
}

registerServiceWorker();

/* ----------------------------------------
 ✅ Montaje de la App
---------------------------------------- */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('❌ No se encontró el elemento #root en el DOM.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <Suspense fallback={<LoadingSpinner message="Cargando MundoIAanime..." />}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  </StrictMode>
);

/* ----------------------------------------
 ✅ Safari iOS Bugfix: evita pantalla blanca en /admin
---------------------------------------- */
const isSafariIOS = /iP(ad|hone|od).+Version\/[\d\.]+.*Safari/i.test(navigator.userAgent);
if (isSafariIOS && window.location.pathname.startsWith('/admin')) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
    .then(() => caches.keys())
    .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    .then(() => {
      console.warn('♻️ Cache limpiado por workaround Safari iOS. Recargando...');
      window.location.reload();
    });
}
