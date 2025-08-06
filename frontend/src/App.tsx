// ✅ FILE: src/App.tsx
import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
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

// 📦 Admin (lazy load)
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const DashboardProductos = lazy(() => import('./components/DashboardProductos'))
const AdminPedidos = lazy(() => import('./components/AdminPedidos'))
const AdminPedidoDetalle = lazy(() => import('./components/AdminPedidoDetalle'))

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
          </Routes>
        </div>
      </CartProvider>
    </NotificacionesProvider>
  )
}

export default App
