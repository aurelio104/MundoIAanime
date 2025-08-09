// ✅ FILE: src/App.tsx
import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// 🧠 Contextos globales
import { NotificacionesProvider } from './context/NotificacionesContext'
import { CartProvider } from './context/CartContext'

// 🧩 Componentes públicos
import Header from './components/Header'
import HeroLanding from './components/HeroLanding'
import CoursesSection from './components/CoursesSection'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import SocialFloatButtons from './components/SocialFloatButtons'

// 🔐 Seguridad
import AdminLoginForm from './components/AdminLoginForm'
import PrivateRoute from './routes/PrivateRoute'

// 🔄 Spinner visual
import LoadingSpinner from './components/LoadingSpinner'

// 🧪 Página de prueba (tasa BCV u otras)
import TestTasa from './pages/TestTasa'

// 📦 Admin (lazy load para rendimiento)
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const DashboardProductos = lazy(() => import('./components/DashboardProductos'))
const AdminPedidos = lazy(() => import('./components/AdminPedidos'))
const AdminPedidoDetalle = lazy(() => import('./components/AdminPedidoDetalle'))
const AdminVisitas = lazy(() => import('./components/AdminVisitas'))

// 404 simple
const NotFound: React.FC = () => (
  <div className="min-h-screen grid place-items-center bg-black text-white">
    <div className="text-center space-y-3">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-white/70">Página no encontrada</p>
      <a href="/" className="inline-block mt-2 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold">
        Volver al inicio
      </a>
    </div>
  </div>
)

const App: React.FC = () => {
  return (
    <NotificacionesProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#0b0b0e] text-white overflow-x-hidden font-sans">
          {/* 🔔 Notificaciones globales */}
          <Toaster position="top-right" toastOptions={{ duration: 5000 }} />

          <Routes>
            {/* 🧪 Ruta de test para tasa BCV u otras pruebas */}
            <Route path="/test-tasa" element={<TestTasa />} />

            {/* 🏠 Página principal pública */}
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <main>
                    <HeroLanding />
                    <CoursesSection />
                    <CTASection />
                    <SocialFloatButtons />
                    <Footer />
                  </main>
                </>
              }
            />

            {/* 🔑 Login del administrador */}
            <Route path="/admin" element={<AdminLoginForm />} />

            {/* 🔐 Rutas privadas protegidas */}
            <Route
              path="/admin/dashboard"
              element={
                <Suspense fallback={<LoadingSpinner message="Verificando acceso al panel..." />}>
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/productos"
              element={
                <Suspense fallback={<LoadingSpinner message="Cargando productos..." />}>
                  <PrivateRoute>
                    <DashboardProductos />
                  </PrivateRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/pedidos"
              element={
                <Suspense fallback={<LoadingSpinner message="Cargando pedidos..." />}>
                  <PrivateRoute>
                    <AdminPedidos />
                  </PrivateRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/pedidos/:id"
              element={
                <Suspense fallback={<LoadingSpinner message="Cargando detalle del pedido..." />}>
                  <PrivateRoute>
                    <AdminPedidoDetalle />
                  </PrivateRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/visitas"
              element={
                <Suspense fallback={<LoadingSpinner message="Cargando visitas..." />}>
                  <PrivateRoute>
                    <AdminVisitas />
                  </PrivateRoute>
                </Suspense>
              }
            />

            {/* Redirecciones y 404 */}
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </CartProvider>
    </NotificacionesProvider>
  )
}

export default App
