// ✅ FILE: src/main.tsx
import React, { StrictMode, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// ✅ Estilos globales
import './index.css'

// ✅ Fuentes personalizadas
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/cinzel/600.css'

// 🔄 Fallback visual para carga
import LoadingSpinner from './components/LoadingSpinner'

/* ----------------------------------------
 ✅ Service Worker Registration (PWA) — solo producción y contexto seguro
---------------------------------------- */
function registerServiceWorker(): void {
  const isProd = import.meta.env.PROD
  const canUseSW = 'serviceWorker' in navigator
  const isSecure = window.isSecureContext || window.location.hostname === 'localhost'

  if (!isProd || !canUseSW || !isSecure) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/custom-sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration)

        registration.onupdatefound = () => {
          const installing = registration.installing
          if (!installing) return
          installing.onstatechange = () => {
            if (installing.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('🔁 Nuevo contenido disponible. Recarga para actualizar.')
              } else {
                console.log('✅ Contenido cacheado para uso offline.')
              }
            }
          }
        }
      })
      .catch((error) => {
        console.error('❌ Error registrando SW:', error)
      })
  })
}

registerServiceWorker()

/* ----------------------------------------
 ✅ Montaje de la App
---------------------------------------- */
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('❌ No se encontró el elemento #root en el DOM.')

const root = ReactDOM.createRoot(rootElement)

root.render(
  <StrictMode>
    <Suspense fallback={<LoadingSpinner message="Cargando MundoIAanime..." />}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  </StrictMode>
)

/* ----------------------------------------
 ✅ Safari iOS Workaround (opcional y acotado): evita pantalla blanca en /admin
   - Solo en Safari iOS
   - Solo en rutas /admin
   - Intenta limpiar SW y caches una sola vez por sesión
---------------------------------------- */
function runSafariIOSAdminWorkaround() {
  const isSafariIOS = /iP(ad|hone|od).+Version\/[\d.]+.*Safari/i.test(navigator.userAgent)
  const isAdminPath = window.location.pathname.startsWith('/admin')
  const alreadyTried = sessionStorage.getItem('safari-ios-admin-workaround') === '1'
  if (!isSafariIOS || !isAdminPath || alreadyTried) return

  sessionStorage.setItem('safari-ios-admin-workaround', '1')

  ;(async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
      console.warn('♻️ Cache y SW limpiados por workaround Safari iOS. Recargando...')
      window.location.reload()
    } catch (err) {
      console.error('⚠️ Error aplicando workaround Safari iOS:', err)
    }
  })()
}

runSafariIOSAdminWorkaround()
